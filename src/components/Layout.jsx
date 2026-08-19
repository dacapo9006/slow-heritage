import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Layout() {
  const [fontSize, setFontSize] = useState(16);
  const { lang, setLang, t } = useLanguage();

  const changeFontSize = (delta) => {
    setFontSize(prev => Math.min(22, Math.max(13, prev + delta)));
  };

  return (
    <div className="app-container" translate="no" lang={lang} style={{ fontSize: `${fontSize}px` }}>
      <header className="app-header">
        <div className="header-row">
          <Link to="/" className="logo">
            <img src="https://onaitourism.com/images/logo-full.png" alt="On AI Tourism Lab" className="logo-img" />
            <h1>{t('siteTitle')}</h1>
            <span className="logo-sub">{t('siteSub')}</span>
          </Link>
          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
              className="lang-toggle-btn"
              style={{
                padding: '6px 12px', borderRadius: '20px', border: '1px solid #0e7490',
                background: '#fff', color: '#0e7490', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
              }}
              title={lang === 'ko' ? 'Switch to English' : '한국어로 전환'}
            >
              {t('langToggle')}
            </button>
            <Link to="/saved" className="saved-link">{t('savedLink')}</Link>
          </div>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      {/* 글자 크기 조절 플로팅 버튼 */}
      <div className="font-ctrl">
        <button className="font-btn font-up" onClick={() => changeFontSize(1)} title={t('fontUpTitle')}>A+</button>
        <button className="font-btn font-down" onClick={() => changeFontSize(-1)} title={t('fontDownTitle')}>A-</button>
      </div>

      <footer className="app-footer">
        <p>{t('footerSource')}</p>
        <div className="footer-brand">
          <span className="footer-lab">On AI Tourism Lab™</span>
        </div>
      </footer>
    </div>
  );
}
