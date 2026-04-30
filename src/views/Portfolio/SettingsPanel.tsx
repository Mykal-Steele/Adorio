'use client';

import { useEffect, useRef } from 'react';
import { X, Monitor } from 'lucide-react';
import { useTheme, themeLabels, themeAccents, type ThemeName } from './context/ThemeContext';
import { useIDE } from './context/IDEContext';
import { sans, mono } from './constants/fonts';

const FONT_SIZES = [10, 11, 12, 13, 14, 15, 16] as const;

export function SettingsPanel() {
  const { theme, setTheme, fontSize, setFontSize } = useTheme();
  const { toggleSettings } = useIDE();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleSettings();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [toggleSettings]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.65)' }}
        onClick={toggleSettings}
      />

      {/* Panel */}
      <div
        className="relative flex flex-col"
        style={{
          width: 540,
          maxWidth: '92vw',
          maxHeight: '80vh',
          background: 'var(--ide-bg-2)',
          border: '1px solid var(--ide-border-medium)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          animation: 'settingsFadeIn 0.15s ease-out',
        }}
      >
        {/* Header */}
        <div
          className="shrink-0 flex items-center justify-between px-5"
          style={{
            height: 40,
            background: 'var(--ide-bg-0)',
            borderBottom: '1px solid var(--ide-border)',
          }}
        >
          <div className="flex items-center gap-2">
            <Monitor size={13} color="var(--ide-text-5)" />
            <span
              style={{
                fontSize: 11,
                fontFamily: sans,
                color: 'var(--ide-text-2)',
                fontWeight: 600,
                letterSpacing: '0.06em',
              }}
            >
              Settings
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              style={{
                fontSize: 9,
                fontFamily: mono,
                color: 'var(--ide-text-7)',
                letterSpacing: '0.05em',
              }}
            >
              ESC to close
            </span>
            <button
              onClick={toggleSettings}
              aria-label="Close settings"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                color: 'var(--ide-text-6)',
              }}
              className="ide-hover-icon"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--ide-bg-5) transparent' }}
        >
          {/* Appearance section */}
          <div
            className="px-6 pt-6 pb-4"
            style={{ borderBottom: '1px solid var(--ide-border-subtle)' }}
          >
            <div
              style={{
                fontSize: 8,
                fontFamily: sans,
                color: 'var(--ide-text-6)',
                letterSpacing: '0.14em',
                fontWeight: 700,
                marginBottom: 20,
              }}
            >
              APPEARANCE
            </div>

            {/* Color Theme */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <label
                  style={{
                    fontSize: 12,
                    fontFamily: sans,
                    color: 'var(--ide-text-2)',
                    fontWeight: 500,
                  }}
                >
                  Color Theme
                </label>
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: mono,
                    color: 'var(--ide-accent)',
                    background: 'var(--ide-accent-a10)',
                    padding: '2px 8px',
                  }}
                >
                  {themeLabels[theme]}
                </span>
              </div>
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                {(Object.keys(themeLabels) as ThemeName[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    aria-label={`Switch to ${themeLabels[t]} theme`}
                    aria-pressed={theme === t}
                    className="flex flex-col items-center gap-2 py-3 px-2 transition-all"
                    style={{
                      background: theme === t ? 'var(--ide-border-medium)' : 'transparent',
                      border:
                        theme === t
                          ? `1px solid ${themeAccents[t]}40`
                          : '1px solid var(--ide-border-subtle)',
                      cursor: 'pointer',
                      borderRadius: 4,
                    }}
                  >
                    {/* Color swatch */}
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${themeAccents[t]} 0%, ${themeAccents[t]}60 100%)`,
                        border:
                          theme === t ? `2px solid ${themeAccents[t]}` : '2px solid transparent',
                      }}
                    />
                    <span
                      style={{
                        fontSize: 9,
                        fontFamily: sans,
                        color: theme === t ? 'var(--ide-text-1)' : 'var(--ide-text-5)',
                        letterSpacing: '0.04em',
                        textAlign: 'center',
                        lineHeight: 1.3,
                      }}
                    >
                      {themeLabels[t].split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Editor Font Size */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label
                  htmlFor="font-size-slider"
                  style={{
                    fontSize: 12,
                    fontFamily: sans,
                    color: 'var(--ide-text-2)',
                    fontWeight: 500,
                  }}
                >
                  Editor Font Size
                </label>
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: mono,
                    color: 'var(--ide-accent)',
                    fontWeight: 600,
                  }}
                >
                  {fontSize}px
                </span>
              </div>
              {/* Size presets */}
              <div className="flex items-center gap-2 mb-3">
                {FONT_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    aria-label={`Set editor font size to ${size}px`}
                    aria-pressed={fontSize === size}
                    style={{
                      background: fontSize === size ? 'var(--ide-accent-a12)' : 'var(--ide-bg-3)',
                      border: `1px solid ${fontSize === size ? 'var(--ide-accent-a30)' : 'var(--ide-border)'}`,
                      color: fontSize === size ? 'var(--ide-accent)' : 'var(--ide-text-5)',
                      fontSize: 10,
                      fontFamily: mono,
                      padding: '4px 10px',
                      cursor: 'pointer',
                      borderRadius: 2,
                      transition: 'all 0.1s',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <input
                id="font-size-slider"
                type="range"
                min={10}
                max={16}
                step={1}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                aria-valuemin={10}
                aria-valuemax={16}
                aria-valuenow={fontSize}
                aria-valuetext={`${fontSize} pixels`}
                style={{ width: '100%', accentColor: 'var(--ide-accent)', cursor: 'pointer' }}
              />
              <div className="flex justify-between mt-1">
                <span style={{ fontSize: 9, fontFamily: mono, color: 'var(--ide-text-7)' }}>
                  10px
                </span>
                <span style={{ fontSize: 9, fontFamily: mono, color: 'var(--ide-text-7)' }}>
                  16px
                </span>
              </div>
            </div>
          </div>

          {/* About section */}
          <div className="px-6 py-5">
            <div
              style={{
                fontSize: 8,
                fontFamily: sans,
                color: 'var(--ide-text-6)',
                letterSpacing: '0.14em',
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              ABOUT
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: sans,
                    color: 'var(--ide-text-3)',
                    marginBottom: 2,
                  }}
                >
                  Portfolio IDE
                </div>
                <div style={{ fontSize: 10, fontFamily: mono, color: 'var(--ide-text-7)' }}>
                  v2.0.0-stable · Oakar Oo
                </div>
              </div>
              <div
                style={{
                  fontSize: 9,
                  fontFamily: mono,
                  color: 'var(--ide-accent)',
                  background: 'var(--ide-accent-a8)',
                  padding: '2px 8px',
                  border: '1px solid var(--ide-accent-a20)',
                }}
              >
                STABLE
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
