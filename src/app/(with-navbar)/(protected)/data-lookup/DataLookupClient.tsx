'use client'
import dynamic from 'next/dynamic'

const DataLookup = dynamic(() => import('@/views/DataLookup'), { ssr: false })

export default function DataLookupClient() {
  return <DataLookup />
}
