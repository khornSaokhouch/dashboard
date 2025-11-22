// app/components/ClientFontWrapper.jsx
"use client";

import { interFont, khmerFont } from "../hooks/fonts";
import { LanguageProvider, useLanguageContext } from "./LanguageProviderClient";

export default function ClientFontWrapper({ children }) {
  return (
    <LanguageProvider>
      <FontApplier>{children}</FontApplier>
    </LanguageProvider>
  );
}

// Nested component to access language context
function FontApplier({ children }) {
  const { lang } = useLanguageContext();

  return (
    <div className={`${lang === "km" ? khmerFont.variable : interFont.variable} font-sans`}>
      {children}
    </div>
  );
}
