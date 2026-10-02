/* oxlint-disable next/no-html-link-for-pages -- Full navigation re-evaluates session cookies at the public/private boundary. */
import Brand from './brand';
import {
  ArrowRight,
  BookOpen,
  MapPin,
  Route,
  Users,
  Clock3,
} from 'lucide-react';
import { siteStructuredData } from '@/lib/search-policy';

export default function PublicHome() {
  return (
    <div className="public-home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(siteStructuredData()).replace(/</g, '\\u003c'),
        }}
      />
      <header className="public-nav">
        <a href="/" aria-label="군번여지도 강원 홈">
          <Brand />
        </a>
        <nav aria-label="서비스 안내">
          <a href="/guide">이용 가이드</a>
          <a href="/login" className="public-nav-login">
            로그인 <ArrowRight size={16} />
          </a>
        </nav>
      </header>
      <main>
        <section className="public-hero">
          <div className="public-hero-copy">
            <p className="public-eyebrow">
              군번여지도 강원 · 휴전선 밖 첫 하루
            </p>
            <h1>
              함께 기다린 하루,
              <br />
              우리만의 강원 여행으로.
            </h1>
            <p className="public-lead">
              장병과 가족·연인·친구가 함께 만드는 여행 계획.
              <br />
              가고 싶은 곳을 고르고, 만날 사람과 일정을 나누세요.
              <br />
              돌아갈 시간까지 생각한 하루를 준비할 수 있어요.
            </p>
            <div className="public-actions">
              <a className="public-primary" href="/login">
                여행 계획 시작하기 <ArrowRight size={18} />
              </a>
              <a className="public-secondary" href="/guide">
                <BookOpen size={18} /> 사용법 먼저 보기
              </a>
            </div>
            <p className="public-small">
              계정 없이 둘러보고 싶다면 로그인 화면에서 예시 여행을 체험해
              보세요.
            </p>
          </div>
          <div className="public-trip-preview" aria-label="철원 가족 여행 예시">
            <div className="public-preview-heading">
              <span>함께 준비하는 하루</span>
              <MapPin size={20} />
            </div>
            <h2>
              부모님과 천천히,
              <br />
              철원의 하루
            </h2>
            <p>철원 · 가족과 함께 · 여행 예시</p>
            <ol>
              <li>
                <span>01</span>
                <div>
                  <strong>고석정</strong>
                  <small>한탄강 풍경부터 만나기</small>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>식사와 쉬어 가는 시간</strong>
                  <small>함께 갈 사람의 속도에 맞추기</small>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>철원역사문화공원</strong>
                  <small>오늘의 기억을 한 장 남기기</small>
                </div>
              </li>
            </ol>
            <a href="/guide#guide-03">
              이런 일정을 직접 만들 수 있어요 <ArrowRight size={16} />
            </a>
          </div>
        </section>
        <section
          className="public-regions"
          aria-labelledby="public-regions-title"
        >
          <p className="public-eyebrow">여행의 무대</p>
          <h2 id="public-regions-title">강원 접경 5군, 그리고 여행의 시작점</h2>
          <p>
            철원·화천·양구·인제·고성의 평화·자연·가족 여행을 중심으로, 춘천과
            속초까지 함께 살펴보세요. 한국관광공사 관광정보로
            관광지·문화시설·맛집·숙소를 찾아 일정에 담습니다.
          </p>
          <ul>
            {['철원', '화천', '양구', '인제', '고성', '춘천', '속초'].map(
              (region) => (
                <li key={region}>{region}</li>
              ),
            )}
          </ul>
        </section>
        <section
          className="public-features"
          aria-labelledby="public-features-title"
        >
          <div className="public-section-heading">
            <p className="public-eyebrow">준비부터 다녀온 기록까지</p>
            <h2 id="public-features-title">처음에는 일정 하나부터</h2>
            <p>
              여행 날짜가 미정이어도 괜찮아요. 마음에 드는 코스를 담고 하나씩
              바꿔보세요.
            </p>
          </div>
          <div className="public-feature-grid">
            <article>
              <Route size={24} />
              <h3>내 속도로 여행 계획</h3>
              <p>
                추천 코스를 가져오거나 빈 일정부터 시작하세요. 장소 순서와
                머무는 시간을 바꾸며 나에게 맞는 하루를 만듭니다.
              </p>
              <a href="/guide#guide-03">
                일정 만드는 방법 <ArrowRight size={16} />
              </a>
            </article>
            <article>
              <Users size={24} />
              <h3>함께 갈 사람과 준비</h3>
              <p>
                가족·연인·친구별 그룹에서 여행을 나누세요. ‘한 수 받기’로
                친구에게 추천 장소와 여행 아이디어를 받을 수도 있어요.
              </p>
              <a href="/guide#guide-05">
                그룹과 공유 사용법 <ArrowRight size={16} />
              </a>
            </article>
            <article>
              <Clock3 size={24} />
              <h3>출발한 뒤에는 현재 출타</h3>
              <p>
                계획할 때는 여행 날짜를 기준으로, 실제 출발한 뒤에는 현재 시각을
                기준으로 여유를 확인합니다. 다녀온 곳은 여행 기록으로 남기세요.
              </p>
              <a href="/guide#guide-06">
                출발과 기록 사용법 <ArrowRight size={16} />
              </a>
            </article>
          </div>
        </section>
        <section className="public-faq" aria-labelledby="public-faq-title">
          <h2 id="public-faq-title">시작하기 전에 궁금한 점</h2>
          <details>
            <summary>장병이 아니어도 사용할 수 있나요?</summary>
            <p>
              네. 부모님·연인·친구도 자신의 계정으로 여행을 만들고 동행 그룹에서
              함께 준비할 수 있어요.
            </p>
          </details>
          <details>
            <summary>휴가 날짜를 정하지 않아도 계획할 수 있나요?</summary>
            <p>
              둘러보기는 날짜 없이 이용합니다. 마음에 드는 코스를 내 여행으로
              가져온 뒤 날짜와 시간을 정하거나, 빈 일정을 먼저 저장할 수 있어요.
            </p>
          </details>
          <details>
            <summary>복귀 시간과 내 장소가 공개되나요?</summary>
            <p>
              개인 복귀 시각과 직접 지정한 민감한 장소는 공개 카드에서
              제외합니다. 그룹이나 외부에 공유할 때에는 공개할 내용을 직접
              확인하고 선택해요.
            </p>
          </details>
          <details>
            <summary>복귀 여유 시간은 어떻게 사용하나요?</summary>
            <p>
              일정과 거리 기반 이동 추정에 안전 여유를 더한 참고값입니다. 실제
              교통 상황과 소속 부대의 복귀 규정은 직접 확인해 주세요.
            </p>
          </details>
        </section>
      </main>
      <footer className="public-footer">
        <Brand />
        <p>복무 경험을 관광 경험으로.</p>
        <nav aria-label="서비스 정보">
          <a href="/about">서비스 소개</a>
          <a href="/guide">이용 가이드</a>
          <a href="/terms">서비스 이용약관</a>
          <a href="/privacy">개인정보 안내</a>
        </nav>
      </footer>
    </div>
  );
}
