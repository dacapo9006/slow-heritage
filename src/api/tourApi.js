/**
 * TourAPI 4.0 연동 모듈
 * 한국관광공사 국문 관광정보 서비스
 * 출처: ⓒ한국관광공사
 */

const API_BASE = import.meta.env.VITE_TOUR_API_BASE || '/api/tour';

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

export async function searchKeyword(keyword, contentTypeId, areaCode, pageNo = 1, numOfRows = 10) {
  return callTourApi('searchKeyword2', {
    keyword,
    ...(contentTypeId && { contentTypeId }),
    ...(areaCode && { areaCode }),
    pageNo, numOfRows,
  });
}

export async function areaBasedList(areaCode, sigunguCode, contentTypeId, pageNo = 1, numOfRows = 10) {
  return callTourApi('areaBasedList2', {
    areaCode,
    ...(sigunguCode && { sigunguCode }),
    ...(contentTypeId && { contentTypeId }),
    pageNo, numOfRows, arrange: 'R',
  });
}

export async function locationBasedList(mapX, mapY, radius = 5000, contentTypeId, pageNo = 1) {
  return callTourApi('locationBasedList2', {
    mapX, mapY, radius,
    ...(contentTypeId && { contentTypeId }),
    pageNo, numOfRows: 20,
  });
}

export async function detailCommon(contentId) {
  return callTourApi('detailCommon2', { contentId, numOfRows: 1 });
}

export async function detailIntro(contentId, contentTypeId) {
  return callTourApi('detailIntro2', { contentId, contentTypeId });
}

export async function detailInfo(contentId, contentTypeId) {
  return callTourApi('detailInfo2', { contentId, contentTypeId });
}

export async function searchFestival(eventStartDate, areaCode, pageNo = 1) {
  return callTourApi('searchFestival2', {
    eventStartDate,
    ...(areaCode && { areaCode }),
    pageNo, numOfRows: 20,
  });
}

export const CONTENT_TYPES = {
  관광지: '12', 문화시설: '14', 축제: '15',
  여행코스: '25', 레포츠: '28', 숙박: '32',
  쇼핑: '38', 음식점: '39',
};
