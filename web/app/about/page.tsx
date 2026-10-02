/* oxlint-disable next/no-html-link-for-pages -- Full navigation re-evaluates session cookies at the public/private boundary. */
import { env } from 'cloudflare:workers';
import { publicMetadata } from '@/lib/search-policy';
export function generateMetadata() {
  return publicMetadata(
    env as Record<string, unknown>,
    '/about',
    '서비스 소개 · 군번여지도 강원',
    '장병과 가족·연인·친구의 강원 접경 여행을 함께 준비하는 군번여지도. 여행 계획, 동행 그룹, 복귀 여유 확인과 여행 기록을 소개합니다.',
  );
}
import Brand from '@/components/brand';
export default function About() {
  return (
    <main className="account-page">
      <a href="/">
        <Brand />
      </a>
      <article className="account-panel legal-copy">
        <p className="account-eyebrow">군번여지도 강원</p>
        <h1>
          군번여지도 강원
          <br />
          휴전선 밖 첫 하루
        </h1>
        <p>
          장병과 가족·연인·친구가 강원 여행을 함께 계획하고 다녀온 하루를
          기록하는 모바일 여행 서비스입니다.
        </p>
        <h2>함께 계획하고, 편하게 다녀오기</h2>
        <p>
          철원·화천·양구·인제·고성의 한국관광공사 관광정보로 코스를 만들고,
          그룹에 여행을 공유하고, 내 출타 일정의 여유 시간을 확인합니다. 여행이
          끝나면 하루 여권에 나만의 기록을 남깁니다.
        </p>
        <p>
          2026 관광데이터 활용 공모전 ① 웹·앱 개발 부문 참가 서비스이며 현재
          테스트 중입니다.
        </p>
        <a className="account-primary-link" href="/login">
          여행 시작하기
        </a>
        <nav className="legal-links" aria-label="서비스 정책">
          <a href="/guide">화면으로 보는 이용 가이드</a>
          <a href="/terms">서비스 이용약관</a>
          <a href="/privacy">개인정보 안내</a>
        </nav>
      </article>
    </main>
  );
}
