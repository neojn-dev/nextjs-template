import { MetadataRoute } from 'next'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  // Default robots.txt
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
