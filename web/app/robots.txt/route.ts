import { env } from 'cloudflare:workers';
import { robotsDocument } from '@/lib/search-policy';
export function GET() {
  return new Response(robotsDocument(env as Record<string, unknown>), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
