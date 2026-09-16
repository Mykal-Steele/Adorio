import { useCallback, useEffect, useRef, useState } from 'react';
import { searchUsers } from '@/api/users';
import { isAbortError } from '@/utils/errorHandling';

export interface MentionCandidate {
  _id: string;
  username: string;
}

interface TriggerRange {
  start: number;
  cursor: number;
}

const TRIGGER_PATTERN = /(^|[\s(])@([a-zA-Z0-9_]{1,20})$/;

// Finds an @mention query directly before the cursor, e.g. "hi @ali|".
const findTrigger = (value: string, cursor: number): TriggerRange | null => {
  const before = value.slice(0, cursor);
  const match = TRIGGER_PATTERN.exec(before);
  if (!match) return null;
  const query = match[2];
  return { start: cursor - query.length - 1, cursor };
};

const MAX_CACHED_QUERIES = 50;
const SERVER_PAGE_SIZE = 8;

// Prefix cache: typing "a" -> "al" -> "ali" reuses the earlier response
// instead of hitting the server per keystroke. If a cached prefix returned
// fewer than a full page, the server already exhausted that prefix, so any
// longer query is answered purely from cache with zero requests.
const lookupCache = (cache: Map<string, MentionCandidate[]>, query: string) => {
  const lower = query.toLowerCase();
  let longest: string | null = null;
  cache.forEach((_, key) => {
    if (lower.startsWith(key) && (longest === null || key.length > longest.length)) {
      longest = key;
    }
  });
  if (longest === null) return null;
  const candidates = (cache.get(longest) ?? []).filter((u) =>
    u.username.toLowerCase().startsWith(lower),
  );
  return {
    candidates,
    exhaustive: (cache.get(longest) ?? []).length < SERVER_PAGE_SIZE,
    exact: longest === lower,
  };
};

const storeCache = (
  cache: Map<string, MentionCandidate[]>,
  query: string,
  users: MentionCandidate[],
) => {
  cache.set(query.toLowerCase(), users);
  if (cache.size > MAX_CACHED_QUERIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
};

const useMentionAutocomplete = (
  inputRef: React.RefObject<HTMLInputElement | null>,
  value: string,
  onChange: (next: string) => void,
) => {
  const [suggestions, setSuggestions] = useState<MentionCandidate[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const mentionMapRef = useRef(new Map<string, string>());
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);
  const triggerRef = useRef<TriggerRange | null>(null);
  const cacheRef = useRef(new Map<string, MentionCandidate[]>());

  const close = useCallback(() => {
    setOpen(false);
    setSuggestions([]);
    triggerRef.current = null;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const syncTrigger = useCallback(() => {
    const el = inputRef.current;
    if (!el || document.activeElement !== el) return;
    const trigger = findTrigger(el.value, el.selectionStart ?? el.value.length);
    triggerRef.current = trigger;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!trigger) {
      close();
      return;
    }
    const query = el.value.slice(trigger.start + 1, trigger.cursor);
    const cached = lookupCache(cacheRef.current, query);
    if (cached && (cached.exact || cached.exhaustive)) {
      setSuggestions(cached.candidates.slice(0, SERVER_PAGE_SIZE));
      setActiveIndex(0);
      setOpen(cached.candidates.length > 0);
      return;
    }
    if (cached && cached.candidates.length > 0) {
      setSuggestions(cached.candidates.slice(0, SERVER_PAGE_SIZE));
      setActiveIndex(0);
      setOpen(true);
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    timerRef.current = window.setTimeout(async () => {
      timerRef.current = null;
      try {
        const users = await searchUsers(query, controller.signal);
        if (!Array.isArray(users)) return;
        const list = users.slice(0, SERVER_PAGE_SIZE);
        storeCache(cacheRef.current, query, list);
        setSuggestions(list);
        setActiveIndex(0);
        setOpen(list.length > 0);
      } catch (err) {
        if (!isAbortError(err)) close();
      }
    }, 250);
  }, [close, inputRef]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const applySuggestion = useCallback(
    (candidate: MentionCandidate) => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const next = `${value.slice(0, trigger.start)}@${candidate.username} ${value.slice(trigger.cursor)}`;
      mentionMapRef.current.set(candidate.username, candidate._id);
      onChange(next);
      close();
      requestAnimationFrame(() => {
        const el = inputRef.current;
        if (!el) return;
        const pos = trigger.start + candidate.username.length + 2;
        el.focus();
        el.setSelectionRange(pos, pos);
      });
    },
    [close, inputRef, onChange, value],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open || suggestions.length === 0) {
        if (e.key === 'Escape') close();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applySuggestion(suggestions[activeIndex] ?? suggestions[0]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    },
    [activeIndex, applySuggestion, close, open, suggestions],
  );

  // Ids for @usernames still present in the submitted text.
  const resolveMentionIds = useCallback((text: string): string[] => {
    const ids = new Set<string>();
    const pattern = /(^|[\s(])@([a-zA-Z0-9_]{3,20})/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const id = mentionMapRef.current.get(match[2]);
      if (id) ids.add(id);
    }
    return [...ids];
  }, []);

  const resetMentions = useCallback(() => {
    mentionMapRef.current.clear();
    close();
  }, [close]);

  return {
    suggestions,
    activeIndex,
    mentionOpen: open,
    setActiveIndex,
    applySuggestion,
    handleMentionKeyDown: handleKeyDown,
    syncMentionTrigger: syncTrigger,
    resolveMentionIds,
    resetMentions,
    closeMentions: close,
  };
};

export default useMentionAutocomplete;
