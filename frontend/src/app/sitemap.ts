import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nod-live.vercel.app'
  
  // Base public pages to crawl
  const routes = [
    '',
    '/tenders',
    '/public/marketplace/designers',
    '/public/marketplace/projects',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  return [...routes]
}
