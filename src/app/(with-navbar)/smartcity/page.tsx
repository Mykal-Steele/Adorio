import type { Metadata } from 'next'
import SmartCity from '@/views/SmartCity'

export const metadata: Metadata = {
  title: 'Smart City APIs',
  description: 'SCB API documentation: DeepLink Mobile, Direct Debit.',
}

export default function SmartCityPage() {
  return <SmartCity />
}
