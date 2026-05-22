import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "أثر — كل يوم أثر نور",
  description: "وقف خيري عن مسلم عوده البويني رحمه الله. تطبيق يومي إسلامي يقدم أثراً روحانياً مع أدوات يومية.",
  keywords: ["أثر", "Athar", "وقف", "أذكار", "صلاة", "إسلامي", "ثمانية"],
  authors: [{ name: "أثر — Athar" }],
  openGraph: {
    title: "أثر — كل يوم أثر نور",
    description: "وقف خيري عن مسلم عوده البويني رحمه الله",
    type: "website",
    locale: "ar_SA",
  },
  twitter: {
    card: "summary_large_image",
    title: "أثر — كل يوم أثر نور",
    description: "وقف خيري عن مسلم عوده البويني رحمه الله",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2D6A4F",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="stylesheet" href="/fonts/Thmanyah.css" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="أثر" />
      </head>
      <body className="min-h-screen bg-athar-bg antialiased">
        {children}
      </body>
    </html>
  );
}
