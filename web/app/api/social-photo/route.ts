/** Same-origin, uncached relay solely for KTO photos in user-requested PNG cards.
 * The provider has no canvas CORS headers. No arbitrary URL, redirect or DB write.
 */
export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get('path') || '';
  if (!/^\/cms\/(?:resource|resource_photo)\/\d{1,4}\/\d{1,12}_[a-zA-Z0-9_]+\.(?:jpg|jpeg|png|bmp)$/i.test(path))
    return new Response('Invalid photo', { status: 400 });
  try {
    const response = await fetch('https://tong.visitkorea.or.kr' + path, { redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(12000) });
    const type = response.headers.get('content-type') || '';
    if (!response.ok || !/^image\/(jpg|jpeg|png|bmp|x-ms-bmp)(;|$)/.test(type)) throw new Error('PHOTO_UNAVAILABLE');
    const reader = response.body?.getReader();
    if (!reader) throw new Error('PHOTO_UNAVAILABLE');
    const parts: Uint8Array[] = []; let size = 0;
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 8 * 1024 * 1024) { await reader.cancel(); throw new Error('PHOTO_TOO_LARGE'); }
      parts.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const part of parts) { bytes.set(part, offset); offset += part.byteLength; }
    return new Response(bytes, { headers: { 'Content-Type': type, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return new Response('Photo unavailable', { status: 502, headers: { 'Cache-Control': 'no-store' } }); }
}
