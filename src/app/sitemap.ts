import type { MetadataRoute } from 'next'

const BASE = 'https://adorio.space'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/home`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/coding`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/smartcity`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE}/tempBeforeReal`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]
}
