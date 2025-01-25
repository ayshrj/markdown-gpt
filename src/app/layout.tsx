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
    // Suppress the hydration mismatch warning on <html>:
    <html lang="en" suppressHydrationWarning>
      {/* You can also do suppressHydrationWarning on <body> if you prefer */}
      <body className="font-ui-sans-serif antialiased">
        {/*
          Wrap the entire application with our client-side
          Providers component (which includes the ThemeProvider).
        */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
