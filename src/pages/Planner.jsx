import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const REGIONS = [
  { code: '1', name: '서울' },
  { code: '2', name: '인천' },
  { code: '3', name: '대전' },
  { code: '4', name: '대구' },
  { code: '5', name: '광주' },
  { code: '6', name: '부산' },
  { code: '7', name: '울산' },
  { code: '8', name: '세종' },
  { code: '31', name: '경기' },
  { code: '32', name: '강원' },
  { code: '33', name: '충북' },
  { code: '34', name: '충남' },
  { code: '35', name: '경북' },
  { code: '36', name: '경남' },
  { code: '37', name: '전북' },
  { code: '38', name: '전남' },
  { code: '39', name: '제주' },
];

const AGE_GROUPS = [
  { value: 'baby', label: '0~2세 (유아)', desc: '유모차 필수, 짧은 코스' },
  { value: 'toddler', label: '3~5세 (걸음마)', desc: '30분 이내 도보, 체험 중심' },
  { value: 'child', label: '6~9세 (초등저)', desc: '역사교육, 미션 가능' },
  { value: 'upper', label: '10~13세 (초등고)', desc: '근육 역사 설명, 긴 코스 OK' },
  { value: 'middle', label: '14~15세 (중학생)', desc: '자율 탐구형, 교과 연계' },
];

const COURSE_TYPES = [
  { value: 'half', label: '반나절 코스', desc: '2~3시간, 3곳 방문', icon: '🌤️' },
  { value: 'full', label: '하루 코스', desc: '5~6시간, 5곳 방문', icon: '☀️' },
];

export default function Planner() {
  const navigate = useNavigate();
  const [childAge, setChildAge] = useState('');
  const [region, setRegion] = useState('');
  const [courseType, setCourseType] = useState('half');
  const [interests, setInterests] = useState([]);

  const INTEREST_OPTIONS = ['궁궐', '사찰', '성곽', '고분', '서원·향교', '박물관', '전통마을', '근현대역사'];

  const toggleInterest = (item) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!childAge || !region || interests.length === 0) return;
    const params = new URLSearchParams({ childAge, region, courseType, interests: interests.join(',') });
    navigate(`/result?${params}`);
  };

  const canSubmit = childAge && region && interests.length > 0;

  return (
    <div className="planner">
      <h2>여행 계획 세우기</h2>
      <form onSubmit={handleSubmit}>

        <fieldset>
          <legend>아이 나이대</legend>
          <div className="age-grid">
            {AGE_GROUPS.map((ag) => (
              <div
                key={ag.value}
                className={`age-card ${childAge === ag.value ? 'selected' : ''}`}
                onClick={() => setChildAge(ag.value)}
                role="button"
                tabIndex={0}
              >
                <strong>{ag.label}</strong>
                <span>{ag.desc}</span>
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>여행 지역</legend>
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">지역을 선택하세요</option>
            {REGIONS.map((r) => (
              <option key={r.code} value={r.code}>{r.name}</option>
            ))}
          </select>
        </fieldset>

        <fieldset>
          <legend>코스 유형</legend>
          <div className="age-grid">
            {COURSE_TYPES.map((ct) => (
              <div
                key={ct.value}
                className={`age-card ${courseType === ct.value ? 'selected' : ''}`}
                onClick={() => setCourseType(ct.value)}
                role="button"
                tabIndex={0}
              >
                <strong>{ct.icon} {ct.label}</strong>
                <span>{ct.desc}</span>
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>관심 분야 (복수 선택 가능)</legend>
          <div className="interest-grid">
            {INTEREST_OPTIONS.map((item) => (
              <button
                key={item}
                type="button"
                className={`chip ${interests.includes(item) ? 'active' : ''}`}
                onClick={() => toggleInterest(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </fieldset>

        {!canSubmit && (
          <p className="form-hint">
            아이 나이대, 여행 지역, 코스 유형, 관심 분야를 선택해주세요
          </p>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={!canSubmit}
        >
          AI 코스 추천받기
        </button>
      </form>
    </div>
  );
}
