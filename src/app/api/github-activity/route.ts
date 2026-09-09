import { NextResponse } from 'next/server';

export const revalidate = 900;

const GITHUB_USER = 'Mykal-Steele';
const EVENTS_URL = `https://api.github.com/users/${GITHUB_USER}/events/public`;
const GITHUB_HEADERS = {
  'User-Agent': 'adorio.space-portfolio',
  Accept: 'application/vnd.github+json',
};

const MAX_PUSH_LOOKUPS = 5;
const MAX_PR_LOOKUPS = 5;

export interface GithubActivityCommit {
  sha: string;
  message: string;
  repo: string;
  branch: string;
  url: string;
  timestamp: string;
}

export interface GithubActivityPullRequest {
  id: number;
  repo: string;
  title: string;
  status: 'open' | 'merged' | 'closed';
  action: string;
  url: string;
  timestamp: string;
}

export interface GithubActivityResponse {
  commits: GithubActivityCommit[];
  pullRequests: GithubActivityPullRequest[];
  ts: number;
}

type RawGithubEvent = {
  type: string;
  created_at: string;
  repo: { name: string };
  payload: Record<string, unknown>;
};

function branchFromRef(ref: unknown): string {
  return typeof ref === 'string' ? ref.replace('refs/heads/', '') : 'main';
}

// GitHub's merge commits put the actual change summary on the first
// non-empty line after "Merge pull request #N from ..." — surface that
// instead of the generic merge line.
function commitTitle(message: string): string {
  const lines = message.split('\n');
  if (lines[0].startsWith('Merge pull request #')) {
    const rest = lines.slice(1).find((line) => line.trim().length > 0);
    if (rest) return rest.trim();
  }
  return lines[0];
}

async function fetchGithub<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: GITHUB_HEADERS, next: { revalidate } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function resolveCommit(event: RawGithubEvent): Promise<GithubActivityCommit | null> {
  const payload = event.payload as { ref?: string; head?: string };
  if (!payload.head || /^0+$/.test(payload.head)) return null;

  const detail = await fetchGithub<{ sha: string; commit?: { message?: string } }>(
    `https://api.github.com/repos/${event.repo.name}/commits/${payload.head}`,
  );
  if (!detail?.commit?.message) return null;

  return {
    sha: detail.sha.slice(0, 7),
    message: commitTitle(detail.commit.message),
    repo: event.repo.name,
    branch: branchFromRef(payload.ref),
    url: `https://github.com/${event.repo.name}/commit/${detail.sha}`,
    timestamp: event.created_at,
  };
}

async function resolvePullRequest(
  event: RawGithubEvent,
): Promise<GithubActivityPullRequest | null> {
  const payload = event.payload as {
    action?: string;
    number?: number;
    pull_request?: { url?: string };
  };
  const prUrl = payload.pull_request?.url;
  if (!prUrl || typeof payload.number !== 'number') return null;

  const detail = await fetchGithub<{
    title?: string;
    state?: string;
    merged?: boolean;
    html_url?: string;
  }>(prUrl);
  if (!detail?.title || !detail.html_url) return null;

  const status: GithubActivityPullRequest['status'] = detail.merged
    ? 'merged'
    : detail.state === 'open'
      ? 'open'
      : 'closed';

  return {
    id: payload.number,
    repo: event.repo.name,
    title: detail.title,
    status,
    action: payload.action ?? 'updated',
    url: detail.html_url,
    timestamp: event.created_at,
  };
}

export async function GET() {
  try {
    const eventsRes = await fetch(EVENTS_URL, {
      headers: GITHUB_HEADERS,
      next: { revalidate },
    });

    if (!eventsRes.ok) {
      return NextResponse.json({ error: 'GitHub API unavailable' }, { status: 502 });
    }

    const events = (await eventsRes.json()) as RawGithubEvent[];
    if (!Array.isArray(events)) {
      return NextResponse.json({ error: 'Unexpected GitHub response' }, { status: 502 });
    }

    const pushEvents = events.filter((e) => e.type === 'PushEvent').slice(0, MAX_PUSH_LOOKUPS);

    const seenPrs = new Set<string>();
    const prEvents = events
      .filter((e) => {
        if (e.type !== 'PullRequestEvent') return false;
        const number = (e.payload as { number?: number }).number;
        if (number === undefined) return false;
        const key = `${e.repo.name}#${number}`;
        if (seenPrs.has(key)) return false;
        seenPrs.add(key);
        return true;
      })
      .slice(0, MAX_PR_LOOKUPS);

    const [commitResults, prResults] = await Promise.all([
      Promise.all(pushEvents.map(resolveCommit)),
      Promise.all(prEvents.map(resolvePullRequest)),
    ]);

    const body: GithubActivityResponse = {
      commits: commitResults.filter((c): c is GithubActivityCommit => c !== null),
      pullRequests: prResults.filter((p): p is GithubActivityPullRequest => p !== null),
      ts: Date.now(),
    };

    return NextResponse.json(body);
  } catch (err) {
    console.error('[github-activity] fetch error:', err);
    return NextResponse.json({ error: 'Failed to load GitHub activity' }, { status: 500 });
  }
}
