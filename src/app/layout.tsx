import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Manrope, Space_Grotesk } from "next/font/google";
import { headers } from "next/headers";
import { CANONICAL_ORIGIN } from "@/lib/site";
import { cn } from "@/lib/utils";

const socialImage = `${CANONICAL_ORIGIN}/opengraph-image`;

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#050505",
};

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_ORIGIN),
  title: "James Cadena | Network & Security Engineer",
  description: "Networks, systems, security, and infrastructure tooling.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "James Cadena | Network & Security Engineer",
    description: "Networks, systems, security, and infrastructure tooling.",
    images: [
      {
        url: socialImage,
        alt: "James Cadena",
      },
    ],
    url: CANONICAL_ORIGIN,
    siteName: "James Cadena",
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "James Cadena | Network & Security Engineer",
    description: "Networks, systems, security, and infrastructure tooling.",
    images: [socialImage],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Reading request headers opts this layout into dynamic rendering so Next.js
  // attaches CSP nonces to its framework scripts.
  await headers();

  return (
    <html lang="en" className={cn(manrope.variable, spaceGrotesk.variable)}>
      <body className="min-h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
