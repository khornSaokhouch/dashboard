"use client";

import { useLanguage } from "../hooks/useLanguage";
import { createContext, useContext } from "react";

const LanguageContext = createContext({
  lang: "en",
  translations: {},
  toggleLanguage: () => {},
});

export const LanguageProvider = ({ children }) => {
  const { lang, translations, toggleLanguage } = useLanguage();
  return (
    <LanguageContext.Provider value={{ lang, translations, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguageContext = () => useContext(LanguageContext);
