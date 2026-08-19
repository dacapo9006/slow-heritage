import { createContext, useContext, useState, useEffect } from 'react';
import { STRINGS } from '../i18n/strings';

const LanguageContext = createContext({
  lang: 'ko',
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem('slow_heritage_lang') || 'ko';
    } catch {
      return 'ko';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('slow_heritage_lang', lang);
    } catch {}
    document.documentElement.lang = lang === 'en' ? 'en' : 'ko';
  }, [lang]);

  const setLang = (next) => setLangState(next);

  const t = (key) => {
    const entry = STRINGS[key];
    if (!entry) return key;
    return entry[lang] || entry.ko || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
