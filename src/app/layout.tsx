import type { Metadata } from "next";
import { Inter, Libre_Baskerville } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  variable: "--font-libre-baskerville",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Scene",
  description: "Curated social discovery.",
};

import { CityProvider } from "@/lib/city-context";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning={true}
        className={`${inter.variable} ${libreBaskerville.variable} antialiased bg-zinc-100 dark:bg-black min-h-screen flex justify-center`}
      >
        <CityProvider>
          {children}
        </CityProvider>
      </body>
    </html>
  );
}
