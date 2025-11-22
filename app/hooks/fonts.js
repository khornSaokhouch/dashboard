// app/fonts.js
import { Inter, Noto_Sans_Khmer } from "next/font/google";

export const interFont = Inter({
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap",
});

export const khmerFont = Noto_Sans_Khmer({
  subsets: ["khmer", "latin"],
  weight: ["400", "700"],
  variable: "--font-khmer",
  display: "swap",
});
