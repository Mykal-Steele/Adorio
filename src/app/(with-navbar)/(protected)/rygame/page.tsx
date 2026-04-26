import type { Metadata } from 'next'
import RyGameClient from './RyGameClient'

export const metadata: Metadata = {
  title: 'Rhythm Dots',
  description: 'A browser canvas rhythm game. Hit the dots in time with the music.',
  robots: { index: false, follow: false },
}

export default function RyGamePage() {
  return <RyGameClient />
}
