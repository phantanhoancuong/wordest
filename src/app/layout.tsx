import { SettingsProvider } from "@/app/contexts/SettingsContext";

import {
  AuthProvider,
  StorageNamespaceVersionGuard,
  ThemeProvider,
} from "@/components/client";

import { themeInitScript } from "@/lib/scripts/themeInitScript";

import "@/styles/globals.css";

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
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <AuthProvider>
          <SettingsProvider>
            <ThemeProvider />
            <StorageNamespaceVersionGuard />
            {children}
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
