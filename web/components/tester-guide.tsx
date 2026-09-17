'use client';
import { useEffect, useState } from 'react';
import { ArrowRight, Check, Compass, BookOpen, Users, Route, MessageCircle, Clock3 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { DEMO_PERSONA } from '@/lib/demo-persona';

const steps = [
  { title: '부모님과의 하루를 살펴봐요', label: '일정 보기', icon: BookOpen, time: '1분', action: '일정 열어보기', what: '철원에서 함께 보낼 네 시간. 장소 순서와 머무는 시간, 돌아갈 여유를 한 화면에서 확인하세요.', how: ['일정 위의 날짜·출발 시각을 확인해요.', '장소 카드를 눌러 관광정보를 살펴봐요.', '만남 장소와 복귀 기준은 내 계획에만 있어요.'] },
  { title: '조금 더 여유로운 여행으로', label: '계획 조정', icon: Route, time: '2분', action: '일정 편집해 보기', what: '부모님이 오래 걷지 않도록, 장소 한 곳이나 체류 시간을 바꿔 보세요. 저장 전후를 직접 비교할 수 있어요.', how: ['편집 화면에서 아래로 내려 ‘여유 조정’을 열어요.', '한 곳 생략 또는 체류 조정안을 선택해 비교해요.', '적용하고 저장하면 일정 보기에 반영돼요.'] },
  { title: '함께 갈 사람마다, 다른 여행', label: '동행 그룹', icon: Users, time: '1분', action: '가족 그룹 열어보기', what: '가족, 연인, 친구. 세 그룹에 준비한 여행을 확인하고 공동 일정을 수정해 보세요.', how: ['가족 그룹의 여행을 열어요.', '그룹 일정과 내 개인 일정을 구분해 확인해요.', '체험 그룹의 인물은 가상이며 응답하지 않아요. 실제 동행자 초대는 개인 계정에서 이용해요.'] },
  { title: '친구에게 여행 한 수를 받아요', label: '한 수 받기', icon: MessageCircle, time: '2분', action: '공유안 준비해 보기', what: '“이 여행에 한 곳만 더한다면?” 관광지와 질문만 담은 링크로 다른 사람의 아이디어를 받아보세요.', how: ['공개할 관광지를 확인하고 링크를 만들어요.', '다른 브라우저에서 링크를 열면 가입 없이 제안할 수 있어요.', '돌아와 제안을 검토하고 내 일정에 저장해요.'] },
  { title: '여행 중에도, 다녀온 뒤에도', label: '현재 출타 · 기록', icon: Clock3, time: '1분', action: '출타 시작 화면 열기', what: '계획과 현재 출타는 분리돼 있어요. 출타를 시작한 뒤에만 지금 시각으로 남은 시간을 확인합니다.', how: ['출타 시작 화면에서 복귀 기준을 확인해요.', '테스트 출타를 시작하고 다음 장소로 이동해 보세요.', '여행 완료에서 다녀온 장소를 확인해 기록을 남겨요. 모두 가상의 체험입니다.'] },
];

export default function TesterGuide({ accountId, onAction }: { accountId: string; onAction: (step: number) => void }) {
  const [mode, setMode] = useState<'closed' | 'welcome' | 'guide'>('closed');
  const [step, setStep] = useState(0), [checked, setChecked] = useState<number[]>([]);
  const key = 'gunbeon-tester-guide:' + accountId;
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null');
      if (saved) { setChecked(saved.checked || []); setStep(saved.step || 0); }
      if (!saved || new URLSearchParams(location.search).get('tour') === '1') setMode('welcome');
      const url = new URL(location.href); url.searchParams.delete('tour'); history.replaceState(null, '', url);
    } catch { setMode('welcome'); }
  }, [key]);
  const remember = (nextStep = step, nextChecked = checked) => {
    try { localStorage.setItem(key, JSON.stringify({ step: nextStep, checked: nextChecked })); } catch {}
  };
  const current = steps[step], Icon = current.icon;
  return <>
    <div className="tester-rail"><span><Compass size={15} /><b>민준의 여행 체험</b><span className="tester-rail-detail">나만의 예시 사본 · 자유롭게 수정해 보세요</span></span><button onClick={() => setMode('guide')}>체험 가이드 <span>{checked.length}/5</span><ArrowRight size={14} /></button></div>
    <Dialog open={mode !== 'closed'} onOpenChange={(v) => { if (!v) { remember(); setMode('closed'); } }}>
      <DialogContent className={`tester-guide-dialog ${mode === 'welcome' ? 'is-welcome' : ''}`}>
        {mode === 'welcome' ? <>
          <div className="tester-welcome-art"><span className="tester-kicker">민준의 강원 여행</span><div className="tester-welcome-route"><span>가족</span><i /><span>연인</span><i /><span>친구</span></div><strong>기다리던 휴가,<br />함께 보낼 하루.</strong><small>24세 장병 · 가상 인물</small></div>
          <div className="tester-welcome-body"><DialogTitle>가이드와 함께 둘러볼까요?</DialogTitle><DialogDescription>{DEMO_PERSONA.description} 5가지 체험으로 여행 계획부터 한 수 받기까지 익힐 수 있어요.</DialogDescription><div className="tester-welcome-stats"><span><b>4</b>여행 계획</span><span><b>3</b>동행 그룹</span><span><b>1</b>지난 여행 기록</span></div><Button onClick={() => { remember(); setMode('guide'); }}>7분 체험 가이드 시작 <ArrowRight size={17} /></Button><button className="tester-skip" onClick={() => { remember(); setMode('closed'); }}>자유롭게 둘러볼게요</button><small>예시 인물·여행이며, 다른 테스터에게 내 수정 내용이 보이지 않아요. 화면 상단에서 언제든 가이드를 다시 열 수 있어요.</small></div>
        </> : <>
          <div className="tester-guide-heading"><span className="tester-kicker">민준의 여행 따라 해 보기</span><DialogTitle>작은 계획부터, 함께하는 여행까지</DialogTitle><DialogDescription>궁금한 기능부터 골라도 괜찮아요. 직접 해본 단계는 체크해 주세요.</DialogDescription></div>
          <div className="tester-guide-layout"><nav aria-label="체험 단계">{steps.map((s, i) => <button key={s.label} aria-current={i === step ? 'step' : undefined} onClick={() => { setStep(i); remember(i); }}><span className={checked.includes(i) ? 'is-done' : ''}>{checked.includes(i) ? <Check size={15} /> : String(i + 1).padStart(2, '0')}</span><b>{s.label}</b><small>{s.time}</small></button>)}</nav>
          <section className="tester-guide-task"><Icon size={26} /><h3>{current.title}</h3><p>{current.what}</p><ol>{current.how.map(t => <li key={t}>{t}</li>)}</ol><Button onClick={() => { remember(); setMode('closed'); onAction(step); }}>{current.action}<ArrowRight size={17} /></Button><label className="tester-step-check"><input type="checkbox" checked={checked.includes(step)} onChange={e => { const next = e.target.checked ? [...new Set([...checked, step])] : checked.filter(i => i !== step); setChecked(next); remember(step, next); }} />이 단계는 직접 해봤어요</label>{checked.length === 5 && <p className="tester-guide-finish">다섯 가지 체험을 모두 살펴봤어요. 이제 빈 여행에서 나만의 강원 여행을 만들어 보세요.</p>}</section></div>
          <a className="tester-guide-full" href="/guide" target="_blank" rel="noreferrer">화면별 자세한 사용법 보기 ↗</a>
        </>}
      </DialogContent>
    </Dialog>
  </>;
}
