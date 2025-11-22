"use client";

import { useState, useEffect } from "react";
import en from "../locales/en.json";
import km from "../locales/km.json";

const LANGUAGES = { en, km };

export function useLanguage() {
  const [lang, setLang] = useState("en");
  const [translations, setTranslations] = useState(en);

  // Initialize from localStorage
  useEffect(() => {
    const storedLang = localStorage.getItem("lang");
    if (storedLang && LANGUAGES[storedLang]) {
      setLang(storedLang);
      setTranslations(LANGUAGES[storedLang]);
    }
  }, []);

  // Function to set language explicitly
  const setLanguage = (newLang) => {
    if (!LANGUAGES[newLang]) return;
    setLang(newLang);
    setTranslations(LANGUAGES[newLang]);
    localStorage.setItem("lang", newLang);
  };

  // Optional toggle
  const toggleLanguage = () => {
    setLanguage(lang === "en" ? "km" : "en");
  };

  return { lang, translations, setLanguage, toggleLanguage };
}
