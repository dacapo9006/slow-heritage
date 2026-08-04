import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="app-container">
      <header className="app-header">
        <Link to="/" className="logo">
          <span className="logo-icon">🏛️</span>
          <h1>슬로 헤리티지</h1>
          <span className="logo-sub">아이와 걸는 한적한 역사여행</span>
        </Link>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <p>출처: ⓒ한국관광공사 | 2026년 관광데이터 활용 공모전</p>
        <div className="footer-brand">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="On AI Tourism Lab" className="footer-logo" />
        </div>
      </footer>
    </div>
  );
}
