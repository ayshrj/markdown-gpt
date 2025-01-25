import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
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
        <ThemeProvider
          attribute="class" // Applies the theme class to <html>
          defaultTheme="dark" // Sets the default theme to dark
          enableSystem={false} // Disables system theme detection
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
