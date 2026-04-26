import type { Metadata } from 'next'
import DataLookupClient from './DataLookupClient'

export const metadata: Metadata = {
  title: 'Data Lookup',
  description: 'Visitor analytics dashboard.',
  robots: { index: false, follow: false },
}

export default function DataLookupPage() {
  return <DataLookupClient />
}
