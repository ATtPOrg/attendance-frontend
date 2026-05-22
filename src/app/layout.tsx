import type { Metadata } from "next";
import "./globals.css";

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Inter:wght@300;400;500;600;700&display=swap";

export const metadata: Metadata = {
  title: "ATP-Go — BLE-Powered Attendance for Modern Institutions",
  description:
    "Secure, face-verified, proximity-based attendance management for universities and schools. Powered by Bluetooth Low Energy and AI.",
  keywords: ["attendance", "BLE", "face verification", "university", "school management"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={FONTS_URL} rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
