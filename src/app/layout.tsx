import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { JetBrains_Mono, Manrope, Space_Grotesk } from "next/font/google";
import { headers } from "next/headers";
import { ThemeProvider } from "@/components/theme-provider";
import { CANONICAL_ORIGIN } from "@/lib/site";
import { THEME_STORAGE_KEY } from "@/lib/theme";
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

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-code",
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
  title: "James Cadena | IT Infrastructure Analyst",
  description: "Enterprise network architecture, security, and systems.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "James Cadena | IT Infrastructure Analyst",
    description: "Enterprise network architecture, security, and systems.",
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
    title: "James Cadena | IT Infrastructure Analyst",
    description: "Enterprise network architecture, security, and systems.",
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
      className={cn(
        manrope.variable,
        spaceGrotesk.variable,
        jetbrainsMono.variable,
      )}
      suppressHydrationWarning
    >
      <body className="min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey={THEME_STORAGE_KEY}
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
