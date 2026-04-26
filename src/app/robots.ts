import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/home', '/coding', '/smartcity', '/tempBeforeReal'],
        disallow: ['/profile', '/sendenv', '/data-lookup', '/rygame', '/login', '/register'],
      },
    ],
    sitemap: 'https://adorio.space/sitemap.xml',
  }
}
