/**
 * 슬로 헤리티지 - TourAPI 프록시 Worker
 * Cloudflare Workers에서 실행
 * - API 키를 환경변수(TOUR_API_KEY)로 보호
 * - CORS 처리
 * - 실시간 API 호출
 */

const TOUR_API_BASE = 'https://apis.data.go.kr/B551011/KorService2';
const TOUR_API_BASE_EN = 'https://apis.data.go.kr/B551011/EngService2';

const ALLOWED_OPS = [
  'searchKeyword2', 'areaBasedList2', 'locationBasedList2',
  'detailCommon2', 'detailIntro2', 'detailInfo2',
  'searchFestival2', 'detailImage2',
];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);
    let path = url.pathname.replace('/api/tour/', '');

    // 영문 서비스(EngService2) 라우팅: /api/tour/en/{operation}
    let isEn = false;
    if (path.startsWith('en/')) {
      isEn = true;
      path = path.replace('en/', '');
    }
    const op = path;

    if (!ALLOWED_OPS.includes(op)) {
      return Response.json({ error: '허용되지 않은 오퍼레이션' }, { status: 400, headers: CORS });
    }

    const params = new URLSearchParams(url.search);
    params.set('serviceKey', env.TOUR_API_KEY);
    if (!params.has('_type')) params.set('_type', 'json');
    if (!params.has('MobileOS')) params.set('MobileOS', 'ETC');
    if (!params.has('MobileApp')) params.set('MobileApp', 'SlowHeritage');

    const base = isEn ? TOUR_API_BASE_EN : TOUR_API_BASE;

    try {
      const res = await fetch(`${base}/${op}?${params}`, {
        cf: { cacheTtl: 0, cacheEverything: false },
      });
      const data = await res.text();
      return new Response(data, {
        status: res.status,
        headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS },
      });
    } catch (err) {
      return Response.json({ error: 'TourAPI 호출 실패', detail: err.message }, { status: 502, headers: CORS });
    }
  },
};
