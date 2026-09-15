import type { Metadata } from 'next';
import Practice from '@/views/Coding/pages/Practice';
import { getClasses, getClass } from '@/views/Coding/constants/classes';

interface Props {
  params: Promise<{ classId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { classId } = await params;
  const cls = getClass(classId);
  return {
    title: cls ? `${cls.name} | Coding Challenges` : 'Coding Challenges',
    description: cls?.description ?? 'Practice coding problems in your browser.',
  };
}

export async function generateStaticParams() {
  return getClasses().map((c) => ({ classId: c.id }));
}

export default async function CodingClassPage({ params }: Props) {
  const { classId } = await params;
  return <Practice classId={classId} />;
}
