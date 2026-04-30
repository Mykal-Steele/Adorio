import type { Metadata } from 'next';
import { ProjectDetail } from '@/views/Portfolio/pages/ProjectDetail';
import { portfolioData } from '@/views/Portfolio/data/portfolio';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = portfolioData.projects.find((p) => p.id === id);
  const title = project ? `${project.name} — Oakar Oo` : 'Project — Oakar Oo';
  const description = project?.description ?? 'Project details.';
  return {
    title,
    description,
    keywords: project
      ? [project.name, 'Oakar Oo', project.language, ...project.tags.map((t) => t.replace('#', ''))]
      : ['Oakar Oo', 'project'],
    openGraph: {
      title,
      description,
      url: `https://adorio.space/projects/${id}`,
      siteName: 'Oakar Oo',
      type: 'article',
      images: [
        {
          url: 'https://i.ibb.co/KxH3wXDS/download-3.png',
          width: 1200,
          height: 630,
          alt: `${project?.name ?? 'Project'} by Oakar Oo`,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export async function generateStaticParams() {
  return portfolioData.projects.map((p) => ({ id: p.id }));
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  return <ProjectDetail id={id} />;
}
