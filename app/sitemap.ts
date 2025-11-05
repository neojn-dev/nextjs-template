/**
 * SITEMAP.XML GENERATION
 * 
 * Next.js automatically generates sitemap.xml from this file.
 * 
 * WHAT IT DOES:
 * - Generates /sitemap.xml file for search engines
 * - Lists all pages that should be indexed
 * - Provides metadata (lastModified, changeFrequency, priority)
 * 
 * ROUTE: /sitemap.xml
 * 
 * BENEFITS:
 * - Helps search engines discover pages
 * - Improves SEO
 * - Provides page metadata to crawlers
 * - Can include dynamic routes (if needed)
 * 
 * CURRENT IMPLEMENTATION:
 * - Only includes static routes (home page)
 * - No dynamic CMS/blog pages
 * - Can be extended with dynamic routes later
 * 
 * METADATA FIELDS:
 * - url: Full URL of the page
 * - lastModified: When page was last updated
 * - changeFrequency: How often page changes (always, hourly, daily, weekly, monthly, yearly, never)
 * - priority: Relative priority (0.0 to 1.0)
 * 
 * EXTENDING FOR DYNAMIC ROUTES:
 * To add dynamic routes (e.g., blog posts):
 * ```typescript
 * const dynamicRoutes = await fetchBlogPosts().map(post => ({
 *   url: `${baseUrl}/blog/${post.slug}`,
 *   lastModified: post.updatedAt,
 *   changeFrequency: 'weekly' as const,
 *   priority: 0.8,
 * }))
 * return [...staticRoutes, ...dynamicRoutes]
 * ```
 * 
 * BASE URL:
 * Uses NEXT_PUBLIC_BASE_URL environment variable if set.
 * Falls back to http://localhost:3000 for development.
 * 
 * PRODUCTION:
 * Set NEXT_PUBLIC_BASE_URL in production environment:
 * NEXT_PUBLIC_BASE_URL=https://yourdomain.com
 */

import { MetadataRoute } from 'next'

/**
 * SITEMAP GENERATOR FUNCTION
 * 
 * Generates sitemap.xml content for search engines.
 * 
 * @returns Sitemap array with page metadata
 * 
 * OUTPUT FORMAT:
 * ```xml
 * <?xml version="1.0" encoding="UTF-8"?>
 * <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
 *   <url>
 *     <loc>https://yourdomain.com/</loc>
 *     <lastmod>2024-01-01T00:00:00.000Z</lastmod>
 *     <changefreq>weekly</changefreq>
 *     <priority>1.0</priority>
 *   </url>
 * </urlset>
 * ```
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /**
   * BASE URL DETERMINATION
   * 
   * Gets base URL from environment variable or defaults to localhost.
   * Used for constructing full URLs in sitemap.
   */
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  /**
   * STATIC ROUTES CONFIGURATION
   * 
   * Defines static pages that should be indexed.
   * 
   * CURRENT ROUTES:
   * - Home page (/)
   * 
   * METADATA:
   * - url: Full URL of the page
   * - lastModified: Current date (updated when sitemap regenerates)
   * - changeFrequency: 'weekly' (page changes weekly)
   * - priority: 1.0 (highest priority - home page)
   */
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl, // Home page URL
      lastModified: new Date(), // Current date
      changeFrequency: 'weekly', // How often page changes
      priority: 1, // Highest priority (0.0 to 1.0)
    }
  ]

  /**
   * DYNAMIC ROUTES
   * 
   * No dynamic CMS pages in this template.
   * Can be extended later to include:
   * - Blog posts
   * - Product pages
   * - User profiles (if public)
   * - etc.
   * 
   * EXAMPLE:
   * ```typescript
   * const dynamicRoutes = await fetchDynamicPages()
   * return [...staticRoutes, ...dynamicRoutes]
   * ```
   */
  // No dynamic CMS pages in this template

  /**
   * RETURN SITEMAP
   * 
   * Returns combined static routes (and dynamic routes if added).
   */
  return [...staticRoutes]
}