// app/components/ClientLayout.jsx
"use client";

import { useLanguageContext } from "./LanguageProviderClient";
import { interFont, khmerFont } from "../hooks/fonts";

export default function ClientLayout({ children }) {
  const { lang } = useLanguageContext();

  return (
    <main
      className={`${lang === "km" ? khmerFont.variable : interFont.variable} font-sans`}
    >
      {children}
    </main>
  );
}
