import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { areaBasedList, searchKeyword, locationBasedList, IMAGE_OVERRIDES, detailCommonEn } from '../api/tourApi';
import { useLanguage } from '../context/LanguageContext';

const AREA_NAMES_EN = {
  '1': 'Seoul', '2': 'Incheon', '3': 'Daejeon', '4': 'Daegu', '5': 'Gwangju',
  '6': 'Busan', '7': 'Ulsan', '8': 'Sejong', '31': 'Gyeonggi', '32': 'Gangwon',
  '33': 'Chungbuk', '34': 'Chungnam', '35': 'Gyeongbuk', '36': 'Gyeongnam',
  '37': 'Jeonbuk', '38': 'Jeonnam', '39': 'Jeju',
};
const AGE_LABELS_EN = {
  baby: '0–2 yrs', toddler: '3–5 yrs', child: '6–9 yrs', upper: '10–13 yrs', middle: '14–15 yrs',
};
const INTEREST_EN = {
  '궁궐': 'Palaces', '사찰': 'Temples', '성곽': 'Fortresses', '고분': 'Ancient Tombs',
  '서원·향교': 'Confucian Schools', '박물관': 'Museums', '전통마을': 'Traditional Villages', '근현대역사': 'Modern History',
};

const AREA_NAMES = {
  '1': '서울', '2': '인천', '3': '대전', '4': '대구', '5': '광주',
  '6': '부산', '7': '울산', '8': '세종', '31': '경기', '32': '강원',
  '33': '충북', '34': '충남', '35': '경북', '36': '경남', '37': '전북',
  '38': '전남', '39': '제주',
};

const AGE_LABELS = {
  baby: '0~2세 유아', toddler: '3~5세 걸음마',
  child: '6~9세 초등 저', upper: '10~13세 초등 고', middle: '14~15세 중학생',
};

const AGE_CONFIG = {
  baby:    { maxStops: 2, maxWalk: 15, tip: '유모차 이동 가능 여부를 확인하세요. 짧은 코스가 좋습니다.' },
  toddler: { maxStops: 3, maxWalk: 25, tip: '30분 이내 도보 거리를 추천합니다. 쉴 곳이 있는지 확인하세요.' },
  child:   { maxStops: 4, maxWalk: 40, tip: '역사 퀴즈와 미션으로 아이의 흥미를 유지하세요!' },
  upper:   { maxStops: 5, maxWalk: 60, tip: '깊이 있는 역사 해설을 함께 읽어보면 좋습니다.' },
  middle:  { maxStops: 6, maxWalk: 90, tip: '자율 탐구형 코스: 교과서에서 배운 역사를 현장에서 확인해보세요!' },
};

const INTEREST_CONFIG = {
  '궁궐':      { keyword: '궁궐',     typeId: '12', cat1: 'A02', cat2: 'A0201', cat3: ['A02010100'], preciseCat3: true,
                 extraKeywords: ['궁', '왕궁', '행궁'],
                 matchKeywords: ['궁', '궁궐', '왕궁', '행궁'] },
  '사찰':      { keyword: '사찰',     typeId: '12', cat1: 'A02', cat2: 'A0201', cat3: ['A02010800'], preciseCat3: true,
                 extraKeywords: ['사찰', '절', '암자', '사'],
                 matchKeywords: ['사', '절', '암', '사찰', '암자', '선원', '총림'] },
  '성곽':      { keyword: '성곽',     typeId: '12', cat1: 'A02', cat2: 'A0201', cat3: ['A02010200'], preciseCat3: true,
                 extraKeywords: ['산성', '읍성', '성벽', '성문'],
                 matchKeywords: ['성', '산성', '읍성', '성곽', '성벽', '성문', '성터'] },
  '고분':      { keyword: '고분',     typeId: '12', cat1: 'A02', cat2: 'A0201', cat3: ['A02010700'], preciseCat3: false,
                 extraKeywords: ['고분군', '왕릉', '능', '무덤', '유적'],
                 matchKeywords: ['고분', '왕릉', '능', '무덤', '묘', '총', '유적', '릉'] },
  '서원·향교': { keyword: '서원',     typeId: '12', cat1: 'A02', cat2: 'A0201', cat3: ['A02010700'], preciseCat3: false,
                 extraKeywords: ['향교', '서당', '강당'],
                 matchKeywords: ['서원', '향교', '서당', '강당', '학당'] },
  '박물관':    { keyword: '박물관',   typeId: '14', cat1: 'A02', cat2: 'A0206', cat3: ['A02060100', 'A02060200', 'A02060300'], preciseCat3: true,
                 extraKeywords: ['역사관', '기념관', '전시관', '유물관'],
                 matchKeywords: ['박물관', '역사관', '기념관', '전시관', '유물관', '전시실'] },
  '전통마을':  { keyword: '전통마을', typeId: '12', cat1: 'A02', cat2: 'A0201', cat3: ['A02010600'], preciseCat3: true,
                 extraKeywords: ['한옥마을', '민속마을', '전통가옥'],
                 matchKeywords: ['마을', '한옥', '민속', '전통가옥', '고택', '종택'] },
  '근현대역사': { keyword: '근대역사', typeId: '12', cat1: 'A02', cat2: 'A0201', cat3: ['A02010700', 'A02011000'], preciseCat3: false,
                 extraKeywords: ['근대', '독립', '항일', '기념관', '역사관'],
                 matchKeywords: ['근대', '근현대', '독립', '항일', '기념', '역사관', '3.1', '독립운동', '일제'] },
};

/** 역사·문화 관련 cat2만 허용 (A0201=역사관광지, A0206=문화시설) */
const HERITAGE_CAT2 = new Set(['A0201', 'A0206']);

/** 부적합 장소 필터링 */
const BLOCKED_IDS = new Set([
  '3452166',  // 커넥트현대 (백화점)
  '2822910',  // 창비부산 (폐업)
  '2390314',  // 한복남 경복궁점 (한복대여점, 역사관광 부적합)
]);

const EXCLUDED_KEYWORDS = [
  // 쇼핑·상업
  '백화점', '쇼핑몰', '마트', '아울렛', '면세점', '할인매장', '대리점',
  // 숙박
  '모텔', '호텔', '리조트', '펜션', '게스트하우스', '민박', '콘도',
  // 음식
  '식당', '카페', '맛집', '레스토랑', '베이커리', '치킨', '횟집', '고깃집', '분식', '피자',
  // 오락·레저
  '노래방', '볼링장', '오락실', 'PC방', '찜질방', '사우나',
  '워터파크', '놀이공원', '테마파크', '골프', '스키장', '승마', '낚시터', '수상레저', '캠핑장', '글램핑',
  // 의료
  '병원', '의원', '치과', '약국', '한의원',
  // 교육·돌봄
  '학원', '어린이집', '유치원',
  // 생활·서비스
  '부동산', '공인중개', '세탁소', '미용실', '마사지', '에스테틱',
  // 사업체·법인
  '협동조합', '주식회사', '영농조합', '법인', '상회',
  // 산업·교통
  '공장', '제조', '산업단지', '물류센터', '주유소', '정비소', '렌터카', '터미널', '휴게소', '주차장',
  // 공연·비역사 시설
  '카드홀', '씨어터', '콘서트홀', '공연장',
  // 서점·독립출판
  '책방', '서점', '북카페',
];

function isHeritageSuitable(item) {
  if (BLOCKED_IDS.has(item.contentid)) return false;
  const title = item.title || '';
  if (EXCLUDED_KEYWORDS.some(kw => title.includes(kw))) return false;
  // cat2 카테고리 필터: 역사관광지(A0201) 또는 문화시설(A0206)만 허용
  if (item.cat2 && !HERITAGE_CAT2.has(item.cat2)) return false;
  return true;
}

/** title 기반 관심사 매칭 — 보충검색 결과에만 적용 */
function matchesInterest(item, interestKey) {
  const cfg = INTEREST_CONFIG[interestKey];
  if (!cfg?.matchKeywords) return true;
  const title = (item.title || '').toLowerCase();
  return cfg.matchKeywords.some(kw => title.includes(kw));
}



/** 교육과정 연계 데이터 (2022 개정) */
const CURRICULUM_MAP = {
  '궁궐': { grade: '초등 5~6 / 중학교', code: '[6사05-01] [9역06-01]', desc: '조선의 정치와 왕실 문화, 조선 건국과 통치 체제' },
  '사찰': { grade: '초등 5~6 / 중학교', code: '[6사04-02] [9역03-02]', desc: '고대 불교문화와 고려의 문화유산' },
  '성곽': { grade: '초등 5~6 / 중학교', code: '[6사05-02] [9역07-02]', desc: '조선 후기 변화와 문화유산의 보존' },
  '고분': { grade: '초등 5~6 / 중학교', code: '[6사04-02] [9역02-01]', desc: '고대 국가의 형성과 삼국의 발전' },
  '서원·향교': { grade: '초등 5~6 / 중학교', code: '[6사05-01] [9역06-02]', desc: '유교 문화와 조선의 사회 질서' },
  '박물관': { grade: '초등 3~6학년', code: '[4사01-01]', desc: '지역의 문화유산 탐구' },
  '전통마을': { grade: '초등 3~4학년', code: '[4사02-01]', desc: '전통 생활 문화의 이해' },
  '근현대역사': { grade: '중학교', code: '[9역14-01]', desc: '근대 국가 수립 노력과 민족 운동' },
};

/** 연령별 안전 체크리스트 */
const SAFETY_CHECKLISTS = {
  baby: [
    '유모차 이동 가능 여부를 사전에 확인했나요?',
    '기저귀·분유·이유식 등 필수 용품을 챙겼나요?',
    '수유실·기저귀 교환대 위치를 확인했나요?',
    '자외선 차단제와 모자를 준비했나요?',
    '아이가 입에 넣을 수 있는 물건에 주의하세요.',
    '비상 연락처와 가까운 병원 위치를 확인했나요?',
  ],
  toddler: [
    '편한 신발을 신겼나요? (계단·비탈길 많음)',
    '물과 간식을 충분히 챙겼나요?',
    '아이 손을 잡고 이동하세요 (문화재 주변)',
    '쉼터·화장실 위치를 미리 파악했나요?',
    '자외선 차단제와 모자를 준비했나요?',
    '비상약(반창고, 해열제 등)을 챙겼나요?',
  ],
  child: [
    '편한 운동화를 신었나요?',
    '물·간식·우산 등 기본 준비물을 확인했나요?',
    '문화재는 만지거나 올라타지 않기로 약속했나요?',
    '사진 촬영 금지 구역을 함께 확인하세요.',
    '미션 수첩이나 메모장을 준비하면 좋아요!',
    '자외선 차단 + 모자를 잊지 마세요.',
  ],
  upper: [
    '충분한 물과 간식을 챙겼나요?',
    '문화재 보호 규칙을 함께 읽어보았나요?',
    '사전 학습 자료(역사 배경)를 준비했나요?',
    '사진·메모 도구를 챙겼나요?',
    '날씨에 맞는 복장을 준비했나요?',
    '비상 연락처를 아이도 알고 있나요?',
  ],
  middle: [
    '편한 신발과 충분한 물·간식을 준비했나요?',
    '문화재 보호 규칙과 촬영 제한 구역을 확인했나요?',
    '교과서나 사전 학습 자료를 함께 준비하면 좋아요!',
    '탐구 노트나 메모 앱으로 현장 기록을 남겨보세요.',
    '날씨·복장을 확인하고 우천 시 대안을 세워두었나요?',
    '비상 연락처를 본인도 알고 있나요?',
  ],
};

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function walkMinutes(km) {
  return Math.round(km / 2.5 * 60);
}

function sortByRoute(places) {
  if (places.length <= 1) return places;
  const result = [places[0]];
  const remaining = [...places.slice(1)];
  while (remaining.length > 0) {
    const last = result[result.length - 1];
    let minDist = Infinity, minIdx = 0;
    remaining.forEach((p, i) => {
      const d = haversine(
        parseFloat(last.mapy), parseFloat(last.mapx),
        parseFloat(p.mapy), parseFloat(p.mapx)
      );
      if (d < minDist) { minDist = d; minIdx = i; }
    });
    result.push(remaining.splice(minIdx, 1)[0]);
  }
  return result;
}

function saveCourse(courseData) {
  try {
    const saved = JSON.parse(localStorage.getItem('slow_heritage_courses') || '[]');
    saved.unshift({ id: Date.now(), date: new Date().toLocaleDateString('ko-KR'), ...courseData });
    if (saved.length > 10) saved.pop();
    localStorage.setItem('slow_heritage_courses', JSON.stringify(saved));
    return true;
  } catch { return false; }
}

function SafetyChecklist({ childAge, safetyTitle }) {
  const [checked, setChecked] = useState({});
  const items = SAFETY_CHECKLISTS[childAge] || SAFETY_CHECKLISTS.child;
  const toggle = (i) => setChecked(prev => ({ ...prev, [i]: !prev[i] }));
  const allChecked = items.every((_, i) => checked[i]);

  return (
    <div className="safety-section">
      <h3 className="safety-title">{safetyTitle || '🛡️ 안전 체크리스트'}</h3>
      <p className="safety-desc">{AGE_LABELS[childAge]} 기준</p>
      <div className="safety-list">
        {items.map((item, i) => (
          <label key={i} className={`safety-item ${checked[i] ? 'checked' : ''}`}>
            <input type="checkbox" checked={!!checked[i]} onChange={() => toggle(i)} />
            <span>{item}</span>
          </label>
        ))}
      </div>
      {allChecked && <div className="safety-complete">✅ 모든 준비가 완료되었습니다! 즐거운 여행 되세요!</div>}
    </div>
  );
}

function CourseMap({ places }) {
  const mapRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [mapError, setMapError] = useState(false);

  const validPlaces = places.filter(p => p.mapx && p.mapy);

  useEffect(() => {
    if (!open || !mapRef.current || validPlaces.length === 0) return;

    const initMap = () => {
      try {
        const kakao = window.kakao;
        const bounds = new kakao.maps.LatLngBounds();
        const positions = validPlaces.map(p => {
          const pos = new kakao.maps.LatLng(parseFloat(p.mapy), parseFloat(p.mapx));
          bounds.extend(pos);
          return pos;
        });

        const map = new kakao.maps.Map(mapRef.current, { center: positions[0], level: 7 });
        map.setBounds(bounds, 60);

        validPlaces.forEach((p, i) => {
          new kakao.maps.CustomOverlay({
            map,
            position: positions[i],
            content: `<div style="background:#0e7490;color:#fff;border-radius:16px;padding:4px 10px;font-size:12px;font-weight:bold;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);white-space:nowrap;cursor:default;">${i + 1}. ${p.title}</div>`,
            yAnchor: 1.2,
          });
        });

        // 마커 사이 연결선
        if (positions.length > 1) {
          new kakao.maps.Polyline({
            map,
            path: positions,
            strokeWeight: 3,
            strokeColor: '#0e7490',
            strokeOpacity: 0.5,
            strokeStyle: 'dash',
          });
        }

        map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);
      } catch (e) {
        console.error('CourseMap init error:', e);
        setMapError(true);
      }
    };

    if (window.kakao?.maps?.LatLng) {
      initMap();
    } else if (window.kakao?.maps?.load) {
      window.kakao.maps.load(initMap);
    } else {
      setMapError(true);
    }
  }, [open, validPlaces.length]);

  if (validPlaces.length === 0) return null;

  return (
    <div className="no-print" style={{marginBottom:'16px'}}>
      <button
        onClick={() => setOpen(!open)}
        style={{width:'100%',padding:'12px 16px',background:'linear-gradient(135deg,#ecfdf5,#d1fae5)',border:'1px solid #6ee7b7',borderRadius: open ? '12px 12px 0 0' : '12px',cursor:'pointer',display:'flex',alignItems:'center',gap:'10px',fontSize:'14px',fontWeight:'700',color:'#065f46'}}
      >
        <span style={{fontSize:'20px'}}>📍</span>
        <div style={{flex:1,textAlign:'left'}}>
          <div>지도에서 위치 확인</div>
          <div style={{fontSize:'12px',fontWeight:'400',color:'#047857',marginTop:'2px'}}>각 장소의 위치와 거리를 한눈에 확인할 수 있어요</div>
        </div>
        <span style={{fontSize:'13px',transition:'transform 0.2s',transform:open?'rotate(180deg)':'rotate(0)'}}>▼</span>
      </button>
      {open && (
        <div style={{border:'1px solid #6ee7b7',borderTop:'none',borderRadius:'0 0 12px 12px',overflow:'hidden'}}>
          {mapError ? (
            <p style={{padding:'20px',textAlign:'center',color:'#666',fontSize:'14px'}}>지도를 불러올 수 없습니다.</p>
          ) : (
            <div ref={mapRef} style={{width:'100%',height:'280px'}} />
          )}
        </div>
      )}
    </div>
  );
}

export default function Result() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [course, setCourse] = useState([]);
  const [allPlaces, setAllPlaces] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [enNames, setEnNames] = useState({}); // contentid -> { title, addr1 }

  const region = searchParams.get('region');
  const childAge = searchParams.get('childAge') || 'child';
  const courseType = searchParams.get('courseType') || 'half';
  const interests = searchParams.get('interests')?.split(',').filter(Boolean) || [];

  const ageConf = AGE_CONFIG[childAge] || AGE_CONFIG.child;
  const maxStops = courseType === 'full'
    ? Math.min(ageConf.maxStops + 2, 6)
    : Math.min(ageConf.maxStops, 4);

  useEffect(() => {
    async function buildCourse() {
      setLoading(true);
      setError(null);
      try {
        let items = [];
        if (interests.length > 0) {
          // ① 1차: 기본 키워드 + 확장 키워드 검색
          const searches = [];
          for (const i of interests) {
            const conf = INTEREST_CONFIG[i];
            const kw = conf?.keyword || i;
            const tid = conf?.typeId || '12';
            // 기본 키워드
            searches.push(searchKeyword(kw, tid, region, 1, 30));
            // 확장 키워드
            if (conf?.extraKeywords) {
              for (const ek of conf.extraKeywords) {
                searches.push(searchKeyword(ek, tid, region, 1, 20));
              }
            }
            // 박물관 추가: typeId 12에도 등록된 경우
            if (i === '박물관') {
              searches.push(searchKeyword('박물관', '12', region, 1, 30));
              const areaName = AREA_NAMES[region] || '';
              if (areaName) {
                searches.push(searchKeyword(areaName + '박물관', '14', '', 1, 20));
                searches.push(searchKeyword(areaName + '박물관', '12', '', 1, 20));
              }
            }
          }
          const results = await Promise.allSettled(searches);
          const seen = new Set();
          for (const r of results) {
            if (r.status !== 'fulfilled') continue;
            const arr = Array.isArray(r.value) ? r.value : [];
            for (const item of arr) {
              if (!seen.has(item.contentid)) { seen.add(item.contentid); items.push(item); }
            }
          }
        }
        // ② 보충: 정밀 cat3가 있으면 서버측 필터링, 넓은 cat3면 키워드 보충
        if (items.length < maxStops + 5 && interests.length > 0) {
          const cfg = INTEREST_CONFIG[interests[0]] || {};
          const supplementSearches = [];
          if (cfg.preciseCat3) {
            // 정밀 cat3: areaBasedList에 cat3까지 전달
            for (const c3 of (cfg.cat3 || [])) {
              supplementSearches.push(
                areaBasedList(region, '', cfg.typeId, 1, 50, { cat1: cfg.cat1, cat2: cfg.cat2, cat3: c3 })
              );
            }
          } else {
            // 넓은 cat3: 키워드 다중 검색으로 대체
            const allKws = [cfg.keyword, ...(cfg.extraKeywords || [])];
            const areaName = AREA_NAMES[region] || '';
            for (const kw of allKws) {
              supplementSearches.push(searchKeyword(kw, cfg.typeId, region, 1, 30));
              if (areaName) {
                supplementSearches.push(searchKeyword(areaName + kw, cfg.typeId, '', 1, 20));
              }
            }
          }
          const supplementResults = await Promise.allSettled(supplementSearches);
          const seen = new Set(items.map(i => i.contentid));
          for (const r of supplementResults) {
            if (r.status !== 'fulfilled') continue;
            const arr = Array.isArray(r.value) ? r.value : [];
            for (const item of arr) {
              if (!seen.has(item.contentid)) { seen.add(item.contentid); items.push(item); }
            }
          }
        }
        // ③ title 기반 후필터링: 보충검색 결과에서 관심사와 무관한 장소 제거
        const activeInterest = interests[0] || '';
        if (activeInterest && INTEREST_CONFIG[activeInterest]?.matchKeywords) {
          items = items.filter(item => matchesInterest(item, activeInterest));
        }
        // IMAGE_OVERRIDES 적용 (부적절한 대표이미지 교체)
        items = items.map(i => {
          if (IMAGE_OVERRIDES[String(i.contentid)]) {
            return { ...i, firstimage: IMAGE_OVERRIDES[String(i.contentid)] };
          }
          return i;
        });
        items = items.filter(i => i.firstimage && i.mapx && i.mapy && isHeritageSuitable(i));
        const sorted = sortByRoute(items);
        setAllPlaces(sorted);
        setCourse(sorted.slice(0, maxStops));
      } catch (err) {
        console.error('코스 생성 실패:', err);
        setError('코스를 생성하는 데 실패했습니다. 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    }
    if (region) buildCourse();
  }, [region, childAge, courseType, interests.join(',')]);

  // 영어 모드: 코스에 포함된 장소들의 영문 이름/주소를 EngService2로 조회
  useEffect(() => {
    if (lang !== 'en' || course.length === 0) return;
    let cancelled = false;
    (async () => {
      const targets = course.filter(p => !enNames[p.contentid]);
      if (targets.length === 0) return;
      const results = await Promise.allSettled(targets.map(p => detailCommonEn(p.contentid)));
      if (cancelled) return;
      setEnNames(prev => {
        const next = { ...prev };
        results.forEach((r, i) => {
          if (r.status === 'fulfilled' && r.value) {
            next[targets[i].contentid] = { title: r.value.title, addr1: r.value.addr1 };
          }
        });
        return next;
      });
    })();
    return () => { cancelled = true; };
  }, [lang, course]);

  const displayName = (place) => (lang === 'en' && enNames[place.contentid]?.title) || place.title;
  const displayAddr = (place) => (lang === 'en' && enNames[place.contentid]?.addr1) || place.addr1;

  let totalDist = 0;
  const segments = [];
  for (let i = 1; i < course.length; i++) {
    const d = haversine(
      parseFloat(course[i-1].mapy), parseFloat(course[i-1].mapx),
      parseFloat(course[i].mapy), parseFloat(course[i].mapx)
    );
    totalDist += d;
    segments.push({ dist: d, walk: walkMinutes(d) });
  }
  const totalWalk = segments.reduce((s, seg) => s + seg.walk, 0);
  const totalTime = totalWalk + course.length * 30;

  const handleSaveCourse = () => {
    const ok = saveCourse({
      region: AREA_NAMES[region], childAge, courseType, interests,
      places: course.map(p => ({ title: p.title, contentid: p.contentid, addr: p.addr1 })),
      totalDist: totalDist.toFixed(1), totalTime,
    });
    if (ok) setSaved(true);
  };

  const courseIds = new Set(course.map(p => p.contentid));
  const unselected = allPlaces.filter(p => !courseIds.has(p.contentid));

  const togglePlace = (place) => {
    if (courseIds.has(place.contentid)) {
      setCourse(prev => prev.filter(p => p.contentid !== place.contentid));
    } else {
      setCourse(prev => [...prev, place]);
    }
    setSaved(false);
  };

  const moveUp = (idx) => {
    if (idx <= 0) return;
    setCourse(prev => {
      const arr = [...prev];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return arr;
    });
    setSaved(false);
  };

  const moveDown = (idx) => {
    if (idx >= course.length - 1) return;
    setCourse(prev => {
      const arr = [...prev];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return arr;
    });
    setSaved(false);
  };

  const curricula = interests.map(i => CURRICULUM_MAP[i]).filter(Boolean);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>AI가 맞춤 코스를 만들고 있습니다...</p>
        <p className="loading-sub">
          {childAge === 'baby' ? '유모차 경로를 확인하는 중' :
           childAge === 'toddler' ? '짧은 거리 위주로 선별 중' :
           '역사 명소를 연결하는 중'}
        </p>
      </div>
    );
  }

  if (error) return <div className="error">{error}</div>;

  // ⑤ 결과 부족 시 안내
  if (!loading && allPlaces.length === 0) {
    const noResAreaLabel = lang === 'en' ? (AREA_NAMES_EN[region] || AREA_NAMES[region]) : AREA_NAMES[region];
    const noResInterestLabels = interests.map(i => lang === 'en' ? (INTEREST_EN[i] || i) : i);
    return (
      <div className="result" translate="no">
        <button className="btn-back" onClick={() => navigate(-1)}>{t('backToSetup')}</button>
        <div style={{textAlign:'center',padding:'60px 20px'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>🏛️</div>
          <h2 style={{fontSize:'20px',marginBottom:'12px'}}>{t('noResultsTitle')}</h2>
          <p style={{fontSize:'15px',color:'#666',lineHeight:'1.6'}}>
            {lang === 'en'
              ? <><strong>{noResInterestLabels.join(', ')}</strong> places are not yet listed in <strong>{noResAreaLabel}</strong>.</>
              : <><strong>{noResAreaLabel}</strong> 지역에 <strong>{noResInterestLabels.join(', ')}</strong> 관련 장소가 등록되어 있지 않습니다.</>}
          </p>
          <p style={{fontSize:'14px',color:'#888',marginTop:'8px'}}>{t('noResultsHint')}</p>
          <button onClick={() => navigate(-1)} style={{marginTop:'24px',padding:'12px 32px',background:'#3498db',color:'white',border:'none',borderRadius:'8px',fontSize:'15px',cursor:'pointer'}}>
            {t('resetBtn')}
          </button>
        </div>
        <p className="source-credit">{t('dataSource')}</p>
      </div>
    );
  }

  const areaLabel = lang === 'en' ? (AREA_NAMES_EN[region] || AREA_NAMES[region]) : AREA_NAMES[region];
  const ageLabel = lang === 'en' ? (AGE_LABELS_EN[childAge] || AGE_LABELS[childAge]) : AGE_LABELS[childAge];
  const interestLabels = interests.map(i => lang === 'en' ? (INTEREST_EN[i] || i) : i);

  return (
    <div className="result" id="printable-result" translate="no">
      <button className="btn-back" onClick={() => navigate(-1)}>{t('backToSetup')}</button>

      <h2>{courseType === 'full' ? t('resultTitleFull') : t('resultTitleHalf')}</h2>
      <p className="result-meta">
        {areaLabel} · {ageLabel}
        {interestLabels.length > 0 && ` · ${interestLabels.join(', ')}`}
      </p>

      {lang === 'en' && (
        <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'12px',padding:'10px 14px',marginBottom:'14px',fontSize:'12px',color:'#1e40af',lineHeight:'1.6'}}>
          {t('enNote')}
        </div>
      )}

      {/* 오버투어리즘 분산 — 한적한 명소 배너 */}
      {course.length > 0 && (
        <div style={{background:'linear-gradient(135deg,#ecfdf5,#f0fdfa)',border:'1px solid #99f6e4',borderRadius:'14px',padding:'12px 16px',marginBottom:'14px',display:'flex',alignItems:'flex-start',gap:'10px'}}>
          <span style={{fontSize:'22px',flexShrink:0,marginTop:'1px'}}>🌿</span>
          <div>
            <div style={{fontWeight:'700',fontSize:'14px',color:'#065f46',marginBottom:'4px'}}>
              {t('overtourismBannerTitle')}
            </div>
            <div style={{fontSize:'12px',color:'#047857',lineHeight:'1.5'}}>
              {lang === 'en'
                ? `Based on Korea Tourism Organization data, we selected lesser-visited heritage sites in ${areaLabel} to explore at a relaxed pace with your kids.`
                : `한국관광공사 데이터 기반으로 관광지 쏠림이 적은 ${AREA_NAMES[region]} 지역의 숨은 역사·문화 유적을 선별했습니다. 아이와 여유롭게 둘러보세요.`}
            </div>
            <div style={{display:'flex',gap:'6px',marginTop:'8px',flexWrap:'wrap'}}>
              <span style={{background:'#d1fae5',color:'#065f46',fontSize:'11px',padding:'3px 10px',borderRadius:'20px',fontWeight:'600',border:'1px solid #a7f3d0'}}>{t('overtourismTag1')}</span>
              <span style={{background:'#d1fae5',color:'#065f46',fontSize:'11px',padding:'3px 10px',borderRadius:'20px',fontWeight:'600',border:'1px solid #a7f3d0'}}>{t('overtourismTag2')}</span>
              <span style={{background:'#d1fae5',color:'#065f46',fontSize:'11px',padding:'3px 10px',borderRadius:'20px',fontWeight:'600',border:'1px solid #a7f3d0'}}>{t('overtourismTag3')}</span>
            </div>
          </div>
        </div>
      )}

      {/* 편집 안내 배너 */}
      {course.length > 0 && unselected.length > 0 && !editMode && (
        <div className="edit-banner no-print" onClick={() => setEditMode(true)} style={{background:'linear-gradient(135deg,#e8f4fd,#f0e6ff)',padding:'12px 16px',borderRadius:'10px',marginBottom:'16px',cursor:'pointer',border:'1px solid #d0d7de',display:'flex',alignItems:'center',gap:'10px'}}>
          <span style={{fontSize:'22px'}}>✏️</span>
          <div>
            <strong style={{fontSize:'14px'}}>마음에 안 드는 장소가 있나요?</strong>
            <p style={{fontSize:'13px',color:'#555',margin:'2px 0 0'}}>장소 추가·제거, 방문 순서 변경이 가능해요. ({unselected.length}개 추가 장소 대기 중)</p>
          </div>
          <span style={{marginLeft:'auto',color:'#0e7490',fontWeight:'bold',fontSize:'14px',whiteSpace:'nowrap'}}>수정하기 →</span>
        </div>
      )}

      {/* 교육과정 연계 */}
      {curricula.length > 0 && (
        <div className="curriculum-section">
          <h3 className="curriculum-title">📚 교육과정 연계</h3>
          {curricula.map((c, i) => (
            <div key={i} className="curriculum-tag">
              <span className="curriculum-grade">{c.grade}</span>
              <span className="curriculum-code">{c.code}</span>
              <span className="curriculum-desc">{c.desc}</span>
            </div>
          ))}
        </div>
      )}

      <div className="course-summary">
        <div className="summary-item">
          <span className="summary-num">{course.length}</span>
          <span className="summary-label">{t('summaryStops')}</span>
        </div>
        <div className="summary-item">
          <span className="summary-num">{totalDist < 1 ? `${Math.round(totalDist*1000)}m` : `${totalDist.toFixed(1)}km`}</span>
          <span className="summary-label">{t('summaryDist')}</span>
        </div>
        <div className="summary-item">
          <span className="summary-num">{totalTime < 60 ? (lang === 'en' ? `${totalTime} min` : `${totalTime}분`) : (lang === 'en' ? `${Math.floor(totalTime/60)}h ${totalTime%60}m` : `${Math.floor(totalTime/60)}시간 ${totalTime%60}분`)}</span>
          <span className="summary-label">{t('summaryTime')}</span>
        </div>
      </div>

      {/* 나이별 팁 — 강조 배너 */}
      <div style={{background:'#fffbeb',border:'1px solid #fbbf24',borderRadius:'14px',padding:'10px 14px',marginBottom:'12px',display:'flex',alignItems:'flex-start',gap:'8px'}}>
        <span style={{fontSize:'18px',flexShrink:0,marginTop:'1px'}}>💡</span>
        <span style={{fontSize:'13px',color:'#92400e',lineHeight:'1.5',fontWeight:'500'}}>{ageConf.tip}</span>
      </div>

      {/* 액션 버튼 바 */}
      <div style={{display:'flex',gap:'8px',marginBottom:'14px'}}>
        <button className={`btn-save ${saved ? 'saved' : ''}`} onClick={handleSaveCourse} disabled={saved || course.length === 0} style={{flex:1,padding:'12px',borderRadius:'10px',border:'none',fontWeight:'700',fontSize:'14px',cursor:'pointer',background: saved ? '#d1fae5' : 'linear-gradient(135deg,#0e7490,#0891b2)',color: saved ? '#065f46' : '#fff',boxShadow: saved ? 'none' : '0 2px 8px rgba(14,116,144,0.3)',transition:'all 0.2s'}}>
          {saved ? t('savedBtn') : t('saveCourseBtn')}
        </button>
        <button className="no-print" onClick={() => setEditMode(!editMode)} style={{padding:'12px 16px',borderRadius:'10px',border: editMode ? '2px solid #e74c3c' : '2px solid #3498db',background: editMode ? '#fef2f2' : '#eff6ff',color: editMode ? '#dc2626' : '#2563eb',fontWeight:'700',fontSize:'14px',cursor:'pointer',transition:'all 0.2s'}}>
          {editMode ? t('editDoneBtn') : t('editBtn')}
        </button>
        <button className="no-print" onClick={() => window.print()} style={{padding:'12px 16px',borderRadius:'10px',border:'2px solid #e2e8f0',background:'#f8fafc',color:'#475569',fontWeight:'700',fontSize:'14px',cursor:'pointer'}}>
          🖨️
        </button>
      </div>

      {/* 이용 팁 — 통합 패널 (기본 닫힘) */}
      <div className="no-print" style={{background:'#f8fafc',border:'1px solid #cbd5e1',borderRadius:'14px',marginBottom:'14px',overflow:'hidden'}}>
        <button onClick={(e) => { const panel = e.currentTarget.nextElementSibling; panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; e.currentTarget.querySelector('.arr').style.transform = panel.style.display === 'none' ? 'rotate(0)' : 'rotate(180deg)'; }} style={{width:'100%',padding:'13px 16px',background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:'8px',fontSize:'14px',fontWeight:'700',color:'#334155',textAlign:'left'}}>
          <span style={{fontSize:'16px'}}>📋</span>
          <span style={{flex:1}}>이용 팁 — 저장·편집·상세보기</span>
          <span className="arr" style={{fontSize:'11px',color:'#94a3b8',transition:'transform 0.2s'}}>▼</span>
        </button>
        <div style={{display:'none',padding:'0 16px 14px'}}>
          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            <div style={{display:'flex',gap:'10px',alignItems:'flex-start'}}>
              <span style={{width:'26px',height:'26px',borderRadius:'50%',background:'#0e7490',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',flexShrink:0,fontWeight:'700'}}>1</span>
              <p style={{fontSize:'13px',color:'#334155',lineHeight:'1.6',margin:0}}>각 장소를 <strong>터치</strong>하면 역사 이야기, 퀴즈, 카카오맵 길찾기를 볼 수 있어요.</p>
            </div>
            <div style={{display:'flex',gap:'10px',alignItems:'flex-start'}}>
              <span style={{width:'26px',height:'26px',borderRadius:'50%',background:'#0e7490',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',flexShrink:0,fontWeight:'700'}}>2</span>
              <p style={{fontSize:'13px',color:'#334155',lineHeight:'1.6',margin:0}}><strong>편집</strong> 버튼으로 순서 변경·제거, 아래 <strong>'추가 가능한 장소'</strong>에서 <strong>+</strong>로 추가할 수 있어요.</p>
            </div>
            <div style={{display:'flex',gap:'10px',alignItems:'flex-start'}}>
              <span style={{width:'26px',height:'26px',borderRadius:'50%',background:'#0e7490',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',flexShrink:0,fontWeight:'700'}}>3</span>
              <p style={{fontSize:'13px',color:'#334155',lineHeight:'1.6',margin:0}}>저장된 코스는 상단 <strong>📋 저장코스</strong>에서 다시 확인 (최대 10개).</p>
            </div>
            <div style={{display:'flex',gap:'10px',alignItems:'flex-start'}}>
              <span style={{width:'26px',height:'26px',borderRadius:'50%',background:'#0e7490',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',flexShrink:0,fontWeight:'700'}}>4</span>
              <p style={{fontSize:'13px',color:'#334155',lineHeight:'1.6',margin:0}}><strong>🖨️ 인쇄</strong>로 코스 전체를 PDF 저장·출력할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>

      {editMode && (
        <div className="no-print" style={{background:'linear-gradient(135deg,#ecfdf5,#f0fdfa)',border:'2px solid #14b8a6',padding:'14px 16px',borderRadius:'14px',fontSize:'14px',marginBottom:'14px',lineHeight:'1.6',color:'#0f766e'}}>
          <div style={{fontWeight:'800',fontSize:'15px',marginBottom:'6px'}}>✏️ 마음에 안 드는 장소가 있나요?</div>
          <div style={{fontSize:'13px',color:'#115e59'}}>
            각 장소의 <span style={{display:'inline-block',background:'#ef4444',color:'#fff',borderRadius:'4px',padding:'1px 6px',fontSize:'12px',fontWeight:'700'}}>X</span>로 제거하고,
            <span style={{display:'inline-block',background:'#0e7490',color:'#fff',borderRadius:'4px',padding:'1px 6px',fontSize:'12px',fontWeight:'700'}}>위</span>
            <span style={{display:'inline-block',background:'#0e7490',color:'#fff',borderRadius:'4px',padding:'1px 6px',fontSize:'12px',fontWeight:'700'}}>아래</span>로 순서를 바꿔보세요.
            아래 <strong>'추가 가능한 장소'</strong>에서 <span style={{display:'inline-block',background:'#059669',color:'#fff',borderRadius:'4px',padding:'1px 6px',fontSize:'12px',fontWeight:'700'}}>+</span>를 눌러 새 장소도 넣을 수 있어요.
          </div>
        </div>
      )}

      <CourseMap places={course} />

      {course.length === 0 ? (
        <p className="no-result">{t('noResultsNotFound')}</p>
      ) : (
        <div className="course-timeline">
          {course.map((place, idx) => (
            <div key={place.contentid} className="course-stop">
              {idx > 0 && segments[idx-1] && (
                <div className="course-travel">
                  <div className="travel-line" />
                  <span className="travel-info">
                    {idx}번 → {idx+1}번: 🚶 도보 {segments[idx-1].walk}분 ({segments[idx-1].dist < 1 ? `${Math.round(segments[idx-1].dist*1000)}m` : `${segments[idx-1].dist.toFixed(1)}km`})
                    {segments[idx-1].dist > 3 && ' · 🚗 차량 이동 추천'}
                  </span>
                </div>
              )}
              <div style={{position:'relative'}}>
                {editMode && (
                  <div className="edit-controls no-print" style={{position:'absolute',right:'8px',top:'8px',zIndex:10,display:'flex',gap:'4px'}}
                    onClick={(e) => e.preventDefault()}>
                    <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); moveUp(idx); }} disabled={idx===0} style={{width:'36px',height:'36px',border:'none',borderRadius:'8px',background:'#0e7490',cursor:'pointer',fontSize:'13px',fontWeight:'bold',lineHeight:'1',color:'#fff',opacity:idx===0?0.4:1,boxShadow:'0 1px 4px rgba(0,0,0,0.15)'}} title="위로">위</button>
                    <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); moveDown(idx); }} disabled={idx===course.length-1} style={{width:'36px',height:'36px',border:'none',borderRadius:'8px',background:'#0e7490',cursor:'pointer',fontSize:'13px',fontWeight:'bold',lineHeight:'1',color:'#fff',opacity:idx===course.length-1?0.4:1,boxShadow:'0 1px 4px rgba(0,0,0,0.15)'}} title="아래로">아래</button>
                    <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); togglePlace(place); }} style={{width:'36px',height:'36px',border:'none',borderRadius:'8px',background:'#ef4444',color:'#fff',cursor:'pointer',fontSize:'16px',fontWeight:'bold',lineHeight:'1',boxShadow:'0 1px 4px rgba(0,0,0,0.15)'}} title="제거">X</button>
                  </div>
                )}
                <Link to={`/detail/${place.contentid}?typeId=${place.contenttypeid}&childAge=${childAge}`} className="stop-card">
                  <div className="stop-number">{idx + 1}</div>
                  {place.firstimage && <img src={place.firstimage} alt={place.title} className="stop-img" loading="lazy" />}
                  <div className="stop-info">
                    <h3>{displayName(place)}</h3>
                    <p className="stop-addr">{displayAddr(place)}</p>
                    <div style={{display:'flex',gap:'4px',flexWrap:'wrap',margin:'4px 0'}}>
                      <span style={{background:'#ecfdf5',color:'#065f46',fontSize:'11px',padding:'2px 8px',borderRadius:'12px',border:'1px solid #a7f3d0',fontWeight:'600'}}>숨은 명소</span>
                      {CURRICULUM_MAP[interests[0]] && <span style={{background:'#fef3c7',color:'#92400e',fontSize:'11px',padding:'2px 8px',borderRadius:'12px',border:'1px solid #fde68a',fontWeight:'600'}}>교과 연계</span>}
                    </div>
                    <p className="stop-time">⏱ 추천 체류 {childAge === 'baby' ? '20분' : '30~40분'}</p>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 편집 모드: 추가 가능한 장소 */}
      {editMode && unselected.length > 0 && (
        <div className="unselected-places no-print" style={{marginTop:'20px',padding:'16px',background:'#f8f9fa',borderRadius:'12px'}}>
          <h3 style={{fontSize:'16px',marginBottom:'12px'}}>📍 추가 가능한 장소 ({unselected.length}개)</h3>
          {unselected.map(place => (
            <div key={place.contentid} style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 12px',background:'#fff',borderRadius:'8px',marginBottom:'8px',border:'1px solid #e0e0e0'}}>
              {place.firstimage && <img src={place.firstimage} alt={place.title} style={{width:'50px',height:'50px',objectFit:'cover',borderRadius:'6px'}} />}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:'bold',fontSize:'14px'}}>{place.title}</div>
                <div style={{fontSize:'12px',color:'#666',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{place.addr1}</div>
              </div>
              <button onClick={() => togglePlace(place)} style={{width:'32px',height:'32px',border:'1px solid #27ae60',borderRadius:'6px',background:'#27ae60',color:'#fff',cursor:'pointer',fontSize:'18px',flexShrink:0}} title="코스에 추가">+</button>
            </div>
          ))}
        </div>
      )}

      {course.length > 0 && <SafetyChecklist childAge={childAge} safetyTitle={t('safetyTitle')} />}

      <p className="data-source">{t('dataSource')}</p>
    </div>
  );
}
