import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/tenders',
        '/public/marketplace/designers',
        '/public/marketplace/projects',
      ],
      disallow: [
        '/dashboard/',
        '/admin/',
        '/api/',
        '/login',
        '/signup',
        '/reset-password',
        '/public/showcase/',
      ],
    },
    sitemap: 'https://nod-live.vercel.app/sitemap.xml',
  }
}
