import type { Metadata } from "next";
import { Inter, Pixelify_Sans } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const pixel = Pixelify_Sans({ weight: ["400", "700"], subsets: ["latin", "cyrillic"], variable: "--font-pixel" });

// Если вы используете Pixeloid Mono, раскомментируйте это и убедитесь, что файл лежит в app/fonts/
// const pixeloidMono = localFont({
//   src: './fonts/PixeloidMono.ttf',
//   variable: '--font-pixeloid-mono',
// });

export const metadata: Metadata = {
  title: "Сытый Лис | Архив",
  description: "Архив запретных знаний таверны 'Сытый Лис'",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} ${pixel.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
