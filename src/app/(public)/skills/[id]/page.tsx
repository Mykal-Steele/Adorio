import type { Metadata } from 'next';
import { SkillDetail } from '@/views/Portfolio/pages/SkillDetail';
import { portfolioData } from '@/views/Portfolio/data/portfolio';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const skill = portfolioData.skills.find((s) => s.id === id);
  const title = skill ? `${skill.name} | Oakar Oo` : 'Skill | Oakar Oo';
  const description = skill
    ? `How Oakar Oo uses ${skill.name}, and the projects built with it.`
    : 'Skill details.';
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://adorio.space/skills/${id}`,
      siteName: 'Oakar Oo',
      images: [
        {
          url: 'https://adorio.space/og.png',
          width: 1200,
          height: 630,
          alt: 'Oakar Oo, backend developer',
        },
      ],
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

// Every id is known at build time, so anything else is a real 404
export const dynamicParams = false;

export async function generateStaticParams() {
  return portfolioData.skills.map((s) => ({ id: s.id }));
}

export default async function SkillDetailPage({ params }: Props) {
  const { id } = await params;
  return <SkillDetail id={id} />;
}
