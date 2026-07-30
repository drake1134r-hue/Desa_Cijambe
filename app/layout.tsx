import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DESA CIJAMBE | Portal Resmi Desa Digital",
  description:
    "Desa Cijambe, Kecamatan Paseh, Kabupaten Sumedang. Portal resmi untuk informasi desa, layanan digital, dan transparansi pemerintahan.",
  metadataBase: new URL("https://desacijambe.example"),
  openGraph: {
    title: "DESA CIJAMBE | Portal Resmi Desa Digital",
    description:
      "Desa Cijambe, Kecamatan Paseh, Kabupaten Sumedang. Portal resmi untuk informasi desa, layanan digital, dan transparansi pemerintahan.",
    type: "website",
    url: "https://desacijambe.example",
    siteName: "DESA CIJAMBE",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Desa Cijambe",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DESA CIJAMBE",
    description:
      "Desa Cijambe, Kecamatan Paseh, Kabupaten Sumedang. Portal resmi untuk informasi desa, layanan digital, dan transparansi pemerintahan.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/images/desa.png",
    shortcut: "/images/desa.png",
    apple: "/images/desa.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <meta name="theme-color" content="#059669" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="dns-prefetch" href="https://www.google.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className="min-h-full flex flex-col">
        <Header />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
