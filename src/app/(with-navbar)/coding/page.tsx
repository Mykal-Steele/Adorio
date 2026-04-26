import type { Metadata } from 'next'
import Coding from '@/views/Coding'

export const metadata: Metadata = {
  title: 'Coding Challenges',
  description: 'Solve JavaScript problems in your browser. Arrays, strings, algorithms, data structures.',
}

export default function CodingPage() {
  return <Coding />
}
