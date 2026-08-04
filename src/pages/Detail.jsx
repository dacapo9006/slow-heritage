import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { detailCommon, detailIntro } from '../api/tourApi';

function KakaoMap({ lat, lng, title }) {
  const mapRef = useRef(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      try {
        const kakao = window.kakao;
        const position = new kakao.maps.LatLng(lat, lng);
        const map = new kakao.maps.Map(mapRef.current, { center: position, level: 3 });
        const marker = new kakao.maps.Marker({ map, position });
        const infowindow = new kakao.maps.InfoWindow({
          content: `<div style="padding:5px 10px;font-size:13px;white-space:nowrap;">${title}</div>`,
        });
        infowindow.open(map, marker);
        map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);
      } catch (e) {
        console.error('Map init error:', e);
        setMapError(true);
      }
    };

    // kakao SDK가 이미 로드된 경우
    if (window.kakao?.maps?.LatLng) {
      initMap();
      return;
    }
    // kakao 객체는 있지만 maps.load 필요
    if (window.kakao?.maps?.load) {
      window.kakao.maps.load(initMap);
      return;
    }
    // SDK 아예 없으면 동적 로드
    const script = document.createElement('script');
    script.src = '//dapi.kakao.com/v2/maps/sdk.js?appkey=4f97f1045e212a1f196df11602e1aaa1&autoload=false';
    script.onload = () => {
      if (window.kakao?.maps?.load) {
        window.kakao.maps.load(initMap);
      } else {
        setMapError(true);
      }
    };
    script.onerror = () => setMapError(true);
    document.head.appendChild(script);
  }, [lat, lng, title]);

  if (mapError) {
    return (
      <div className="detail-section">
        <h3>위치</h3>
        <a href={`https://map.kakao.com/link/map/${title},${lat},${lng}`} target="_blank" rel="noopener noreferrer" className="map-fallback-link">
          카카오맵에서 보기 →
        </a>
      </div>
    );
  }

  return (
    <div className="detail-section">
      <h3>위치</h3>
      <div ref={mapRef} style={{ width: '100%', height: '300px', borderRadius: '12px' }} />
    </div>
  );
}

/** 관광지 제목 기반 간단한 역사 퀴즈 생성 */
function generateQuiz(title, overview, childAge) {
  const quizBank = [
    {
      keywords: ['궁', '덕수궁', '경복궁', '창덕궁', '창경궁', '경희궁'],
      questions: [
        { q: '조선시대 왕이 살던 집을 뭐라고 부를까요?', options: ['궁궐', '사찰', '서원', '향교'], answer: 0, explain: '궁궐은 왕과 왕비가 살며 나라를 다스리던 곳이에요!' },
        { q: '경복궁을 처음 지은 왕은 누구일까요?', options: ['태조 이성계', '세종대왕', '영조', '고종'], answer: 0, explain: '태조 이성계가 조선을 세우고 경복궁을 지었어요.' },
      ],
    },
    {
      keywords: ['성', '성곽', '산성', '읍성', '수원화성', '남한산성'],
      questions: [
        { q: '옛날에 성을 쌓은 이유는 뭘까요?', options: ['적의 공격을 막기 위해', '예쁘게 꾸미려고', '운동하려고', '농사를 짓기 위해'], answer: 0, explain: '성곽은 외적의 침입으로부터 나라와 백성을 지키기 위해 쌓았어요.' },
      ],
    },
    {
      keywords: ['사찰', '절', '템플', '불국사', '해인사', '통도사'],
      questions: [
        { q: '절에서 볼 수 있는 큰 종의 이름은?', options: ['범종', '교회종', '학교종', '자명종'], answer: 0, explain: '범종은 절에서 아침저녁으로 울리는 큰 종이에요.' },
      ],
    },
    {
      keywords: ['박물관', '미술관', '전시관', '기념관'],
      questions: [
        { q: '박물관에서 전시물을 볼 때 가장 중요한 규칙은?', options: ['손으로 만지지 않기', '뛰어다니기', '큰 소리 내기', '사진 찍기'], answer: 0, explain: '전시물은 매우 오래되고 소중한 것이라 손으로 만지면 안 돼요!' },
      ],
    },
    {
      keywords: ['서원', '향교', '도산서원', '소수서원', '옥산서원'],
      questions: [
        { q: '옛날 아이들이 글을 배우던 곳을 뭐라 할까요?', options: ['서당', '학원', '도서관', '놀이터'], answer: 0, explain: '서당은 조선시대 아이들이 한문과 예절을 배우던 곳이에요.' },
      ],
    },
    {
      keywords: ['마을', '한옥', '전통', '민속'],
      questions: [
        { q: '한옥의 바닥 난방 방식을 뭐라고 할까요?', options: ['온돌', '라디에이터', '에어컨', '난로'], answer: 0, explain: '온돌은 바닥 아래로 따뜻한 공기를 보내 방을 데우는 한국 고유의 난방 방식이에요!' },
      ],
    },
  ];

  const text = (title + ' ' + (overview || '')).toLowerCase();
  for (const bank of quizBank) {
    if (bank.keywords.some(kw => text.includes(kw))) {
      const q = bank.questions[Math.floor(Math.random() * bank.questions.length)];
      return q;
    }
  }

  return {
    q: '역사 유적지를 방문할 때 가장 중요한 것은?',
    options: ['문화재를 소중히 여기기', '쓰레기 버리기', '벽에 낙서하기', '뛰어다니기'],
    answer: 0,
    explain: '문화재는 우리 모두의 소중한 유산이에요. 아끼고 보호해야 해요!',
  };
}

/** 연령별 스토리텔링 */
function generateStory(title, overview, childAge) {
  const clean = overview?.replace(/<[^>]*>/g, '') || '';
  if (!clean) return null;
  const sentences = clean.split(/[.!?。]\s*/).filter(s => s.length > 10);
  const shortSummary = sentences.slice(0, 2).join('. ') + '.';

  if (childAge === 'baby' || childAge === 'toddler') {
    return { title: `${title}에 놀러 왔어요!`, body: `여기는 "${title}"이라는 곳이에요. ${shortSummary} 주변을 천천히 둘러보면서 예쁜 것들을 찾아볼까요?` };
  }
  if (childAge === 'child') {
    return { title: `탐험가의 노트: ${title}`, body: `오늘의 탐험지는 "${title}"! ${shortSummary} 이곳에서 특별한 것을 발견하면 사진으로 기록해보세요!` };
  }
  return { title: `역사 탐방: ${title}`, body: `${shortSummary} 이 장소가 가진 역사적 의미를 생각하며 둘러보세요. 당시 사람들은 어떤 생활을 했을까요?` };
}

/** AI 프롬프트 갤러리 */
const PROMPT_GALLERY = {
  baby: [
    { icon: '📸', label: '사진 놀이', prompt: '"{title}"에서 아기와 찍을 수 있는 인생 사진 포즈 3가지를 알려줘. 유모차에서도 가능한 것으로!' },
    { icon: '🎵', label: '자장가 만들기', prompt: '"{title}"을 배경으로 한 짧은 자장가 가사를 만들어줘. 쉽고 반복되는 멜로디로!' },
  ],
  toddler: [
    { icon: '🔍', label: '보물찾기', prompt: '"{title}"에서 3~5세 아이와 할 수 있는 보물찾기 미션 5개를 만들어줘. "○○ 모양 찾기" 같은 간단한 것으로!' },
    { icon: '🎨', label: '그림일기', prompt: '"{title}" 방문 후 아이가 그릴 수 있는 그림일기 주제 3가지를 제안해줘.' },
    { icon: '📖', label: '동화 만들기', prompt: '"{title}"을 배경으로 한 짧은 동화를 만들어줘. 주인공은 {age}살 아이로!' },
  ],
  child: [
    { icon: '🏆', label: '탐험 미션', prompt: '"{title}"에서 초등 저학년이 수행할 수 있는 역사 탐험 미션 5가지를 만들어줘. 관찰, 기록, 비교 활동 포함!' },
    { icon: '📝', label: '탐방 보고서', prompt: '"{title}" 방문 후 초등학생이 쓸 수 있는 탐방 보고서 양식을 만들어줘. 역사적 사실, 느낀 점, 더 알고 싶은 것 포함!' },
    { icon: '🤔', label: '역사 상상', prompt: '"{title}"이 만들어질 당시 사람들의 하루를 상상해서 이야기로 만들어줘. 초등학생 눈높이로!' },
    { icon: '🗺️', label: '여행 퀴즈', prompt: '"{title}"과 관련된 역사 OX 퀴즈 10문제를 만들어줘. 초등학생 수준으로!' },
  ],
  upper: [
    { icon: '📊', label: '비교 분석', prompt: '"{title}"과 비슷한 시대의 다른 문화유산을 3개 골라 비교 분석표를 만들어줘. 건축 양식, 목적, 현재 상태를 포함해줘.' },
    { icon: '🎭', label: '역사 인물 인터뷰', prompt: '"{title}"과 관련된 역사 인물을 골라, 그 인물과의 가상 인터뷰를 만들어줘. 초등 고학년이 이해할 수 있게!' },
    { icon: '📰', label: '역사 신문', prompt: '"{title}"이 처음 만들어졌을 때의 역사 신문 기사를 써줘. 헤드라인, 기사 본문, 관련 인물 인터뷰 포함!' },
    { icon: '🔬', label: '심화 탐구', prompt: '"{title}"에 대해 초등 고학년이 할 수 있는 심화 탐구 주제 3가지와 각 주제의 탐구 방법을 제안해줘.' },
  ],
};

function PromptGallery({ title, childAge }) {
  const [copied, setCopied] = useState(null);
  const prompts = PROMPT_GALLERY[childAge] || PROMPT_GALLERY.child;

  const copyPrompt = (idx, prompt) => {
    const text = prompt.replace(/\{title\}/g, title).replace(/\{age\}/g,
      childAge === 'baby' ? '1' : childAge === 'toddler' ? '4' : childAge === 'child' ? '8' : '12'
    );
    navigator.clipboard.writeText(text).then(() => {
      setCopied(idx);
      setTimeout(() => setCopied(null), 2000);
    }).catch(() => {});
  };

  return (
    <div className="prompt-gallery">
      <h3>🤖 AI 프롬프트 갤러리</h3>
      <p className="prompt-desc">ChatGPT나 Claude에 붙여넣어 활용해보세요!</p>
      <div className="prompt-list">
        {prompts.map((p, i) => (
          <button key={i} className={`prompt-card ${copied === i ? 'copied' : ''}`} onClick={() => copyPrompt(i, p.prompt)}>
            <span className="prompt-icon">{p.icon}</span>
            <span className="prompt-label">{p.label}</span>
            <span className="prompt-copy">{copied === i ? '복사됨!' : '복사'}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function QuizSection({ quiz }) {
  const [selected, setSelected] = useState(null);
  if (!quiz) return null;
  const handleSelect = (idx) => { if (selected !== null) return; setSelected(idx); };

  return (
    <div className="quiz-box">
      <h3>역사 퀴즈</h3>
      <p className="quiz-question">{quiz.q}</p>
      <div className="quiz-options">
        {quiz.options.map((opt, i) => (
          <button key={i} className={`quiz-option ${selected !== null ? (i === quiz.answer ? 'correct' : selected === i ? 'wrong' : 'disabled') : ''}`} onClick={() => handleSelect(i)}>
            {String.fromCharCode(9312 + i)} {opt}
          </button>
        ))}
      </div>
      {selected !== null && (
        <div className={`quiz-result ${selected === quiz.answer ? 'correct' : 'wrong'}`}>
          {selected === quiz.answer ? '🎉 정답이에요! ' : '😅 아쉬워요! '}{quiz.explain}
        </div>
      )}
    </div>
  );
}

export default function Detail() {
  const { contentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [intro, setIntro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const typeId = searchParams.get('typeId') || '12';
  const childAge = searchParams.get('childAge') || 'child';

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      try {
        const [commonItems, introItems] = await Promise.all([
          detailCommon(contentId), detailIntro(contentId, typeId),
        ]);
        setDetail((Array.isArray(commonItems) ? commonItems[0] : commonItems) || null);
        setIntro((Array.isArray(introItems) ? introItems[0] : introItems) || null);
      } catch (err) {
        console.error('Detail fetch error:', err);
        setError('상세 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    }
    if (contentId) fetchDetail();
  }, [contentId, typeId]);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>상세 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !detail) return <div className="error">{error || '정보를 찾을 수 없습니다.'}</div>;

  const stripHtml = (html) => html?.replace(/<[^>]*>/g, '') || '';
  const quiz = generateQuiz(detail.title, detail.overview, childAge);
  const story = generateStory(detail.title, detail.overview, childAge);

  return (
    <div className="detail">
      <button className="btn-back" onClick={() => navigate(-1)}>← 뒤로</button>

      {detail.firstimage && <img src={detail.firstimage} alt={detail.title} className="detail-img" />}

      <div className="detail-title-row"><h2>{detail.title}</h2></div>
      <p className="detail-addr">{detail.addr1} {detail.addr2 || ''}</p>
      {detail.tel && <p className="detail-tel">📞 {detail.tel}</p>}

      {story && (
        <div className="story-box">
          <h3>📖 {story.title}</h3>
          <p>{story.body}</p>
        </div>
      )}

      {detail.overview && (
        <div className="detail-section">
          <h3>소개</h3>
          <p>{stripHtml(detail.overview)}</p>
        </div>
      )}

      <QuizSection quiz={quiz} />

      {/* AI 프롬프트 갤러리 */}
      <PromptGallery title={detail.title} childAge={childAge} />

      {intro && typeId === '12' && (
        <div className="detail-section">
          <h3>이용 안내</h3>
          {intro.usetime && <p>⏰ 이용시간: {stripHtml(intro.usetime)}</p>}
          {intro.restdate && <p>🚫 쉬는날: {stripHtml(intro.restdate)}</p>}
          {intro.parking && <p>🅿️ 주차: {stripHtml(intro.parking)}</p>}
          {intro.infocenter && <p>📞 문의: {stripHtml(intro.infocenter)}</p>}
          {intro.chkbabycarriage && <p>👶 유모차: {stripHtml(intro.chkbabycarriage)}</p>}
          {intro.chkpet && <p>🐕 반려동물: {stripHtml(intro.chkpet)}</p>}
        </div>
      )}

      {intro && typeId === '14' && (
        <div className="detail-section">
          <h3>이용 안내</h3>
          {intro.usetimeculture && <p>⏰ 이용시간: {stripHtml(intro.usetimeculture)}</p>}
          {intro.restdateculture && <p>🚫 쉬는날: {stripHtml(intro.restdateculture)}</p>}
          {intro.parkingculture && <p>🅿️ 주차: {stripHtml(intro.parkingculture)}</p>}
          {intro.infocenterculture && <p>📞 문의: {stripHtml(intro.infocenterculture)}</p>}
          {intro.chkbabycarriageculture && <p>👶 유모차: {stripHtml(intro.chkbabycarriageculture)}</p>}
          {intro.chkpetculture && <p>🐕 반려동물: {stripHtml(intro.chkpetculture)}</p>}
          {intro.usefee && <p>💰 이용요금: {stripHtml(intro.usefee)}</p>}
        </div>
      )}

      {detail.mapx && detail.mapy && (
        <KakaoMap lat={parseFloat(detail.mapy)} lng={parseFloat(detail.mapx)} title={detail.title} />
      )}

      <p className="data-source">출처: ⓒ한국관광공사</p>
    </div>
  );
}
