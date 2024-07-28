import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site.config";
import { Suspense } from "react";

const fontSans = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const fontHeading = Manrope({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  creator: siteConfig.name,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
  },
  // OpenGraph metadata
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 2880,
        height: 1800,
        alt: siteConfig.name,
      },
    ],
    type: "website",
    locale: "en_US",
  },

  // Twitter metadata
  twitter: {
    card: "summary_large_image",
    site: "@rds_agi",
    title: siteConfig.name,
    description: siteConfig.description,
    images: {
      url: siteConfig.ogImage,
      width: 1280,
      height: 832,
      alt: siteConfig.name,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(fontHeading.className, fontSans.className, "w-full h-[100dvh] flex justify-center items-center")}>
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
