import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";
import "./override.css";

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
    <html lang="en">
      <body className="font-ui-sans-serif antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
