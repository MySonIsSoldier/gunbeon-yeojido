import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: '내 계정 · 군번여지도 강원',
  robots: { index: false, follow: false },
};
import AccountPage from '@/components/account-page';
export const dynamic = 'force-dynamic';
export default function Page() {
  return <AccountPage />;
}
