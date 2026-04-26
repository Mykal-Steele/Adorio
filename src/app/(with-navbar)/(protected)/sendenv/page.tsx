import type { Metadata } from 'next'
import SendEnv from '@/views/SendEnv'

export const metadata: Metadata = {
  title: 'Send Env',
  robots: { index: false, follow: false },
}

export default function SendEnvPage() {
  return <SendEnv />
}
