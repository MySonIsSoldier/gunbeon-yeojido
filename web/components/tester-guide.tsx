'use client';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Compass,
  BookOpen,
  Users,
  Route,
  MessageCircle,
  Clock3,
  Play,
  Pause,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';

const steps = [
  {
    title: '준비된 여행부터 열어보세요',
    label: '일정 보기',
    icon: BookOpen,
    action: '일정 열어보기',
    what: '장소 순서와 날짜, 머무는 시간, 돌아갈 여유를 한 화면에서 확인합니다.',
    how: [
      '일정의 날짜와 출발 시각을 확인해요.',
      '관광지 카드를 눌러 상세정보를 봐요.',
      '바꾸고 싶을 때만 ‘일정 편집’을 눌러요.',
    ],
  },
  {
    title: '우리에게 맞는 속도로 바꿔요',
    label: '계획 조정',
    icon: Route,
    action: '일정 편집해 보기',
    what: '장소를 추가하거나 머무는 시간을 바꾸고, 돌아갈 여유를 비교해 보세요.',
    how: [
      '장소 찾기에서 관광지·식당을 추가해요.',
      '‘여유 조정’에서 한 곳 생략·체류 조정안을 비교해요.',
      '마음에 드는 안을 적용하고 저장해요.',
    ],
  },
  {
    title: '함께 갈 사람에게 일정을 나눠요',
    label: '동행 그룹',
    icon: Users,
    action: '동행 그룹 열어보기',
    what: '가족, 연인, 친구마다 다른 그룹에서 여행 계획을 함께 관리합니다.',
    how: [
      '그룹을 선택하고 준비된 일정을 열어요.',
      '그룹 일정과 내 개인 일정은 별도로 관리해요.',
      '개인 복귀 기준은 그룹에 자동으로 공유되지 않아요.',
    ],
  },
  {
    title: '이 여행에 한 곳만 더한다면?',
    label: '한 수 받기',
    icon: MessageCircle,
    action: '공유안 준비해 보기',
    what: '관광지와 질문을 담은 링크로, 가입하지 않은 친구에게도 여행 아이디어를 받아요.',
    how: [
      '공개할 장소와 질문을 확인하고 링크를 만들어요.',
      '다른 브라우저에서 열어 한 수를 남겨보세요.',
      '제안을 검토하고 내 일정에 저장하면 반영 표시가 남아요.',
    ],
  },
  {
    title: '출발한 뒤에는 현재 출타로',
    label: '현재 출타 · 기록',
    icon: Clock3,
    action: '여행 당일 화면 살펴보기',
    what: '여행 계획은 출발일 기준, 현재 출타는 지금 시각 기준입니다. 다녀온 여행은 기록으로 남겨요.',
    how: [
      '계획 중에는 출타를 시작하지 않아도 돼요.',
      '실제로 출발할 때 일정을 고르고 개인 복귀 기준을 확인해요.',
      '시작한 뒤 다음 장소와 남은 시간을 확인해요.',
      '‘여행 완료’에서 실제 다녀온 장소를 골라 스탬프를 남겨요.',
    ],
  },
];
const scenes = [
  {
    eyebrow: '01 / 여행 준비',
    title: '일정은 한눈에, 편집은 필요할 때.',
    description:
      '내 여행에서 준비된 코스를 열면 장소와 시간을 바로 볼 수 있어요. 바꿀 때만 일정 편집으로 들어가세요.',
    icon: BookOpen,
  },
  {
    eyebrow: '02 / 나에게 맞추기',
    title: '가고 싶은 곳과 돌아갈 여유를 함께.',
    description:
      '둘러보기에서 코스나 장소를 고르고, 일정표에서 날짜·시간을 정해요. 여유 조정으로 변경 전후를 비교할 수 있어요.',
    icon: Route,
  },
  {
    eyebrow: '03 / 함께 준비하기',
    title: '동행자와 짜고, 친구에게 한 수 받고.',
    description:
      '그룹에는 함께 갈 일정을, 공개 링크에는 관광지와 질문을 담아요. 받은 제안은 내가 고른 뒤 일정에 반영해요.',
    icon: Users,
  },
  {
    eyebrow: '04 / 여행과 기록',
    title: '출발하면 현재 출타, 다녀오면 여행 기록.',
    description:
      '실시간 남은 시간은 출타를 시작한 뒤에만 확인해요. 여행 완료에서 방문 장소를 고르고 공유 카드를 만들어요.',
    icon: Clock3,
  },
];

export default function TravelGuide({
  accountId,
  audience,
  planCount,
  groupCount,
  outingActive = false,
  onAction,
}: {
  accountId: string;
  audience: 'demo' | 'judge' | 'traveler';
  planCount: number;
  groupCount: number;
  outingActive?: boolean;
  onAction: (step: number) => void;
}) {
  const [mode, setMode] = useState<'closed' | 'intro' | 'guide'>('closed');
  const [step, setStep] = useState(0),
    [checked, setChecked] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0),
    [playing, setPlaying] = useState(false),
    [reduced, setReduced] = useState(false);
  const key = 'gunbeon-quick-guide-v2:' + accountId;
  const scene = Math.min(3, Math.floor(elapsed / 5000));
  const availableSteps = steps.map((s) => ({ ...s }));
  if (!planCount) {
    availableSteps[0] = {
      ...steps[0],
      title: '가고 싶은 코스부터 골라보세요',
      label: '첫 일정 만들기',
      action: '추천 코스 고르기',
      what: '날짜를 정하지 않아도 괜찮아요. 마음에 드는 코스를 내 일정으로 가져온 뒤 자유롭게 바꿀 수 있어요.',
      how: [
        '둘러보기에서 지역과 코스를 골라요.',
        '‘이 코스로 일정 만들기’를 눌러요.',
        '장소·날짜·시간을 정하고 저장하면 내 여행에 남아요.',
      ],
    };
    availableSteps[1] = {
      ...steps[1],
      title: '빈 일정부터 시작해도 괜찮아요',
      action: '빈 일정부터 만들기',
      what: '추천 코스 없이 직접 짤 수도 있어요. 이름만 정해 빈 여행을 저장하고, 장소와 시간은 나중에 채워보세요.',
      how: [
        '나만의 코스 만들기에서 여행 이름을 정해요.',
        '장소 추가로 관광지·맛집·즐겨찾기를 담아요.',
        '저장한 여행은 내 여행에서 다시 열고 편집해요.',
      ],
    };
    availableSteps[3] = {
      ...steps[3],
      action: '먼저 여행 계획 만들기',
      what: '일정에 관광지를 담아 저장하면 공개 질문 링크를 만들 수 있어요. 친구가 추천한 곳은 내가 골라 반영해요.',
      how: [
        '먼저 코스나 관광지로 여행을 만들고 저장해요.',
        '일정 보기에서 ‘한 수 부탁하기’를 열어요.',
        '공개할 관광지와 질문을 확인한 뒤 링크를 나눠요.',
      ],
    };
    availableSteps[4] = {
      ...steps[4],
      action: '여행 계획부터 준비하기',
      what: '지금은 여행을 준비하는 단계예요. 장소가 담긴 일정을 저장하고, 실제로 출발하는 날 현재 출타를 시작하세요.',
      how: [
        '추천 코스로 여행을 만들고 저장해요.',
        '떠나는 날 내 여행에서 ‘출타 시작’을 눌러요.',
        '다녀온 뒤 ‘여행 완료’로 방문한 곳을 기록해요.',
      ],
    };
  }
  if (!groupCount)
    availableSteps[2] = {
      ...steps[2],
      title: '함께 갈 사람들의 그룹을 만들어요',
      action: '첫 동행 그룹 만들기',
      what: '가족·연인·친구별로 그룹을 만들고 여행 일정을 함께 준비할 수 있어요. 혼자 준비할 때는 그룹 없이도 이용할 수 있어요.',
      how: [
        '그룹 이름과 함께 갈 사람의 유형을 정해요.',
        '그룹을 만든 뒤 초대 링크를 동행자에게 보내요.',
        '공유할 여행을 골라 그룹에 담아요. 개인 복귀 기준은 나만 봐요.',
      ],
    };
  if (outingActive)
    availableSteps[4] = {
      ...steps[4],
      action: '현재 출타 이어보기',
      what: '이미 출발한 여행이 있어요. 지금 남은 시간과 다음 장소를 확인하고, 다녀온 뒤 여행 완료로 기록을 남겨요.',
    };
  const current = availableSteps[step],
    Icon = current.icon,
    SceneIcon = scenes[scene].icon;
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReduced(media.matches);
      if (media.matches) setPlaying(false);
    };
    update();
    media.addEventListener('change', update);
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null');
      if (saved) {
        setChecked(
          Array.isArray(saved.checked)
            ? saved.checked.filter(
                (i: number) => Number.isInteger(i) && i >= 0 && i < 5,
              )
            : [],
        );
        setStep(
          Number.isInteger(saved.step) && saved.step >= 0 && saved.step < 5
            ? saved.step
            : 0,
        );
      }
      const params = new URLSearchParams(location.search);
      if (
        !params.has('join') &&
        !params.has('advice') &&
        ((!saved && audience !== 'traveler') || params.get('tour') === '1')
      ) {
        setMode('guide');
      }
      const url = new URL(location.href);
      url.searchParams.delete('tour');
      history.replaceState(null, '', url);
    } catch {
      if (audience !== 'traveler') {
        setMode('guide');
      }
    }
    return () => media.removeEventListener('change', update);
  }, [key, audience]);
  useEffect(() => {
    if (mode !== 'intro' || !playing || elapsed >= 20000) return;
    const timer = setInterval(
      () => setElapsed((v) => Math.min(20000, v + 100)),
      100,
    );
    return () => clearInterval(timer);
  }, [mode, playing, elapsed >= 20000]);
  useEffect(() => {
    const pause = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener('visibilitychange', pause);
    return () => document.removeEventListener('visibilitychange', pause);
  }, []);
  const remember = (nextStep = step, nextChecked = checked) => {
    try {
      localStorage.setItem(
        key,
        JSON.stringify({ step: nextStep, checked: nextChecked }),
      );
    } catch {}
  };
  const close = () => {
    remember();
    setPlaying(false);
    setMode('closed');
  };
  const act = (index: number) => {
    close();
    onAction(index);
  };
  const replay = () => {
    setElapsed(0);
    setPlaying(!reduced);
    setMode('intro');
  };
  const openGuide = () => {
    setPlaying(false);
    setMode('guide');
  };
  return (
    <>
      <div className="tester-rail travel-guide-bar">
        <span>
          <Compass size={18} />
          <b>여행 사용법</b>
          <span className="tester-rail-detail">
            계획부터 함께 다녀온 기록까지
          </span>
        </span>
        <button
          className="travel-guide-replay"
          aria-haspopup="dialog"
          onClick={openGuide}
        >
          <BookOpen size={16} />
          여행 가이드 다시 보기
        </button>
      </div>
      <Dialog
        open={mode !== 'closed'}
        onOpenChange={(v) => {
          if (!v) close();
        }}
      >
        <DialogContent
          className={`tester-guide-dialog ${mode === 'intro' ? 'quick-intro-dialog' : ''}`}
        >
          {mode === 'intro' ? (
            <>
              <div
                className="quick-intro-progress"
                aria-label={`사용법 ${scene + 1}/4장면`}
              >
                {scenes.map((s, i) => (
                  <button
                    key={s.title}
                    aria-label={`${i + 1}번째 장면`}
                    aria-current={scene === i ? 'step' : undefined}
                    onClick={() => {
                      setPlaying(false);
                      setElapsed(i * 5000);
                    }}
                  >
                    <span
                      style={{
                        width: `${Math.max(0, Math.min(100, (elapsed - i * 5000) / 50))}%`,
                      }}
                    />
                  </button>
                ))}
              </div>
              <div className="quick-intro-layout">
                <div
                  className="quick-intro-copy"
                  aria-live={playing && elapsed < 20000 ? 'off' : 'polite'}
                >
                  <p className="tester-kicker">20초로 먼저 알아보기</p>
                  <span className="quick-intro-chapter">
                    {scenes[scene].eyebrow}
                  </span>
                  <DialogTitle>{scenes[scene].title}</DialogTitle>
                  <DialogDescription>
                    {scenes[scene].description}
                  </DialogDescription>
                  <div className="quick-intro-controls">
                    <button
                      aria-label="이전 안내 장면"
                      disabled={scene === 0}
                      onClick={() => {
                        setPlaying(false);
                        setElapsed((scene - 1) * 5000);
                      }}
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <button
                      onClick={() => {
                        if (elapsed >= 20000) setElapsed(0);
                        setPlaying(!playing || elapsed >= 20000);
                      }}
                    >
                      {playing && elapsed < 20000 ? (
                        <Pause size={16} />
                      ) : (
                        <Play size={16} />
                      )}
                      {playing && elapsed < 20000
                        ? '일시정지'
                        : elapsed >= 20000
                          ? '다시 보기'
                          : '재생'}
                    </button>
                    <button
                      aria-label="다음 안내 장면"
                      disabled={scene === 3}
                      onClick={() => {
                        setPlaying(false);
                        setElapsed((scene + 1) * 5000);
                      }}
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                  {reduced && (
                    <small className="helper">
                      기기의 모션 감소 설정에 맞춰 장면을 직접 넘길 수 있어요.
                    </small>
                  )}
                </div>
                <section
                  key={scene}
                  className={`quick-intro-preview preview-${scene}`}
                  aria-label="기능 사용 예시"
                >
                  <span className="quick-preview-label">
                    <SceneIcon size={18} />
                    기능 미리보기
                  </span>
                  {scene === 0 ? (
                    <>
                      <h3>함께 보내는 강원 여행</h3>
                      <div className="quick-preview-timeline">
                        <span>
                          <b>01</b>만나기로 한 장소
                        </span>
                        <span>
                          <b>02</b>함께 가고 싶은 관광지
                        </span>
                        <span>
                          <b>03</b>밥 먹고 쉬어가는 곳
                        </span>
                      </div>
                      <div className="quick-preview-footer">
                        <b>일정 보기</b>
                        <span>필요할 때 일정 편집 ↗</span>
                      </div>
                    </>
                  ) : scene === 1 ? (
                    <>
                      <h3>
                        장소를 담고
                        <br />
                        여유를 비교해요.
                      </h3>
                      <div className="quick-adjust-cards">
                        <span>
                          가고 싶은 곳 <b>＋ 장소 추가</b>
                        </span>
                        <span>
                          걷는 시간이 길다면 <b>여유 조정</b>
                        </span>
                        <span>
                          내가 고른 변경만 <b>적용 후 저장</b>
                        </span>
                      </div>
                    </>
                  ) : scene === 2 ? (
                    <>
                      <h3>
                        같은 여행,
                        <br />
                        함께 고르는 즐거움.
                      </h3>
                      <div className="quick-group-tags">
                        <span>가족</span>
                        <span>연인</span>
                        <span>친구</span>
                      </div>
                      <div className="quick-advice-bubble">
                        “이 코스에 한 곳만 더한다면?”
                        <span>제안 받기 → 내가 골라 반영</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3>
                        오늘의 여행이
                        <br />
                        우리의 기록으로.
                      </h3>
                      <div className="quick-journey-phases">
                        <span>
                          출발 전 <b>내 여행</b>
                        </span>
                        <ArrowRight size={18} />
                        <span>
                          여행 중 <b>현재 출타</b>
                        </span>
                        <ArrowRight size={18} />
                        <span>
                          다녀온 뒤 <b>여행 기록</b>
                        </span>
                      </div>
                      <p>
                        개인 복귀 시각과 만남 장소는
                        <br />
                        공개 공유 카드에서 제외돼요.
                      </p>
                    </>
                  )}
                </section>
              </div>
              <div className="quick-intro-next">
                <div>
                  <strong>
                    {planCount
                      ? `준비된 여행 ${planCount}개로 시작해 보세요`
                      : '첫 여행을 가볍게 시작해 보세요'}
                  </strong>
                  <span>
                    {groupCount ? `동행 그룹 ${groupCount}개 · ` : ''}
                    {audience === 'demo'
                      ? '가상 인물·여행, 나만의 체험 사본'
                      : planCount
                        ? '저장된 여행과 그룹은 유지됩니다'
                        : '날짜가 미정이어도, 혼자 준비해도 괜찮아요'}
                  </span>
                </div>
                <Button onClick={openGuide}>
                  기능별로 따라 해볼게요
                  <ArrowRight size={17} />
                </Button>
              </div>
              <div className="quick-intro-bottom">
                <button onClick={close}>바로 둘러볼게요</button>
              </div>
            </>
          ) : (
            <>
              <div className="tester-guide-heading">
                <span className="tester-kicker">기능 하나씩, 직접 해보기</span>
                <DialogTitle>기능별로 따라 해볼게요</DialogTitle>
                <DialogDescription>
                  먼저 일정을 살펴보고, 원하는 기능을 하나씩 써보세요. 여행은
                  실제로 출발하는 날 시작하면 돼요.
                </DialogDescription>
              </div>
              <div className="tester-guide-layout">
                <nav aria-label="여행 준비 단계">
                  {availableSteps.map((s, i) => (
                    <button
                      key={s.label}
                      aria-current={i === step ? 'step' : undefined}
                      onClick={() => {
                        setStep(i);
                        remember(i);
                      }}
                    >
                      <span className={checked.includes(i) ? 'is-done' : ''}>
                        {checked.includes(i) ? (
                          <Check size={15} />
                        ) : (
                          String(i + 1).padStart(2, '0')
                        )}
                      </span>
                      <b>{s.label}</b>
                    </button>
                  ))}
                </nav>
                <section className="tester-guide-task">
                  <Icon size={26} />
                  <h3>{current.title}</h3>
                  <p>{current.what}</p>
                  <Button onClick={() => act(step)}>
                    {current.action}
                    <ArrowRight size={17} />
                  </Button>
                  <ol>
                    {current.how.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ol>
                  {audience === 'demo' && step === 2 && (
                    <p className="helper">
                      예시 그룹의 인물은 가상이에요. 실제 동행자 초대는 개인
                      계정에서 이용하세요.
                    </p>
                  )}
                  <label className="tester-step-check">
                    <input
                      type="checkbox"
                      checked={checked.includes(step)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...new Set([...checked, step])]
                          : checked.filter((i) => i !== step);
                        setChecked(next);
                        remember(step, next);
                      }}
                    />
                    이 단계는 직접 해봤어요
                  </label>
                </section>
              </div>
              <div className="quick-intro-bottom">
                <button onClick={replay}>
                  <Play size={14} />
                  20초 애니메이션으로 보기
                </button>
                <button onClick={close}>바로 둘러볼게요</button>
                <a href="/guide" target="_blank" rel="noreferrer">
                  화면별 자세한 사용법 ↗
                </a>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
