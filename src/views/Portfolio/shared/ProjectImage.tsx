import Image from 'next/image';
import type { Project } from '../data/portfolio';
import { serif } from '../constants/fonts';
import { TechLogo, skillIdForLanguage } from './TechLogo';

// The project's screenshot, or its language logo and name when there is no screenshot yet
export function ProjectImage({
  project,
  sizes,
  priority = false,
}: {
  project: Project;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: '16 / 10',
        overflow: 'hidden',
        background:
          project.image?.fit === 'contain'
            ? '#ffffff'
            : `color-mix(in srgb, ${project.color} 12%, var(--ide-bg-4))`,
        border: '1px solid var(--ide-border)',
      }}
    >
      {project.image ? (
        <Image
          src={project.image.src}
          alt={project.image.alt}
          fill
          priority={priority}
          sizes={sizes}
          style={
            project.image.fit === 'contain'
              ? { objectFit: 'contain', padding: 6 }
              : { objectFit: 'cover', objectPosition: 'top left' }
          }
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center" style={{ gap: 12 }}>
          {project.language && <TechLogo id={skillIdForLanguage(project.language)} size={44} />}
          <span
            style={{
              fontFamily: serif,
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--ide-text-2)',
              textAlign: 'center',
              padding: '0 16px',
            }}
          >
            {project.name}
          </span>
        </div>
      )}
    </div>
  );
}
