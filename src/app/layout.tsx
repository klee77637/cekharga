import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CekHarga - Bandingkan Harga per Gram, ml & pcs Terbaik Shopee",
  description:
    "Cek kemasan mana yang paling hemat dari produk favorit Anda. Bandingkan harga per unit (susu formula per gram, popok per lembar, skincare per ml) secara real-time.",
  keywords: [
    "cek harga",
    "bandingkan harga",
    "susu formula termurah",
    "popok murah shopee",
    "harga per gram",
    "harga per ml",
    "shopee affiliate",
    "hemat belanja",
  ],
  authors: [{ name: "CekHarga Team" }],
  openGraph: {
    title: "CekHarga - Bandingkan Harga per Gram, ml & pcs Terbaik Shopee",
    description:
      "Cari kemasan paling hemat dengan kalkulator unit price otomatis untuk susu formula, popok bayi, dan skincare.",
    url: "https://cekharga.my.id",
    siteName: "CekHarga",
    locale: "id_ID",
    type: "website",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
