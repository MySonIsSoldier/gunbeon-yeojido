import { env } from 'cloudflare:workers';
import { sitemapDocument } from '@/lib/search-policy';
export function GET() {
  return new Response(sitemapDocument(env as Record<string, unknown>), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
