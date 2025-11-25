import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PokeMemo - Pokemon Memory Game",
  description: "A retro-style Pokemon memory matching game built with Next.js and React",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
