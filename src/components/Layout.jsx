import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
  const [fontSize, setFontSize] = useState(16);

  const changeFontSize = (delta) => {
    setFontSize(prev => Math.min(22, Math.max(13, prev + delta)));
  };

  return (
    <div className="app-container" translate="no" lang="ko" style={{ fontSize: `${fontSize}px` }}>
      <header className="app-header">
        <div className="header-row">
          <Link to="/" className="logo">
            <img src="https://onaitourism.com/images/logo-full.png" alt="On AI Tourism Lab" className="logo-img" />
            <h1>슬로 헤리티지</h1>
            <span className="logo-sub">아이와 떠나는 한적한 역사여행</span>
          </Link>
          <div className="header-right">
            <Link to="/saved" className="saved-link">📋 저장코스</Link>
          </div>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      {/* 글자 크기 조절 플로팅 버튼 */}
      <div className="font-ctrl">
        <button className="font-btn font-up" onClick={() => changeFontSize(1)} title="글자 크게">A+</button>
        <button className="font-btn font-down" onClick={() => changeFontSize(-1)} title="글자 작게">A-</button>
      </div>

      <footer className="app-footer">
        <p>출처: ⓒ한국관광공사 | 2026 관광데이터 활용 공모전</p>
        <div className="footer-brand">
          <span className="footer-lab">On AI Tourism Lab™</span>
        </div>
      </footer>
    </div>
  );
}
