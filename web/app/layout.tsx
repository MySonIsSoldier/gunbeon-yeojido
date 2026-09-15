import type { Metadata } from 'next';
import { env } from 'cloudflare:workers';
import { metadataOrigin } from '@/lib/site-origin';
import './globals.css';
export function generateMetadata(): Metadata {
  const development = (env as Record<string, unknown>).SITE_ENVIRONMENT === 'development';
  return {
    title: `${development ? '[개발] ' : ''}군번여지도 강원 · 휴전선 밖 첫 하루`,
    ...(development ? { robots: { index: false, follow: false } } : {}),
    description:
      '복무 경험을 관광 경험으로 바꾸는, 장병과 가족·연인·친구가 함께 계획하는 강원 관광 여권',
    manifest: '/manifest.webmanifest',
    icons: { icon: '/icon.svg?v=2', apple: '/apple-touch-icon.png' },
    metadataBase: new URL(metadataOrigin(env as Record<string, unknown>)),
    openGraph: {
      title: '군번여지도 강원 · 휴전선 밖 첫 하루',
      description:
        '함께 짜는 휴가, 다시 만나는 길. 장병과 가족·연인·친구의 강원 여행 계획',
      images: [
        {
          url: '/og.png',
          width: 1200,
          height: 630,
          alt: '군번여지도 강원 · 다시 만나는 길',
        },
      ],
      locale: 'ko_KR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: '군번여지도 강원',
      description: '장병과 가족·연인·친구의 강원 여행 계획',
      images: ['/og.png'],
    },
  };
}
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
