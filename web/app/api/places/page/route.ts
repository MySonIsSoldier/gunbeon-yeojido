import { env } from 'cloudflare:workers';
import { fetchRegionPage, TOUR_CONTENT_TYPES, TourError } from '@/lib/tour-api';
import { regions } from '@/lib/domain';
import { publicDataKey } from '@/lib/api-config';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const region = params.get('region') || '',
    type = params.get('type') || '',
    page = Number(params.get('page'));
  if (
    !regions.some((r) => r === region) ||
    !TOUR_CONTENT_TYPES.some((t) => t === type) ||
    !Number.isSafeInteger(page) ||
    page < 2 ||
    page > 10000
  )
    return Response.json(
      { message: '지역과 페이지를 확인해 주세요.' },
      { status: 400 },
    );
  try {
    return Response.json(
      await fetchRegionPage(
        publicDataKey(
          env as Record<string, unknown>,
          'TOUR_API_KOR_SERVICE_KEY',
        ),
        region,
        type,
        page,
      ),
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (e) {
    return Response.json(
      {
        error: e instanceof TourError ? e.code : 'UNKNOWN',
        message:
          '다음 장소를 불러오지 못했어요. 지금 보이는 장소는 그대로 두고, 잠시 후 다시 시도해 주세요.',
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
