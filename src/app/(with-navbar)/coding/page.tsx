import type { Metadata } from 'next';
import ClassCatalog from '@/views/Coding/pages/ClassCatalog';

export const metadata: Metadata = {
  title: 'Coding Challenges',
  description: 'Pick a class and practice coding problems, written and graded in your browser.',
};

export default function CodingPage() {
  return <ClassCatalog />;
}
