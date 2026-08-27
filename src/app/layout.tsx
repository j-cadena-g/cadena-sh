import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Manrope, Space_Grotesk } from "next/font/google";
import { headers } from "next/headers";
import { ThemeProvider } from "@/components/theme-provider";
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
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5f2" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
  ],
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
  // attaches CSP nonces to its framework scripts. The same nonce is passed to
  // next-themes so its blocking inline script survives the CSP.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="en"
      className={cn(manrope.variable, spaceGrotesk.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="cadena-theme"
          nonce={nonce}
        >
          {children}
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
