// Deterministic exports from the selected B vector master; no API calls.
// Run from web/: node scripts/export-brand-kit.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../../', import.meta.url));
const source = path.join(root, 'assets/brand-kit/source');
const out = path.join(root, 'assets/brand-kit/v1');
await fs.mkdir(out, { recursive: true });
const symbol = await fs.readFile(path.join(source, 'symbol.svg'), 'utf8');
const font = (await fs.readFile(path.join(source, 'PretendardVariable.woff2'))).toString('base64');
const mark = (size, color) => `<div style="width:${size}px;height:${size}px;flex:none">${(color ? symbol.replaceAll('#246568', color).replaceAll('#D68755', color) : symbol).replace('width="1000" height="1000"', 'width="100%" height="100%"')}</div>`;
const lockup = (size = 78, inverse = false) => `<div class="lockup" style="color:${inverse ? '#ffffff' : '#246568'}">${mark(size * 2, inverse ? '#fff' : null)}<div><b style="font-size:${size}px">군번여지도</b><span style="font-size:${size * .26}px">강원 · 다시 만나는 길</span></div></div>`;
const css = `@font-face{font-family:Brand;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:100 900}*{box-sizing:border-box}html,body{margin:0}body{font-family:Brand,sans-serif;color:#273b40}main{width:100vw;height:100vh;overflow:hidden}h1,p{margin:0}.lockup{display:flex;align-items:center;gap:24px}.lockup b{font-weight:780;letter-spacing:-.055em;line-height:1.2;display:block}.lockup span{display:block;letter-spacing:.08em;margin-top:10px;font-weight:520}.center{display:flex;align-items:center;justify-content:center}.promo{padding:64px 72px;position:relative;background:#f7f6f2}.kicker{font-weight:600;font-size:19px;letter-spacing:.04em}.headline{font-weight:740;letter-spacing:-.06em;line-height:1.17}.caption{line-height:1.65;color:#526667}.rule{height:1px;background:#c9d4cf}.tag{border:1px solid #ccd6d0;border-radius:30px;padding:12px 20px;font-size:18px}.tags{display:flex;gap:10px}.foot{font-size:18px;color:#526667;letter-spacing:.02em}`;
const browser = await chromium.launch({ headless: true });
const specs = [];
async function render(file, width, height, body, transparent = false) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html lang="ko"><meta charset="utf-8"><style>${css}</style><body>${body}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(out, file), omitBackground: transparent });
  specs.push({ file, width, height, transparent });
  await page.close();
}
try {
  for (const size of [140, 180, 192, 512, 1024]) {
    await render(`logo-${size}.png`, size, size, `<main class="center" style="background:white">${mark(size)}</main>`);
    if ([140, 512, 1024].includes(size))
      await render(`symbol-transparent-${size}.png`, size, size, `<main class="center">${mark(size)}</main>`, true);
  }
  await render('icon-maskable-512.png', 512, 512, `<main class="center" style="background:white">${mark(420)}</main>`);
  await render('symbol-white-512.png', 512, 512, `<main class="center">${mark(512, '#ffffff')}</main>`, true);
  await render('symbol-teal-512.png', 512, 512, `<main class="center">${mark(512, '#246568')}</main>`, true);
  await render('wordmark-horizontal.png', 1200, 320, `<main class="center">${lockup(116)}</main>`, true);
  await render('wordmark-dark.png', 1200, 320, `<main class="center" style="background:#1e393c">${lockup(116, true)}</main>`);
  await render('representative-1200x630.png', 1200, 630, `<main class="promo"><div style="display:flex;align-items:center;justify-content:space-between">${lockup(38)}<p class="kicker">휴전선 밖 첫 하루</p></div><div style="display:flex;align-items:center;justify-content:space-between;margin-top:46px"><div><h1 class="headline" style="font-size:70px">함께 짜는 휴가,<br>다시 만나는 길.</h1><p class="caption" style="font-size:22px;margin-top:24px">장병과 가족·연인·친구의<br>강원 여행 계획</p></div>${mark(315)}</div><div class="rule" style="margin-top:36px"></div><p class="foot" style="margin-top:20px">여행 계획 · 동행 그룹 · 하루의 기록</p></main>`);
  await render('social-square-1080.png', 1080, 1080, `<main class="promo" style="padding:65px 72px"><p class="kicker">군번여지도 강원 · 휴전선 밖 첫 하루</p><h1 class="headline" style="font-size:85px;margin-top:42px">함께 짜는 휴가,<br>다시 만나는 길.</h1><div class="center" style="height:490px">${mark(520)}</div><div class="rule"></div><p class="caption" style="font-size:27px;margin-top:32px">장병과 가족·연인·친구가<br>함께 계획하고, 다녀온 하루를 기록해요.</p></main>`);
  await render('story-1080x1920.png', 1080, 1920, `<main class="promo" style="padding:110px 84px"><p class="kicker" style="font-size:26px">휴전선 밖 첫 하루</p><h1 class="headline" style="font-size:98px;margin-top:68px">함께 짜는 휴가,<br>다시 만나는 길.</h1><p class="caption" style="font-size:34px;margin-top:38px">장병과 가족·연인·친구의 강원 여행</p><div class="center" style="height:770px">${mark(790)}</div><div class="tags"><span class="tag">함께 계획하기</span><span class="tag">복귀 여유 확인</span><span class="tag">하루 기록하기</span></div><div class="rule" style="margin:64px 0 46px"></div>${lockup(65)}<p class="foot" style="font-size:24px;margin-top:54px">철원 · 화천 · 양구 · 인제 · 고성</p></main>`);
  await fs.writeFile(path.join(out, 'symbol.svg'), symbol);
  await fs.writeFile(path.join(out, 'symbol-monochrome.svg'), symbol.replaceAll('#D68755', '#246568'));
  await fs.writeFile(path.join(out, 'symbol-white.svg'), symbol.replaceAll('#D68755', '#ffffff').replaceAll('#246568', '#ffffff'));
  await fs.writeFile(path.join(out, 'manifest.json'), JSON.stringify({ selected: 'B · 다시 만나는 길', version: 1, files: specs }, null, 2) + '\n');
  console.log(JSON.stringify(specs, null, 2));
} finally { await browser.close(); }
