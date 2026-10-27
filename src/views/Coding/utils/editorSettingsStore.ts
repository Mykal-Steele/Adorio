// Editor prefs shared by both engines and the settings panel, so switching
// engines keeps wrap/font size. Each engine applies them its own way, this
// file doesn't know about either editor.
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

export type EditorEngine = 'monaco' | 'codemirror';

const ENGINE_STORAGE_KEY = 'coding_editor_engine';
// Monaco is the real VS Code editor, so it's the default
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
