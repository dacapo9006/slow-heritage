import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { detailCommon, detailIntro } from '../api/tourApi';

function KakaoMap({ lat, lng, title }) {
  const mapRef = useRef(null);
  useEffect(() => {
    if (!window.kakao?.maps || !mapRef.current) return;
    const kakao = window.kakao;
    kakao.maps.load(() => {
      const position = new kakao.maps.LatLng(lat, lng);
      const map = new kakao.maps.Map(mapRef.current, { center: position, level: 3 });
      const marker = new kakao.maps.Marker({ map, position });
      const infowindow = new kakao.maps.InfoWindow({
        content: `<div style="padding:5px 10px;font-size:13px;white-space:nowrap;">${title}</div>`,
      });
      infowindow.open(map, marker);
      map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);
    });
  }, [lat, lng, title]);

  return (
    <div className="detail-section">
      <h3>ìì¹</h3>
      <div ref={mapRef} style={{ width: '100%', height: '300px', borderRadius: '12px' }} />
    </div>
  );
}

/** ê´ê´ì§ ì ëª© ê¸°ë° ê°ë¨í ì­ì¬ í´ì¦ ìì± */
function generateQuiz(title, overview, childAge) {
  const quizBank = [
    {
      keywords: ['ê¶', 'ëìê¶', 'ê²½ë³µê¶', 'ì°½ëê¶', 'ì°½ê²½ê¶', 'ê²½í¬ê¶'],
      questions: [
        { q: 'ì¡°ì ìë ìì´ ì´ë ì§ì ë­ë¼ê³  ë¶ë¥´é¹ì?', options: ['ê¶ê¶', 'ì¬ì°°', 'ìì', 'í¥êµ'], answer: 0, explain: 'ê¶ê¶ì ìê³¼ ìë¹ê° ì´ë©° ëë¼ë¥¼ ë¤ì¤ë¦¬ë ê³³ì´ìì!' },
        { q: 'ê²½ë³µê¶ì ì²ì ì§ì ìì ëêµ¬ì¼ê¹ì?', options: ['íì¡° ì´ì±ê³', 'ì¸ì¢ëì', 'ìì¡°', 'ê³ ì¢'], answer: 0, explain: 'íì¡° ì´ì±ê³ê° ì¡°ì ì ì¸ì°ê³  ê²½ë³µê¶ì ì§ìì´ì.' },
      ],
    },
    {
      keywords: ['ì±', 'ì±ê³½', 'ì°ì±', 'ìì±', 'ììíì±', 'ë¨íì°ì±'],
      questions: [
        { q: 'ì¬ë ì ì±ì ìì ì´ì ë ë­ê¹ì?', options: ['ì ì ê³µê²©ì ë§ê¸° ìí´', 'ììê² ê¾¸ë¯¸ë ¤ê³ ', 'ì´ëíë ¤ê³ ', 'ëì¬ë¥¼ ì§ê¸° ìí´'], answer: 0, explain: 'ì±ê³½ì ì¸ì ì ì¹¨ìì¼ë¡ë¶í° ëë¼ì ë°±ì±ì ì§í¤ê¸° ìí´ ììì´ì.' },
      ],
    },
    {
      keywords: ['ì¬ì°°', 'ì ', 'íí', 'ë¶êµ­ì¬', 'í´ì¸ì¬', 'íµëì¬'],
      questions: [
        { q: 'ì ìì ë³¼ ì ìë í° ì¢ì ì´ë¦ì?', options: ['ë²ì¢', 'êµíì¢', 'íêµì¢', 'ìëªì¢'], answer: 0, explain: 'ë²ì¢ì ì ìì ìì¹¨ì ë½ì¼ë¡ ì¸ë¦¬ë í° ì¢ì´ìì.' },
      ],
    },
    {
      keywords: ['ë°ë¬¼ê´', 'ë¯¸ì ê´', 'ì ìê´', 'ê¸°ëê´'],
      questions: [
        { q: 'ë°ë¬¼ê´ìì ì ìë¬¼ì ë³¼ ë ê°ì¥ ì¤ìí ê·ì¹ì?', options: ['ìì¼ë¡ ë§ì§ì§ ìê¸°', 'ë°ì´ë¤ëê¸°', 'í° ìë¦¬ ë´ê¸°', 'ì¬ì§ ì°ê¸°'], answer: 0, explain: 'ì ìë¬¼ì ë§¤ì° ì¤ëëê³  ìì¤í ê²ì´ë¼ ìì¼ë¡ ë§ì§ë©´ ì ë¼ì!' },
      ],
    },
    {
      keywords: ['ìì', 'í¥êµ', 'ëì°ìì', 'ìììì', 'ìì °ìì'],
      questions: [
        { q: 'ìë  ìì´ë¤ì´ ê¸ì ë°°ì°ë ê³³ì ë­ç¼ê³  í ê¹ì?', options: ['ìë¹', 'íì', 'ëìê´', 'ëì´í°'], answer: 0, explain: 'ìë¹ì ì¡°ì ìë ìì´ë¤ì´ íë¬¸ê³¼ ìì ì ë°°ì´ë ê³³ì´ìì.' },
      ],
    },
    {
      keywords: ['ë§ì', 'íì¥', 'ì íµ', 'ë¯¼ì'],
      questions: [
        { q: 'íì¥ì ë°ë¥ ë ë°© ë°©ìì  ë­ë¼ê³  í ê¹ì?', options: ['ì¨ë', 'ëëìì´í°', 'ìì´ì»´', 'ë ë¡'], answer: 0, explain: 'ì¨ëì ë°ë¥ ìëì¼ë¡ ëë°í ê³µêº¼ë¥¼ ë³´ë ë°©ì ë°ì°ë íêµ­ ê³ ì ì ë¨ë°© ë°©ìì´ìì!' },
      ],
    },
  ];

  // ì ëª© + ê°ììì í¤ìë ë§¤ì¹
  const text = (title + ' ' + (overview || '')).toLowerCase();
  for (const bank of quizBank) {
    if (bank.keywords.some(kw => text.includes(kw))) {
      const q = bank.questions[Math.floor(Math.random() * bank.questions.length)];
      return q;
    }
  }

  // ê¸°ë³¸ í´ì¦
  return {
    q: 'ì­ì¬ ì ì ì§ë¥¼ ë°©ë¬¸í  ë ê°ì¥ ì¤ìí ê²ì?',
    options: ['ë¬¸íì¬ë¥¼ ìì¤í ì¬ê¸°ê¸°', 'ì°ë ê¸° ë²ë¦¬ê¸°', 'ë³½ì ëìíê¸°', '®®ì´ë¤ëê¸°'],
    answer: 0,
    explain: 'ë¬´íì¬ë ì°ë¦¬ ëª¨ëì ìì¤í ì ì°ì´ìì. ìëê³  ë³´í¸í´ì¼ í´ì!',
  };
}

/** ì°ë ¹ë³ ì¤í ë¦¬íë§ */
function generateStory(title, overview, childAge) {
  const clean = overview?.replace(/<[^>]*>/g, '') || '';
  if (!clean) return null;

  // ê°ììì íµì¬ ë¬¸ì¥ 2~3ê° ì¶ì¶
  const sentences = clean.split(/[.!?ã]\s*/).filter(s => s.length > 10);
  const shortSummary = sentences.slice(0, 2).join('. ') + '.';

  if (childAge === 'baby' || childAge === 'toddler') {
    return {
      title: `${title}ì ëë¬ ìì´ì!`,
      body: `ì¬ê¸°ë "${title}"ì´ë¯¸ë ê³³ì´ìì. ${shortSummary} ì£¼ë³´ì ì²ì²í ë¥ë¬ë³´ë©´ì ìì ê²ë¤ì ì°¬ìë³¼ê¹ì?`,
    };
  }
  if (childAge === 'child') {
    return {
      title: `ííê°ì ë¸í¸: ${title}`,
      body: `ì¤ëì ííì§ë "${title}"! ${shortSummary} ì´ê³¬ìì í¹ë³í ê²ì ë°ê²¬íë©´ ì¬ì§ì¼ë¡ ê¸°ë¡í´ë³´ì¸ì!`,
    };
  }
  return {
    title: `ì­ì¬ íë²: ${title}`,
    body: `${shortSummary} ì´ ì¥ìê° ê°ì§ ì­ì¬ì  ìë¯¸ë¥¼ ìê°íë©° ë¥ë¬ë³´ì¸ì. ë¹ì ì¬ë¼ë¤ì ì´ë¤ ìíì íìê¹ì?`,
  };
}

function QuizSection({ quiz }) {
  const [selected, setSelected] = useState(null);

  if (!quiz) return null;

  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
  };

  return (
    <div className="quiz-box">
      <h3>ì­ì¬ í´ì¦:/h3>
      <p className="quiz-question">{quiz.q}</p>
      <div className="quiz-options">
        {quiz.options.map((opt, i) => (
          <button
            key={i}
            className={`quiz-option ${selected !== null ? (i === quiz.answer ? 'correct' : selected === i ? 'wrong' : 'disabled') : ''}`}
            onClick={() => handleSelect(i)}
          >
            {String.fromCharCode(9312 + i)} {opt}
          </button>
        ))}
      </div>
      {selected !== null && (
        <div className={`quiz-result ${selected === quiz.answer ? 'correct' : 'wrong'}`}>
          {selected === quiz.answer ? 'ð ì ëµì´ìì! ' : 'ð ìì¬ìì! '}
          {quiz.explain}
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
          detailCommon(contentId),
          detailIntro(contentId, typeId),
        ]);
        const common = Array.isArray(commonItems) ? commonItems[0] : commonItems;
        const introData = Array.isArray(introItems) ? introItems[0] : introItems;
        setDetail(common || null);
        setIntro(introData || null);
      } catch (err) {
        console.error('Detail fetch error:', err);
        setError('ìì¸ ì ë³´ë¥¼ ë¶ë¬ì¤ì§ ëª»íìµëë¤.');
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
        <p>ìì¸ ì ë³´ë¥¼ ë¶ë¬ì¤ë ì¤...</p>
      </div>
    );
  }

  if (error || !detail) {
    return <div className="error">{error || 'ì ë³´ë¥¼ ì°¾ì ì ììµëë¤.'}</div>;
  }

  const stripHtml = (html) => html?.replace(/<[^>]*>/g, '') || '';
  const quiz = generateQuiz(detail.title, detail.overview, childAge);
  const story = generateStory(detail.title, detail.overview, childAge);

  return (
    <div className="detail">
      <button className="btn-back" onClick={() => navigate(-1)}>â ë¤ë¡</button>

      {detail.firstimage && (
        <img src={detail.firstimage} alt={detail.title} className="detail-img" />
      )}

      <div className="detail-title-row">
        <h2>{detail.title}</h2>
      </div>

      <p className="detail-addr">{detail.addr1} {detail.addr2 || ''}</p>
      {detail.tel && <p className="detail-tel">ð {detail.tel}</p>}

      {/* ì¤í ë¦¬íë§ */}
      {story && (
        <div className="story-box">
          <h3>ð {story.title}</h3>
          <p>{story.body}</p>
        </div>
      )}

      {detail.overview && (
        <div className="detail-section">
          <h3>ìê°</h3>
          <p>{stripHtml(detail.overview)}</p>
        </div>
      )}

      {/* ì­ì¬ í´ì¦ */}
      <QuizSection quiz={quiz} />

      {/* ê´ê´ì§(12) ìê°ì ë³´ */}
      {intro && typeId === '12' && (
        <div className="detail-section">
          <h3>ì´ì© ìë´</h3>
          {intro.usetime && <p>â° ì´ì©ìê°: {stripHtml(intro.usetime)}</p>}
          {intro.restdate && <p>ð« í¬ëë : {stripHtml(intro.restdate)}</p>}
          {intro.parking && <p>ð¿ï¸ ì£¼ì°¨: {stripHtml(intro.parking)}</p>}
          {intro.infocenter && <p>ð ë¬¸ì: {stripHtml(intro.infocenter)}</p>}
          {intro.chkbabycarriage && <p>ð¶ ì ëª¨ì°¨: {stripHtml(intro.chkbabycarriage)}</p>}
          {intro.chkpet && <p>ð ë°ë¤ëë¬¼: {stripHtml(intro.chkpet)}</p>}
        </div>
      )}

      {/* ë¬¸íìì¤(14) ìê°ì ë³´ */}
      {intro && typeId === '14' && (
        <div className="detail-section">
          <h3>ì´ì© ìë´</h3>
          {intro.usetimeculture && <p>â° ìììê°: {stripHtml(intro.usetimeculture)}</p>}
          {intro.restdateculture && <p>ð« í´ëë : {stripHtml(intro.restdateculture)}</p>}
          {intro.parkingculture && <p>ð¿ï¸ ì£¼ì°¨: {stripHtml(intro.parkingculture)}</p>}
          {intro.infocenterculture && <p>ð ë¬¸ì: {stripHtml(intro.infocenterculture)}</p>}
          {intro.chkbabycarriageculture && <p>ð¶ ì ëª¨ì°¨: {stripHtml(intro.chkbabycarriageculture)}</p>}
          {intro.chkpetculture && <p>ð ë°ë ¤ëë¬¼: {stripHtml(intro.chkpetculture)}</p>}
          {intro.usefee && <p>ð° ì´ì©ìê¸: {stripHtml(intro.usefee)}</p>}
        </div>
      )}

      {detail.mapx && detail.mapy && (
        <KakaoMap lat={parseFloat(detail.mapy)} lng={parseFloat(detail.mapx)} title={detail.title} />
      )}

      <p className="data-source">ì¶ì²: âíêµ­ê´ê´ê³µì¬</p>
    </div>
  );
}
