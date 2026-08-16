import type { Metadata, Viewport } from "next";
import { Bagel_Fat_One, Outfit, Caveat } from "next/font/google";
import "./globals.css";

const bagel = Bagel_Fat_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bagel",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Roa Brew — Té · Matcha · Cold Brew",
    template: "%s · Roa Brew",
  },
  description:
    "Bebidas artesanales en Los Olivos, Lima. Matcha ceremonial, café de especialidad extraído en frío por 18hrs y sparkling tea con popping boba. Pide por WhatsApp.",
  keywords: [
    "Roa Brew",
    "matcha Lima",
    "cold brew Lima",
    "bubble tea Los Olivos",
    "popping boba",
    "sparkling tea",
    "milk tea Perú",
  ],
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: "Roa Brew",
    title: "Roa Brew — Té · Matcha · Cold Brew",
    description:
      "Bebidas artesanales que se ven tan bien como saben. Los Olivos, Lima.",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b120a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${bagel.variable} ${outfit.variable} ${caveat.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
