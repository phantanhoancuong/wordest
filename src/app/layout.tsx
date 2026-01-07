import { SettingsProvider } from "@/app/contexts/SettingsContext";

import "@/app/globals.css";

export const metadata = {
  title: "WORDest",
  description: "A Wordle-style word guessing game",
  icons: {
    icon: "images/logo-small.svg",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SettingsProvider>{children}</SettingsProvider>
      </body>
    </html>
  );
}
