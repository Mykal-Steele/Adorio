import {
  siArchlinux,
  siBun,
  siCloudflare,
  siDocker,
  siExpress,
  siFigma,
  siGit,
  siGithubactions,
  siGnubash,
  siHono,
  siHyprland,
  siJavascript,
  siLinux,
  siMongodb,
  siNestjs,
  siNextdotjs,
  siNeovim,
  siNginx,
  siNodedotjs,
  siPnpm,
  siPostgresql,
  siPrisma,
  siPython,
  siReact,
  siSqlite,
  siSwagger,
  siTailwindcss,
  siTypescript,
  type SimpleIcon,
} from 'simple-icons';
import { Database } from 'lucide-react';
import { serif } from '../constants/fonts';
import { EXTRA_LOGOS } from './extraLogos';

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
  nestjs: siNestjs,
  hono: siHono,
  postgresql: siPostgresql,
  sqlite: siSqlite,
  mongodb: siMongodb,
  prisma: siPrisma,
  git: siGit,
  linux: siLinux,
  docker: siDocker,
  nginx: siNginx,
  githubactions: siGithubactions,
  cloudflare: siCloudflare,
  swagger: siSwagger,
  figma: siFigma,
  archlinux: siArchlinux,
  hyprland: siHyprland,
  neovim: siNeovim,
  bash: siGnubash,
  pnpm: siPnpm,
};

// Brand colors too pale to see on paper
const COLOR_OVERRIDES: Record<string, string> = {
  linux: 'var(--ide-text-1)',
  hyprland: '#1a8fb0',
  swagger: '#4f8a10',
};

// Near-black brand colors vanish on the dark themes, so they follow the text color
function brandColor(hex: string) {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b < 70 ? 'var(--ide-text-1)' : `#${hex}`;
}

export function TechLogo({ id, size = 22 }: { id: string; size?: number }) {
  const icon = ICONS[id];
  const extra = EXTRA_LOGOS[id];
  if (extra) {
    return (
      <svg
        role="img"
        aria-hidden="true"
        viewBox={extra.viewBox}
        width={size}
        height={size}
        style={{ color: 'var(--ide-text-1)' }}
      >
        {extra.body}
      </svg>
    );
  }
  // SQL is a language, not a brand, so it gets a database symbol
  if (id === 'sql') {
    return <Database aria-hidden="true" size={size} color="#3f7fc4" strokeWidth={1.8} />;
  }
  // Anything else without a logo gets its first two letters
  if (!icon) {
    return (
      <span
        aria-hidden="true"
        style={{
          fontFamily: serif,
          fontSize: size * 0.62,
          fontWeight: 700,
          lineHeight: `${size}px`,
          color: 'var(--ide-text-2)',
        }}
      >
        {id.slice(0, 2)}
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
