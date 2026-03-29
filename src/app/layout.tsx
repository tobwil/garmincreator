import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Garmin Watchface Builder",
  description: "Visual drag-and-drop builder for Garmin Connect IQ watchfaces",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Orbitron:wght@400;700&family=Rajdhani:wght@400;700&family=Roboto:wght@400;700&family=Roboto+Condensed:wght@400;700&family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
