/**
 * TourAPI 4.0 연동 모듈
 * 한국관광공사 국문 관광정보 서비스
 * 출처: ⓒ한국관광공사
 */

const API_BASE = import.meta.env.VITE_TOUR_API_BASE || '/api/tour';

/**
 * 이미지 오버라이드 맵
 * TourAPI의 firstimage가 부적절한 콘텐츠(화장실 사진 등)인 경우 대체 이미지 지정
 * 출처: 부산관광아카이브 (공공누리 제1유형)
 */
export const IMAGE_OVERRIDES = {
  '3083767': 'https://archive.visitbusan.net/upload/2025/08/11/20250811175357074972_m.png',
  '127714': 'https://tong.visitkorea.or.kr/cms/resource/19/3039219_image2_1.JPG',
};

/**
 * TourAPI 공통 호출 함수
 * - 실시간 API 호출 (파일 다운로드 후 DB 저장 불가)
 * - Cloudflare Worker 프록시를 통해 호출 (CORS 회피 + 키 보호)
 */
async function callTourApi(operation, params = {}) {
  const query = new URLSearchParams({
    MobileOS: 'ETC',
    MobileApp: 'SlowHeritage',
    _type: 'json',
    ...params,
  });

  const res = await fetch(`${API_BASE}/${operation}?${query}`);
  if (!res.ok) throw new Error(`TourAPI error: ${res.status}`);

  const data = await res.json();
  return data.response?.body?.items?.item || [];
}

/** 키워드 검색 */
export async function searchKeyword(keyword, contentTypeId, areaCode, pageNo = 1, numOfRows = 10) {
  return callTourApi('searchKeyword2', {
    keyword,
    ...(contentTypeId && { contentTypeId }),
    ...(areaCode && { areaCode }),
    pageNo,
    numOfRows,
  });
}

/** 지역 기반 관광정보 조회 */
export async function areaBasedList(areaCode, sigunguCode, contentTypeId, pageNo = 1, numOfRows = 10, { cat1, cat2, cat3 } = {}) {
  return callTourApi('areaBasedList2', {
    areaCode,
    ...(sigunguCode && { sigunguCode }),
    ...(contentTypeId && { contentTypeId }),
    ...(cat1 && { cat1 }),
    ...(cat2 && { cat2 }),
    ...(cat3 && { cat3 }),
    pageNo,
    numOfRows,
    arrange: 'R', // 제목순
  });
}

/** 위치 기반 관광정보 조회 */
export async function locationBasedList(mapX, mapY, radius = 5000, contentTypeId, pageNo = 1) {
  return callTourApi('locationBasedList2', {
    mapX,
    mapY,
    radius,
    ...(contentTypeId && { contentTypeId }),
    pageNo,
    numOfRows: 20,
  });
}

/** 상세 정보 조회 */
export async function detailCommon(contentId) {
  return callTourApi('detailCommon2', {
    contentId,
    numOfRows: 1,
  });
}

/**
 * 영문 상세 정보 조회 (EngService2)
 * contentId는 언어와 무관하게 동일 — 이름/주소/개요만 영문으로 대체 표시할 때 사용
 */
export async function detailCommonEn(contentId) {
  const query = new URLSearchParams({
    MobileOS: 'ETC',
    MobileApp: 'SlowHeritage',
    _type: 'json',
    contentId,
    numOfRows: 1,
  });
  try {
    const res = await fetch(`${API_BASE}/en/detailCommon2?${query}`);
    if (!res.ok) return null;
    const data = await res.json();
    const items = data.response?.body?.items?.item || [];
    return Array.isArray(items) ? items[0] : items;
  } catch {
    return null;
  }
}

/** 소개 정보 조회 */
export async function detailIntro(contentId, contentTypeId) {
  return callTourApi('detailIntro2', {
    contentId,
    contentTypeId,
  });
}

/** 반복 정보 조회 (관광지 내 시설 등) */
export async function detailInfo(contentId, contentTypeId) {
  return callTourApi('detailInfo2', {
    contentId,
    contentTypeId,
  });
}

/** 행사/축제 정보 조회 */
export async function searchFestival(eventStartDate, areaCode, pageNo = 1) {
  return callTourApi('searchFestival2', {
    eventStartDate,
    ...(areaCode && { areaCode }),
    pageNo,
    numOfRows: 20,
  });
}

/**
 * contentTypeId 참조:
 * 12: 관광지, 14: 문화시설, 15: 축제공연행사
 * 25: 여행코스, 28: 레포츠, 32: 숙박
 * 38: 쇼핑, 39: 음식점
 */
export const CONTENT_TYPES = {
  관광지: '12',
  문화시설: '14',
  축제: '15',
  여행코스: '25',
  레포츠: '28',
  숙박: '32',
  쇼핑: '38',
  음식점: '39',
};
