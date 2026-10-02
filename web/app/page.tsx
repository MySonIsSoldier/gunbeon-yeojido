import PassportApp from '@/components/passport-app';
import PublicHome from '@/components/public-home';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { env } from 'cloudflare:workers';
import { currentAccount } from '@/lib/account-server';
import { cookieValue, validTestSession } from '@/lib/test-access';
import {
  publicMetadata,
  privateHomeRequest,
  SEARCH_ORIGIN,
  SERVICE_TITLE,
  SERVICE_DESCRIPTION,
} from '@/lib/search-policy';

export const dynamic = 'force-dynamic';
type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export async function generateMetadata() {
  const requestHeaders = await headers();
  const metadata = publicMetadata(
    env as Record<string, unknown>,
    '/',
    SERVICE_TITLE,
    SERVICE_DESCRIPTION,
  );
  if (privateHomeRequest(new URL(SEARCH_ORIGIN), requestHeaders.get('cookie')))
    metadata.robots = { index: false, follow: false };
  return metadata;
}
export default async function Home({ searchParams }: HomeProps) {
  const vars = env as Record<string, unknown>;
  const requestHeaders = await headers();
  const cookie = requestHeaders.get('cookie');
  const account = await currentAccount(
    new Request(SEARCH_ORIGIN, { headers: cookie ? { cookie } : {} }),
  );
  if (
    account ||
    (await validTestSession(
      cookieValue(cookie),
      typeof vars.TEST_SESSION_SECRET === 'string'
        ? vars.TEST_SESSION_SECRET
        : '',
    ))
  )
    return <PassportApp />;
  const params = await searchParams;
  const login = new URL('/login', SEARCH_ORIGIN);
  if (typeof params.join === 'string' && /^[a-f0-9]{48}$/.test(params.join))
    login.searchParams.set('join', params.join);
  if (typeof params.advice === 'string' && /^[a-f0-9]{32}$/.test(params.advice))
    login.searchParams.set('advice', params.advice);
  if (login.search) redirect(login.pathname + login.search);
  return <PublicHome />;
}
