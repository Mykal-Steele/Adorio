import { Suspense } from 'react'
import type { Metadata } from 'next'
import Register from '@/views/Register'

export const metadata: Metadata = {
  title: 'Register',
  robots: { index: false, follow: false },
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <Register />
    </Suspense>
  )
}
