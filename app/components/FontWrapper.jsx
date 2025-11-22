"use client";

import { useLanguageContext } from "./LanguageProviderClient";

export default function FontWrapper({ children }) {
  const { lang } = useLanguageContext();
  return <div className={lang === "km" ? "khmer-text" : "font-sans"}>{children}</div>;
}
