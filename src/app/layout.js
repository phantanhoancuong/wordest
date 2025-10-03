import "./globals.css";

export const metadata = {
  title: "Wordest",
  description: "A Wordle-style word guessing game",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
