import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { areaBasedList, searchKeyword, locationBasedList } from '../api/tourApi';

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

const INTEREST_KEYWORDS = {
  '궁궐': '궁궐', '사찰': '사찰', '성곽': '성곽', '고분': '고분',
  '서원·향교': '서원', '박물관': '박물관', '전통마을': '전통마을', '근현대역사': '근대역사',
};

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

function SafetyChecklist({ childAge }) {
  const [checked, setChecked] = useState({});
  const items = SAFETY_CHECKLISTS[childAge] || SAFETY_CHECKLISTS.child;
  const toggle = (i) => setChecked(prev => ({ ...prev, [i]: !prev[i] }));
  const allChecked = items.every((_, i) => checked[i]);

  return (
    <div className="safety-section">
      <h3 className="safety-title">🛡️ 안전 체크리스트</h3>
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

export default function Result() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

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
          const searches = interests.map(i =>
            searchKeyword(INTEREST_KEYWORDS[i] || i, '12', region, 1, 15)
          );
          const results = await Promise.all(searches);
          const seen = new Set();
          for (const arr of results) {
            for (const item of arr) {
              if (!seen.has(item.contentid)) { seen.add(item.contentid); items.push(item); }
            }
          }
        }
        if (items.length < maxStops + 5) {
          const areaItems = await areaBasedList(region, '', '12', 1, 20);
          const seen = new Set(items.map(i => i.contentid));
          for (const item of areaItems) {
            if (!seen.has(item.contentid)) { seen.add(item.contentid); items.push(item); }
          }
        }
        const culture = await areaBasedList(region, '', '14', 1, 10);
        const seen3 = new Set(items.map(i => i.contentid));
        for (const item of culture) {
          if (!seen3.has(item.contentid)) items.push(item);
        }
        items = items.filter(i => i.firstimage && i.mapx && i.mapy);
        if (items.length > maxStops) {
          items = sortByRoute(items).slice(0, maxStops);
        } else {
          items = sortByRoute(items);
        }
        setCourse(items);
      } catch (err) {
        console.error('코스 생성 실패:', err);
        setError('코스를 생성하는 데 실패했습니다. 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    }
    if (region) buildCourse();
  }, [region, childAge, courseType, interests.join(',')]);

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

  return (
    <div className="result" id="printable-result">
      <button className="btn-back" onClick={() => navigate(-1)}>← 다시 설정</button>

      <h2>{courseType === 'full' ? '하루' : '반나절'} 역사여행 코스</h2>
      <p className="result-meta">
        {AREA_NAMES[region]} · {AGE_LABELS[childAge]}
        {interests.length > 0 && ` · ${interests.join(', ')}`}
      </p>

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
          <span className="summary-label">방문지</span>
        </div>
        <div className="summary-item">
          <span className="summary-num">{totalDist < 1 ? `${Math.round(totalDist*1000)}m` : `${totalDist.toFixed(1)}km`}</span>
          <span className="summary-label">총 거리</span>
        </div>
        <div className="summary-item">
          <span className="summary-num">{totalTime < 60 ? `${totalTime}분` : `${Math.floor(totalTime/60)}시간 ${totalTime%60}분`}</span>
          <span className="summary-label">예상 소요</span>
        </div>
      </div>

      <div className="result-tip">
        <span className="tip-icon">💡</span>
        <span>{ageConf.tip}</span>
      </div>

      {/* 코스 저장 + 인쇄 */}
      <div className="result-actions">
        <button className={`btn-save ${saved ? 'saved' : ''}`} onClick={handleSaveCourse} disabled={saved || course.length === 0}>
          {saved ? "✅ 저장됨" : "💾 이 코스 저장하기"}
        </button>
        <button className="btn-print no-print" onClick={() => window.print()}>🖨️ 인쇄</button>
      </div>
      <p className="save-guide no-print">💡 저장된 코스는 상단 <strong>📋 저장코스</strong>에서 다시 볼 수 있어요 (이 브라우저에 최대 10개 보관). 인쇄 버튼을 누르면 코스 전체를 PDF로 저장하거나 출력할 수 있습니다.</p>

      {course.length === 0 ? (
        <p className="no-result">조건에 맞는 관광지를 찾지 못했습니다. 다른 지역이나 관심분야를 선택해보세요.</p>
      ) : (
        <div className="course-timeline">
          {course.map((place, idx) => (
            <div key={place.contentid} className="course-stop">
              {idx > 0 && segments[idx-1] && (
                <div className="course-travel">
                  <div className="travel-line" />
                  <span className="travel-info">
                    🚶 도보 {segments[idx-1].walk}분 ({segments[idx-1].dist < 1 ? `${Math.round(segments[idx-1].dist*1000)}m` : `${segments[idx-1].dist.toFixed(1)}km`})
                    {segments[idx-1].dist > 3 && ' · 🚗 차량 이동 추천'}
                  </span>
                </div>
              )}
              <Link to={`/detail/${place.contentid}?typeId=${place.contenttypeid}&childAge=${childAge}`} className="stop-card">
                <div className="stop-number">{idx + 1}</div>
                {place.firstimage && <img src={place.firstimage} alt={place.title} className="stop-img" loading="lazy" />}
                <div className="stop-info">
                  <h3>{place.title}</h3>
                  <p className="stop-addr">{place.addr1}</p>
                  <p className="stop-time">⏱ 추천 체류 {childAge === 'baby' ? '20분' : '30~40분'}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {course.length > 0 && <SafetyChecklist childAge={childAge} />}

      <p className="data-source">출처: ⓒ한국관광공사</p>
    </div>
  );
}
