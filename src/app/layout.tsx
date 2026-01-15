import { SettingsProvider } from "@/app/contexts/SettingsContext";

import "@/app/globals.css";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata = {
  title: "WORDest",
  description: "A Wordle-style word guessing game",
  icons: {
    icon: "images/logo-small.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SettingsProvider>
          <ThemeProvider />
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
