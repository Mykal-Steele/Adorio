import type { Metadata } from 'next'
import TsBussing from '@/views/TsBussing'

export const metadata: Metadata = {
  title: 'Oakar Oo — Portfolio',
  description: 'Full-stack developer. Web apps, games, digital art. React, Next.js, Node.js, MongoDB.',
  openGraph: {
    title: 'Oakar Oo — Portfolio | Adorio',
    description: 'View my projects: web apps, rhythm games, smart city demos.',
    images: [{ url: 'https://i.ibb.co/KxH3wXDS/download-3.png' }],
  },
}

export default function LandingPage() {
  return <TsBussing />
}
