'use client'
import useAuthBootstrap from '@/hooks/useAuthBootstrap'
import usePageTracking from '@/hooks/usePageTracking'

export default function AuthBootstrapper() {
  useAuthBootstrap()
  usePageTracking()
  return null
}
