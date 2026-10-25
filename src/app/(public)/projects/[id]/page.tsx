import type { Metadata } from 'next';
import { ProjectDetail } from '@/views/Portfolio/pages/ProjectDetail';
import { portfolioData } from '@/views/Portfolio/data/portfolio';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = portfolioData.projects.find((p) => p.id === id);
  const title = project ? `${project.name} | Oakar Oo` : 'Project | Oakar Oo';
  const description = project?.summary ?? 'Project details.';
  return {
    title,
    description,
    keywords: project ? [project.name, 'Oakar Oo', ...project.stack] : ['Oakar Oo', 'project'],
    openGraph: {
      title,
      description,
      url: `https://adorio.space/projects/${id}`,
      siteName: 'Oakar Oo',
      type: 'article',
      images: [
        project?.image
          ? { url: `https://adorio.space${project.image.src}`, alt: project.image.alt }
          : {
              url: 'https://i.ibb.co/KxH3wXDS/download-3.png',
              width: 1200,
              height: 630,
              alt: `${project?.name ?? 'Project'} by Oakar Oo`,
            },
      ],
    },
    twitter: {
      card: project?.image ? 'summary_large_image' : 'summary',
      title,
      description,
    },
  };
}

// Every id is known at build time, so anything else is a real 404
export const dynamicParams = false;

export async function generateStaticParams() {
  return portfolioData.projects.map((p) => ({ id: p.id }));
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  return <ProjectDetail id={id} />;
}
