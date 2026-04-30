import type { MetadataRoute } from 'next';
import { portfolioData } from '@/views/Portfolio/data/portfolio';

const BASE = 'https://adorio.space';

export default function sitemap(): MetadataRoute.Sitemap {
  const projectEntries: MetadataRoute.Sitemap = portfolioData.projects.map((p) => ({
    url: `${BASE}/projects/${p.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    { url: `${BASE}/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/projects`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...projectEntries,
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
    { url: `${BASE}/social`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE}/coding`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    {
      url: `${BASE}/smartcity`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    { url: `${BASE}/cao`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];
}
