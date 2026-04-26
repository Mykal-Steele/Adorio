import type { Metadata } from 'next'
import TempBeforeReal from '@/views/tempBeforeReal'

export const metadata: Metadata = {
  title: 'Adorio',
  description: 'A creative platform for builders, gamers, and makers.',
}

export default function TempBeforeRealPage() {
  return <TempBeforeReal />
}
