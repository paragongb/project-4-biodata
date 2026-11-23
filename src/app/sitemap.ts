import type { MetadataRoute } from 'next';
import { projects } from '@/content/projects';

const base = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/projects', '/resume', '/about', ...projects.map((p) => `/projects/${p.slug}`)].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: 'monthly',
  }));
}
