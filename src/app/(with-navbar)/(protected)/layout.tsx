'use client'
import { useEffect } from 'react'
import { useAppSelector } from '../../../redux/hooks'
import { useRouter, usePathname } from 'next/navigation'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { token, isAuthLoading } = useAppSelector((s) => s.user)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isAuthLoading && !token) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthLoading, token, router, pathname])

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent mb-4" />
          <p className="text-gray-300 text-lg">Loading Adorio...</p>
        </div>
      </div>
    )
  }

  if (!token) return null

  return <>{children}</>
}
