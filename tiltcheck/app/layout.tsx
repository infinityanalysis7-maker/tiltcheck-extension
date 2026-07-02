import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import InstallPrompt from "@/components/InstallPrompt";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "TiltCheck - Trade Discipline Companion",
  description:
    "Build trading discipline with readiness checks, smart cooldowns, and trade logging. 100% local, no accounts needed.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TiltCheck",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0f",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <meta
          name="apple-mobile-web-app-capable"
          content="yes"
        />
        <meta
          name="mobile-web-app-capable"
          content="yes"
        />
      </head>
      <body className="antialiased bg-[#0a0a0f] text-[#f0f0f5]">
        <ServiceWorkerRegister />
        <main className="min-h-[100dvh] max-w-md mx-auto relative pb-24">
          {children}
        </main>
        <Analytics />
        <InstallPrompt />
      </body>
    </html>
  );
}
