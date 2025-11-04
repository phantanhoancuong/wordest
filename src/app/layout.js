import "./globals.css";

export const metadata = {
  title: "WORDest",
  description: "A Wordle-style word guessing game",
  icons: {
    icon: "/logo-small.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
