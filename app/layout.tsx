import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "MD Ambiental — Gestão e Logística de OLUC",
    template: "%s | MD Ambiental",
  },
  description:
    "Plataforma corporativa de ponta a ponta para gestão de óleo lubrificante usado e contaminado (OLUC), compliance ambiental, rotas e rastreabilidade B2B.",
  keywords: ["OLUC", "Gestão de Resíduos", "Compliance Ambiental", "MTR", "CADRI", "Logística Reversa", "MD Ambiental"],
  authors: [{ name: "Chief Integrated Systems Architect" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://mdambiental.com.br",
    title: "MD Ambiental — Gestão e Logística de OLUC",
    description: "Plataforma corporativa para logística reversa de óleo lubrificante usado.",
    siteName: "MD Ambiental Platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <body className="font-body antialiased">
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}