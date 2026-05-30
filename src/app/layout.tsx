import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "أثر — أثرٌ جارٍ لا ينقطع",
  description: "وقف خيري عن مسلم عوده البويني رحمه الله. تطبيق يومي إسلامي يقدم أثراً روحانياً مع أدوات يومية.",
  keywords: ["أثر", "Athar", "وقف", "أذكار", "صلاة", "إسلامي", "ثمانية"],
  authors: [{ name: "أثر — Athar" }],
  openGraph: {
    title: "أثر — أثرٌ جارٍ لا ينقطع",
    description: "وقف خيري عن مسلم عوده البويني رحمه الله",
    type: "website",
    locale: "ar_SA",
  },
  twitter: {
    card: "summary_large_image",
    title: "أثر — أثرٌ جارٍ لا ينقطع",
    description: "وقف خيري عن مسلم عوده البويني رحمه الله",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#22665C", // Dark Teal - الهوية الجديدة
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
        {/* Apple Touch Icons بأحجام مختلفة لدعم جميع أجهزة iOS */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/icons/icon-76x76.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="أثر" />
        {/* تحسينات إضافية */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#22665C" />
      </head>
      <body className="min-h-screen bg-athar-bg antialiased">
        {children}
      </body>
    </html>
  );
}
