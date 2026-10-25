'use client';

import { useEffect, useState } from 'react';
import { useIDE } from './context/IDEContext';
import { serif } from './constants/fonts';
import { ThemeHint } from './shared/ThemeHint';
import { ThemeSwitcher } from './shared';

export function TitleBar() {
  const { themeHintEnabled, setThemeHintEnabled } = useIDE();
  // Opening the theme menu hides the hint until the next load
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (themeHintEnabled) setClosed(false);
  }, [themeHintEnabled]);

  return (
    <div
      className="relative shrink-0 flex items-center justify-between px-4"
      style={{
        height: 52,
        borderBottom: '1px solid var(--ide-border)',
        background: 'var(--ide-bg-1)',
      }}
    >
      <span
        style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--ide-text-1)',
        }}
      >
        Portfolio
      </span>

      <ThemeSwitcher showLabel onOpen={() => setClosed(true)} />
      {themeHintEnabled && !closed && (
        <ThemeHint onDismissForever={() => setThemeHintEnabled(false)} />
      )}
    </div>
  );
}
