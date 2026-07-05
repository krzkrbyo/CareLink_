import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareLink — Acompañamiento con cariño",
  description: "Plataforma de cuidado y acompañamiento para adultos mayores y sus familias",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icons/carelink-logo.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/carelink-logo.svg", type: "image/svg+xml" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CareLink",
  },
};

export const viewport: Viewport = {
  themeColor: "#9b87b5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="font-sans">{children}</body>
    </html>
  );
}
