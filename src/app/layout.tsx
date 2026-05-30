import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import { Barlow_Semi_Condensed, Geist, Geist_Mono, Michroma } from "next/font/google";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { PageLoader } from "@/components/layout/PageLoader";
import { InscriptionModalProvider } from "@/components/inscription/InscriptionModalProvider";
import { InscriptionLiveFeed } from "@/components/inscription/InscriptionLiveFeed";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const barlowSemiCondensed = Barlow_Semi_Condensed({
  variable: "--font-barlow-semi-condensed",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const michroma = Michroma({
  variable: "--font-michroma",
  subsets: ["latin"],
  weight: "400",
});

const akiraExpanded = localFont({
  src: [
    {
      path: "../../public/fonts/Akira-Expanded-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Akira-Expanded-Super-Bold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-akira",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VAR 4 — Du Virtuel au Réel",
  description:
    "4e édition — Jeunesse ya Qualité. 09 août 2026, Académie des Beaux-Arts, Kinshasa. Entrée libre.",
  icons: {
    icon: "/img/flavicon.png",
    shortcut: "/img/flavicon.png",
    apple: "/img/flavicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${barlowSemiCondensed.variable} ${michroma.variable} ${akiraExpanded.variable} is-preparing-scroll`}
    >
      <head>
        <Script id="scroll-restoration-reset" strategy="beforeInteractive">
          {`history.scrollRestoration = "manual"; window.scrollTo(0, 0);`}
        </Script>
      </head>
      <body className="antialiased">
        <SmoothScrollProvider>
          <PageLoader />
          <InscriptionModalProvider>
            {children}
            <InscriptionLiveFeed />
          </InscriptionModalProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
