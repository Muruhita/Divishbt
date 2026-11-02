import type { Metadata } from "next";
import { Inter, Pixelify_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

const pixel = Pixelify_Sans({
  weight: ["400", "700"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "Сытый Лис | Архив",
  description: "Архив запретных знаний таверны 'Сытый Лис'",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} ${pixel.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
