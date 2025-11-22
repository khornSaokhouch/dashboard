import "./globals.css";
import { LanguageProvider } from "./components/LanguageProviderClient";
import FontWrapper from "./components/FontWrapper";

export const metadata = {
  title: "Sunrise Coffee Admin",
  description: "Manage categories and more",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <LanguageProvider>
          <FontWrapper>{children}</FontWrapper>
        </LanguageProvider>
      </body>
    </html>
  );
}
