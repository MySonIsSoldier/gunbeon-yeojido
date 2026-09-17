import QRCode from 'qrcode';
import { loadImage } from '@/components/memory-image';
import type { SocialCard } from './social-card';
let cardFont: Promise<FontFace> | undefined;
const photo = async (src: string) => { const img = new Image(); img.crossOrigin = 'anonymous'; img.src = await loadImage('/api/social-photo?path=' + encodeURIComponent(new URL(src).pathname)); await img.decode(); return img; };
export type CardDesign = { format: 'story' | 'feed'; color: 'forest' | 'sea'; countdown: string | null };

/** Browser-rendered PNG; KTO photo bytes relay without server storage. */
export async function renderSocialCard(card: SocialCard, design: CardDesign, origin: string): Promise<Blob> {
  if (!cardFont) cardFont = new FontFace('GunbeonCard', 'url(/fonts/PretendardVariable.woff2)', { weight: '100 900' }).load().then(font => { document.fonts.add(font); return font; });
  await cardFont.catch(() => undefined);
  const canvas = document.createElement('canvas');
  const W = 1080, H = design.format === 'story' ? 1920 : 1350;
  canvas.width = W; canvas.height = H;
  const c = canvas.getContext('2d');
  if (!c) throw new Error('이미지를 만들 수 없어요. 다른 브라우저에서 시도해 주세요.');
  const forest = design.color === 'forest', ink = forest ? '#204f42' : '#163e60', paper = forest ? '#f2f3e7' : '#edf2f4', accent = forest ? '#d9ed88' : '#b8deec';
  const txt = (s: string, x: number, y: number, size = 30, weight = 500, color = ink) => { c.font = `${weight} ${size}px GunbeonCard, "Apple SD Gothic Neo", sans-serif`; c.fillStyle = color; c.fillText(s, x, y); };
  const wrap = (s: string, x: number, y: number, width: number, size: number, weight = 500, lineH = size * 1.4, maxLines = 2) => {
    c.font = `${weight} ${size}px GunbeonCard, "Apple SD Gothic Neo", sans-serif`;
    const rows: string[] = []; let line = '';
    for (const ch of s) { if (c.measureText(line + ch).width > width && line) { rows.push(line); line = ''; } line += ch; }
    if (line) rows.push(line);
    rows.slice(0,maxLines).forEach((r,i) => txt(r + (i === maxLines - 1 && rows.length > maxLines ? '…' : ''),x,y+i*lineH,size,weight));
    return y + Math.min(rows.length,maxLines)*lineH;
  };
  c.fillStyle = paper; c.fillRect(0,0,W,H);
  c.fillStyle = ink; c.fillRect(0,0,W,152);
  txt('군번여지도 강원',72,96,34,650,paper);
  txt(card.example ? 'FICTIONAL TRIP' : 'GANGWON TRAVEL PASS',640,94,22,500,accent);
  txt(card.region.toUpperCase() + '  /  ' + (card.kind === 'record' ? '다녀온 하루' : card.kind === 'impact' ? '반영한 한 수' : card.kind === 'advice' ? '한 수 부탁해' : '준비하는 여행'),76,247,26,600);
  txt(card.region + ',',72,360,96,750);
  const headerEnd = wrap(card.title,72,470,930,78,750,96,2);
  let y = wrap(card.subtitle,76,Math.max(570,headerEnd+20),930,32,500,46,2) + 45;
  const photos = (card.impact || (design.countdown && design.format === 'feed')) ? [] : (await Promise.all(card.places.slice(0,4).map(async p => { try { return p.imageUrl ? await photo(p.imageUrl) : null; } catch { return null; } }))).filter((p): p is HTMLImageElement => !!p);
  if (photos.length) {
    const height = design.format === 'story' ? 440 : 200, gap = 10, n = photos.length;
    for (let i=0;i<n;i++) {
      const cols = n===1 ? 1 : 2, rows = n>2 ? 2 : 1;
      const w = n===3 && i===0 ? 458 : (936-gap*(cols-1))/cols;
      const h = n===3 && i===0 ? height : (height-gap*(rows-1))/rows;
      const x = 72+(i%cols)*(w+gap), yy = y+Math.floor(i/cols)*(h+gap);
      // Three-photo mosaic: one tall left image, two right windows.
      const px = n===3 && i>0 ? 72+468+5 : x, py = n===3 && i>0 ? y+(i-1)*(h+gap) : yy;
      const img=photos[i], scale=Math.min(w/img.naturalWidth,h/img.naturalHeight);
      c.save();c.fillStyle='#ffffff';c.fillRect(px,py,w,h);c.drawImage(img,px+(w-img.naturalWidth*scale)/2,py+(h-img.naturalHeight*scale)/2,img.naturalWidth*scale,img.naturalHeight*scale);c.restore();
    }
    y += height+48;
  }
  if (design.countdown) {
    c.fillStyle = accent; c.beginPath(); c.roundRect(72,y,936,158,24); c.fill();
    txt('복귀까지 남은 하루',104,y+48,25,600); txt(design.countdown,104,y+116,54,750); txt('카드를 만든 때 기준',677,y+112,21,500); y += 190;
  }
  if (card.impact) {
    txt('처음 계획',76,y,22,600); y = wrap(card.impact.before,76,y+48,930,35,550,46) + 20;
    c.fillStyle=accent; c.fillRect(72,y,936,4); y+=50;
    txt('한 수를 반영하면',76,y,22,600); y = wrap(card.impact.after,76,y+50,930,38,650,49) + 20;
  } else {
    const space = H - y - (card.publicId ? 400 : 260);
    const count = Math.max(0,Math.min(card.places.length,design.format === 'story' ? 6 : 3,Math.floor(space/112)));
    if (!card.places.length) { txt(card.kind==='record' ? '함께 보낸 하루를 기억해요.' : '가고 싶은 곳을 채워가는 중.',76,y+50,32,500); }
    card.places.slice(0,count).forEach((p,i) => {
      c.fillStyle=ink; c.beginPath(); c.arc(98,y+21,26,0,Math.PI*2); c.fill();
      txt(String(i+1).padStart(2,'0'),82,y+30,23,650,paper);
      wrap(p.title,152,y+33,842,39,650,48,2);
      if(i<count-1) { c.fillStyle=forest?'#c4d0ba':'#c0d3df'; c.fillRect(97,y+51,2,43); }
      y+=112;
    });
    if (count < card.places.length) txt(`외 ${card.places.length-count}곳 · 전체 ${card.places.length}곳의 여행`,152,y+15,25,500);
  }
  const footerY = H - (card.publicId ? 342 : 242);
  c.strokeStyle=forest?'#bbccb8':'#b8ccd9'; c.lineWidth=2; c.setLineDash([8,8]); c.beginPath(); c.moveTo(72,footerY); c.lineTo(1008,footerY); c.stroke(); c.setLineDash([]);
  if (card.publicId) {
    const qr=document.createElement('canvas');
    await QRCode.toCanvas(qr,origin+'/p/'+card.publicId,{width:182,margin:3,errorCorrectionLevel:'M',color:{dark:ink,light:'#ffffff'}});
    c.drawImage(qr,76,footerY+40,182,182);
    txt(card.kind==='impact'?'다음 한 수는 너의 차례.':'이 여행에 너의 한 곳을.',296,footerY+94,35,650);
    txt('QR 또는 함께 올린 링크로 참여',296,footerY+148,26,500);
    txt('가입 없이 제안 · 내 여행으로 가져오기',296,footerY+190,23,500);
  } else {
    txt(card.stamps.length ? card.stamps.join('  ·  ') : '기다리던 하루를, 함께.',76,footerY+76,31,650);
    txt('gunbeon.gangwon.kr',76,footerY+118,25,500);
  }
  txt(card.example ? '가상 인물의 체험 여행 · 실제 방문 기록 아님' : '복무 경험을 관광 경험으로.',76,H-89,23,500);
  c.font='400 17px GunbeonCard, sans-serif';c.fillStyle=ink;c.fillText(card.credit + (photos.length ? ' · 사진 제공: ⓒ한국관광공사' : ''),76,H-49,930);
  const blob = await new Promise<Blob|null>(resolve => canvas.toBlob(resolve,'image/png'));
  if (!blob) throw new Error('카드를 만들지 못했어요. 다시 시도해 주세요.');
  return blob;
}
