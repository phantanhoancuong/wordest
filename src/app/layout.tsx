import "./globals.css";
import { SettingsProvider } from "./contexts/SettingsContext";

export const metadata = {
  title: "WORDest",
  description: "A Wordle-style word guessing game",
  icons: {
    icon: "images/logo-small.svg",
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
