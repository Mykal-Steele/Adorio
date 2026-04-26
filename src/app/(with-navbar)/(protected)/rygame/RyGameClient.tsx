'use client';
import dynamic from 'next/dynamic';

const RyGame = dynamic(() => import('@/views/RyGame'), { ssr: false });

export default function RyGameClient() {
  return <RyGame />;
}
