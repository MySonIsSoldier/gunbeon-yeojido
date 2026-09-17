'use client';
import { useEffect, useState } from 'react';
import { Download, Share2, Link2, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { approximateCountdown, type SocialCard } from '@/lib/social-card';
import { renderSocialCard, type CardDesign } from '@/lib/social-card-renderer';

export default function SocialStudio({ card, onClose, remainingMinutes, onAskAdvice, onRetry }: { card: SocialCard; onClose: () => void; remainingMinutes?: number; onAskAdvice?: () => void; onRetry?: () => void }) {
  const [format,setFormat]=useState<CardDesign['format']>('story'), [color,setColor]=useState<CardDesign['color']>('forest'), [showTime,setShowTime]=useState(false);
  const [ready,setReady]=useState<{file:File;url:string;signature:string}|null>(null),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  const countdown=remainingMinutes === undefined ? null : approximateCountdown(remainingMinutes);
  const signature=JSON.stringify([card,format,color,showTime&&countdown]);
  const available=!card.missingCount && ready?.signature===signature ? ready : null;
  useEffect(()=>{
    let active=true,objectUrl=''; setError('');
    if(card.missingCount) return;
    renderSocialCard(card,{format,color,countdown:showTime?countdown:null},location.origin).then(blob=>{
      if(!active)return; objectUrl=URL.createObjectURL(blob); setReady({file:new File([blob],'군번여지도-이번휴가한장.png',{type:'image/png'}),url:objectUrl,signature});
    }).catch(e=>{if(active)setError(e.message);});
    return()=>{active=false;if(objectUrl)URL.revokeObjectURL(objectUrl);};
  },[signature]);
  const link=typeof location!=='undefined'&&card.publicId?location.origin+'/p/'+card.publicId:'';
  const download=()=>{if(!available)return; const a=document.createElement('a');a.href=available.url;a.download=available.file.name;a.click();setMessage(link?'이미지를 저장했어요. 링크를 복사해 인스타 스토리의 링크 스티커에 붙여주세요.':'이미지를 저장했어요. 원하는 앱에서 사진을 선택해 게시하세요.');};
  const share=async()=>{if(!available)return;setBusy(true);try{if(navigator.canShare?.({files:[available.file]})){await navigator.share({files:[available.file],title:'이번 휴가 한 장'});setMessage('선택한 앱에서 게시를 마무리해 주세요.');}else download();}catch(e){if((e as Error).name!=='AbortError')setError('공유창을 열지 못했어요. PNG로 저장해서 이용해 주세요.');}finally{setBusy(false);}};
  return <Dialog open onOpenChange={v=>!v&&onClose()}><DialogContent className="social-studio">
    <header><span className="tester-kicker">함께 보고, 한 수를 더하다</span><DialogTitle>이번 휴가 한 장</DialogTitle><DialogDescription>여행의 분위기는 담고, 개인 일정은 남겨두세요.</DialogDescription></header>
    <div className="social-studio-layout"><div className={'social-card-preview '+format}>{available?<img src={available.url} alt={`${card.region} ${card.title} 공유 이미지 미리보기`} />:card.missingCount?<div role="status"><p>관광지 {card.missingCount}곳의 정보를 확인하고 있어요. 모두 불러온 뒤 카드를 만들 수 있습니다.</p>{onRetry?<Button variant="outline" onClick={onRetry}>장소 정보 다시 불러오기</Button>:<p>창을 닫고 관광정보를 다시 불러와 주세요.</p>}</div>:<p role="status">카드를 만드는 중…</p>}</div>
    <section className="social-studio-options">
      <fieldset><legend>어디에 올릴까요?</legend><div className="social-option-row"><button aria-pressed={format==='story'} onClick={()=>setFormat('story')}>스토리 <small>9:16</small></button><button aria-pressed={format==='feed'} onClick={()=>setFormat('feed')}>피드 <small>4:5</small></button></div></fieldset>
      <fieldset><legend>여행의 색</legend><div className="social-option-row"><button aria-pressed={color==='forest'} onClick={()=>setColor('forest')}><i className="swatch forest"/>숲의 여유</button><button aria-pressed={color==='sea'} onClick={()=>setColor('sea')}><i className="swatch sea"/>바다의 하루</button></div></fieldset>
      {remainingMinutes!==undefined&&<div className="social-countdown-option"><label><input type="checkbox" checked={showTime} disabled={!countdown} onChange={e=>setShowTime(e.target.checked)}/>남은 시간을 함께 담기</label><p>{countdown?'정확한 시각 대신 “'+countdown+'”으로 표시해요. 이미지의 시간은 자동 갱신되지 않아요.':'복귀 기준이 지나 남은 시간을 카드에 넣지 않아요.'}</p></div>}
      <div className="social-export-actions"><Button disabled={!available||busy} onClick={()=>void share()}><Share2 size={17}/>이미지 공유</Button><Button variant="outline" disabled={!available||busy} onClick={download}><Download size={17}/>PNG 저장</Button></div>
      {link?<div className="social-link-step"><b>링크까지 붙이면, 여행이 달라져요.</b><p>인스타 스토리에서 링크 스티커를 추가하세요. 보는 사람이 가입 없이 장소를 제안할 수 있어요. QR로도 참여할 수 있습니다.</p><Button variant="outline" onClick={()=>navigator.clipboard.writeText(link).then(()=>setMessage('참여 링크를 복사했어요. 스토리의 링크 스티커에 붙여주세요.')).catch(()=>setError('링크를 길게 눌러 직접 복사해 주세요.'))}><Link2 size={16}/>참여 링크 복사</Button><input aria-label="참여 링크" readOnly value={link} onFocus={e=>e.target.select()}/></div>:onAskAdvice&&<button className="social-advice-cta" onClick={onAskAdvice}><span><b>여행 아이디어도 받아볼까요?</b><small>공개 관광지와 질문으로 참여 링크 만들기</small></span><ArrowRight size={18}/></button>}
      <p className="social-privacy-note">개인 일정 제목·날짜·만남 장소·좌표는 담지 않아요. 게시할 내용은 미리보기와 같습니다.</p>
      <p role="status" className="social-feedback">{message}</p>{error&&<p role="alert">{error}</p>}
    </section></div>
  </DialogContent></Dialog>;
}
