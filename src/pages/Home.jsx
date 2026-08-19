import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function TranslateWarning() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const check = () => {
      const html = document.documentElement;
      if (html.classList.contains('translated-ltr') || html.classList.contains('translated-rtl') || html.hasAttribute('_msttexthash')) {
        setShow(true);
      }
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    const timer = setTimeout(check, 1500);
    return () => { observer.disconnect(); clearTimeout(timer); };
  }, []);

  if (!show) return null;

  return (
    <div style={{background:'#fff7ed',border:'1px solid #fb923c',borderRadius:'12px',padding:'14px 16px',marginBottom:'16px',fontSize:'14px',lineHeight:'1.6'}}>
      <strong style={{fontSize:'15px',color:'#9a3412'}}>⚠️ 브라우저 번역 기능을 꺼주세요</strong>
      <p style={{margin:'6px 0 0',color:'#78350f'}}>
        이 사이트는 한국어 전용입니다. Chrome 자동번역이 켜져 있으면 화면이 깨질 수 있습니다.
        <br/>주소창 오른쪽 <strong>번역 아이콘</strong>을 클릭하고 "<strong>번역 안함</strong>"을 선택해주세요.
      </p>
    </div>
  );
}

const GUIDE_STEPS = [
  { num: '1', title: '코스 만들기', desc: '위 버튼을 눌러 지역·연령·관심사를 선택하세요', color: '#0e7490' },
  { num: '2', title: '코스 확인·편집', desc: 'AI 추천 코스를 확인하고, 장소 추가·삭제·순서 변경', color: '#7c3aed' },
  { num: '3', title: '상세 정보', desc: '각 장소를 터치하면 역사 이야기·퀴즈·길찾기', color: '#059669' },
  { num: '4', title: '저장·출력', desc: '마음에 드는 코스를 저장하거나 PDF로 출력', color: '#d97706' },
];

const GUIDE_FEATURES = [
  { icon: '📍', label: '지도 보기' },
  { icon: '🔤', label: '글자 크기' },
  { icon: '🛡️', label: '안전 체크' },
];

function UsageGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{background:'#fff',border: open ? '1px solid #0e7490' : '1px solid #e2e8f0',borderRadius:'16px',marginBottom:'20px',overflow:'hidden',boxShadow: open ? '0 4px 20px rgba(14,116,144,0.12)' : '0 1px 3px rgba(0,0,0,0.06)',transition:'all 0.3s ease'}}>
      <button
        onClick={() => setOpen(!open)}
        style={{width:'100%',padding: open ? '16px 18px 12px' : '16px 18px',background: open ? 'linear-gradient(135deg,#f0fdfa,#ecfdf5)' : '#fff',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:'10px',fontSize:'15px',fontWeight:'700',color:'#1e293b',textAlign:'left',transition:'background 0.3s'}}
      >
        <span style={{fontSize:'20px'}}>📋</span>
        <span style={{flex:1}}>
          {open ? '이용 안내' : '처음이세요? 이용 안내를 확인해보세요'}
        </span>
        <span style={{fontSize:'12px',color: open ? '#0e7490' : '#94a3b8',transition:'transform 0.3s',transform:open?'rotate(180deg)':'rotate(0)',fontWeight:'bold'}}>▼</span>
      </button>
      {!open && (
        <div style={{padding:'0 18px 14px',display:'flex',gap:'6px',flexWrap:'wrap'}}>
          {['지역 선택','코스 편집','저장·출력'].map((tag, i) => (
            <span key={i} style={{background:'#f0fdfa',color:'#0e7490',fontSize:'11px',padding:'4px 10px',borderRadius:'20px',border:'1px solid #99f6e4',fontWeight:'600'}}>{tag}</span>
          ))}
        </div>
      )}
      {open && (
        <div style={{padding:'0 18px 20px'}}>
          {/* 4단계 플로우 */}
          <div style={{display:'flex',flexDirection:'column',gap:'0'}}>
            {GUIDE_STEPS.map((step, i) => (
              <div key={i} style={{display:'flex',alignItems:'flex-start',gap:'12px',position:'relative',paddingBottom: i < GUIDE_STEPS.length - 1 ? '16px' : '0'}}>
                {/* 연결선 */}
                {i < GUIDE_STEPS.length - 1 && (
                  <div style={{position:'absolute',left:'15px',top:'32px',width:'2px',height:'calc(100% - 16px)',background:'linear-gradient(to bottom,'+step.color+','+GUIDE_STEPS[i+1].color+')',opacity:0.3}} />
                )}
                {/* 번호 원 */}
                <div style={{width:'32px',height:'32px',borderRadius:'50%',background:step.color,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:'800',flexShrink:0,boxShadow:'0 2px 8px '+step.color+'40'}}>
                  {step.num}
                </div>
                <div style={{flex:1,paddingTop:'2px'}}>
                  <div style={{fontWeight:'700',fontSize:'14px',color:step.color,marginBottom:'2px'}}>{step.title}</div>
                  <div style={{fontSize:'12px',color:'#64748b',lineHeight:'1.5'}}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 부가 기능 칩 */}
          <div style={{marginTop:'16px',paddingTop:'14px',borderTop:'1px solid #e2e8f0',display:'flex',gap:'8px',justifyContent:'center'}}>
            {GUIDE_FEATURES.map((f, i) => (
              <span key={i} style={{background:'#f1f5f9',border:'1px solid #e2e8f0',borderRadius:'20px',padding:'6px 14px',fontSize:'12px',color:'#475569',fontWeight:'600'}}>
                {f.icon} {f.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <TranslateWarning />

      <section className="hero-section">
        <h2>아이와 함께<br />한적한 역사여행을<br />떠나보세요</h2>
        <p className="hero-desc">
          AI가 아이의 나이와 관심사에 맞춰<br />
          붐비지 않는 역사 명소를 추천합니다
        </p>
        <button
          className="btn-primary"
          onClick={() => navigate('/planner')}
        >
          여행 코스 만들기
        </button>
      </section>

      <UsageGuide />

      <section className="features">
        <div className="feature-card">
          <span className="feature-icon">👨‍👩‍👧‍👦</span>
          <h3>아이 맞춤</h3>
          <p>나이별 눈높이 역사 해설과 유모차 이동 가능 경로</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🏛️</span>
          <h3>숨은 명소</h3>
          <p>인기 관광지 대신 주변 숨은 역사 명소 추천</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🚶‍♂️</span>
          <h3>슬로 워킹</h3>
          <p>평탄한 경로, 쉼터·화장실 포함 느린 산책 코스</p>
        </div>
      </section>
    </div>
  );
}
