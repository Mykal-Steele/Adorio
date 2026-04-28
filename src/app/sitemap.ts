import type { MetadataRoute } from 'next';

const BASE = 'https://adorio.space';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/home`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/coding`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/cao`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/rygame`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    {
      url: `${BASE}/smartcity`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];
}
