import Link from 'next/link';
import { sans } from '../constants/fonts';
import { TechLogo } from './TechLogo';

const tileStyle = {
  width: 48,
  height: 48,
  display: 'grid',
  placeItems: 'center',
  background: 'var(--ide-bg-3)',
  border: '1px solid var(--ide-border)',
  borderRadius: 10,
  color: 'inherit',
  textDecoration: 'none',
} as const;

// Logo with its name in a tooltip on hover and keyboard focus
export function LogoTile({ id, name, href }: { id: string; name: string; href?: string }) {
  const tooltip = (
    <span
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 translate-y-1 whitespace-nowrap opacity-0 transition-[opacity,transform] duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
      style={{
        padding: '4px 8px',
        fontFamily: sans,
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--ide-bg-3)',
        background: 'var(--ide-text-1)',
        borderRadius: 4,
      }}
    >
      {name}
    </span>
  );

  return href ? (
    <Link href={href} aria-label={name} className="pf-tile group relative" style={tileStyle}>
      <TechLogo id={id} />
      {tooltip}
    </Link>
  ) : (
    <span tabIndex={0} aria-label={name} className="pf-tile group relative" style={tileStyle}>
      <TechLogo id={id} />
      {tooltip}
    </span>
  );
}
