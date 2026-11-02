import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import "./globals.css";

const pixelFont = VT323({ 
  weight: "400", 
  subsets: ["latin", "cyrillic"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "Сытый Лис | Архив",
  description: "Архив запретных знаний",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${pixelFont.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}