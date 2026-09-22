// Engine-agnostic editor preferences — shared by both the CodeMirror and
// Monaco implementations (and the settings panel, via useSyncExternalStore)
// so switching engines mid-session keeps the same wrap/font-size/engine
// choice instead of resetting it. Each engine's own component subscribes and
// applies these through its own API (CodeMirror compartments, Monaco
// updateOptions) — this file knows nothing about either editor.
export interface EditorSettings {
  wrap: boolean;
  fontSize: number;
}

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  wrap: true,
  fontSize: 16,
};

export const MIN_FONT_SIZE = 11;
export const MAX_FONT_SIZE = 24;

let settings: EditorSettings = { ...DEFAULT_EDITOR_SETTINGS };
const settingsListeners = new Set<() => void>();

export const subscribeEditorSettings = (listener: () => void) => {
  settingsListeners.add(listener);
  return () => {
    settingsListeners.delete(listener);
  };
};

export const getEditorSettings = () => settings;

const patchSettings = (patch: Partial<EditorSettings>) => {
  settings = { ...settings, ...patch };
  settingsListeners.forEach((listener) => listener());
};

export const setWrap = (wrap: boolean) => patchSettings({ wrap });

export const setFontSize = (fontSize: number) =>
  patchSettings({
    fontSize: Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Math.round(fontSize))),
  });

export const toggleWrap = () => patchSettings({ wrap: !settings.wrap });

export const changeFontSize = (delta: number) => setFontSize(settings.fontSize + delta);

export const resetEditorSettings = () => patchSettings({ ...DEFAULT_EDITOR_SETTINGS });

// --- Editor engine choice ---------------------------------------------
export type EditorEngine = 'monaco' | 'codemirror';

const ENGINE_STORAGE_KEY = 'coding_editor_engine';
// Monaco is VS Code's actual editor — real selection/bracket/cursor
// behavior instead of an approximation, so it's the default for anyone who
// hasn't picked yet.
const DEFAULT_ENGINE: EditorEngine = 'monaco';

const readStoredEngine = (): EditorEngine => {
  if (typeof window === 'undefined') return DEFAULT_ENGINE;
  const stored = window.localStorage.getItem(ENGINE_STORAGE_KEY);
  return stored === 'monaco' || stored === 'codemirror' ? stored : DEFAULT_ENGINE;
};

let engine: EditorEngine = readStoredEngine();
const engineListeners = new Set<() => void>();

export const subscribeEditorEngine = (listener: () => void) => {
  engineListeners.add(listener);
  return () => {
    engineListeners.delete(listener);
  };
};

export const getEditorEngine = () => engine;

export const setEditorEngine = (next: EditorEngine) => {
  engine = next;
  if (typeof window !== 'undefined') window.localStorage.setItem(ENGINE_STORAGE_KEY, next);
  engineListeners.forEach((listener) => listener());
};
