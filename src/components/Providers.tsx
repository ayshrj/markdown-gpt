"use client";

import { ThemeProvider } from "next-themes";

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider
      attribute="class" // Applies the theme class to <html>
      defaultTheme="dark" // Sets the default theme to dark
      enableSystem={false} // Disables system theme detection
    >
      {children}
    </ThemeProvider>
  );
};

export default Providers;
