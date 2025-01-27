// src/app/layout.tsx or src/pages/_app.tsx

import { Inter } from "next/font/google";
import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";
import "./override.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MarkdownGPT",
  description: "Markdown Reader for ChatGPT Output",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased ${inter.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
