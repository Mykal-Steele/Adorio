import {
  siArchlinux,
  siBun,
  siDocker,
  siExpress,
  siGit,
  siGnubash,
  siHono,
  siHyprland,
  siJavascript,
  siLinux,
  siMongodb,
  siNextdotjs,
  siNodedotjs,
  siPnpm,
  siPostgresql,
  siPrisma,
  siPython,
  siReact,
  siSqlite,
  siTailwindcss,
  siTypescript,
  siVim,
  type SimpleIcon,
} from 'simple-icons';
import { serif } from '../constants/fonts';

const ICONS: Record<string, SimpleIcon> = {
  typescript: siTypescript,
  javascript: siJavascript,
  python: siPython,
  react: siReact,
  nextjs: siNextdotjs,
  tailwindcss: siTailwindcss,
  nodejs: siNodedotjs,
  bun: siBun,
  express: siExpress,
  hono: siHono,
  postgresql: siPostgresql,
  sqlite: siSqlite,
  mongodb: siMongodb,
  prisma: siPrisma,
  git: siGit,
  linux: siLinux,
  docker: siDocker,
  archlinux: siArchlinux,
  hyprland: siHyprland,
  vim: siVim,
  bash: siGnubash,
  pnpm: siPnpm,
};

// simple-icons has no mark for these, so they get a lettered tile
const LETTERS: Record<string, string> = { java: 'Java', sql: 'SQL', azure: 'Az', mise: 'mi' };

// Brand colors too pale to see on paper
const COLOR_OVERRIDES: Record<string, string> = { linux: 'var(--ide-text-1)', hyprland: '#1a8fb0' };

// Near-black brand colors vanish on the dark themes, so they follow the text color
function brandColor(hex: string) {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b < 70 ? 'var(--ide-text-1)' : `#${hex}`;
}

export function TechLogo({ id, size = 22 }: { id: string; size?: number }) {
  const icon = ICONS[id];
  if (!icon) {
    return (
      <span
        aria-hidden="true"
        style={{
          fontFamily: serif,
          fontSize: (LETTERS[id] ?? '').length > 3 ? size * 0.5 : size * 0.62,
          fontWeight: 700,
          lineHeight: `${size}px`,
          color: 'var(--ide-text-2)',
        }}
      >
        {LETTERS[id] ?? id.slice(0, 2)}
      </span>
    );
  }
  return (
    <svg
      role="img"
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={COLOR_OVERRIDES[id] ?? brandColor(icon.hex)}
    >
      <path d={icon.path} />
    </svg>
  );
}

export function skillIdForLanguage(language: string) {
  return language.toLowerCase().replace(/[^a-z]/g, '');
}
