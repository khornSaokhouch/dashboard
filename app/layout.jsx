import "./globals.css";
import { LanguageProvider } from "./components/LanguageProviderClient";
import FontWrapper from "./components/FontWrapper";
import { ToastProvider } from "./components/ToastNotification";

export const metadata = {
  title: "Sunrise Coffee Admin",
  description: "Manage categories and more",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
          integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
          crossOrigin=""/>
      </head>
      <body suppressHydrationWarning>
        <LanguageProvider>
          <ToastProvider>
            <FontWrapper>{children}</FontWrapper>
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
