"use client";

import { ThemeProvider } from "next-themes";

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider
      attribute="class" // Applies 'dark' or 'light' class to <html>
      defaultTheme="dark" // Your default theme on first load
      enableSystem={false} // Disable matching system preference if desired
    >
      {children}
    </ThemeProvider>
  );
};

export default Providers;
