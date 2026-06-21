import ShareCardGenerator from "@/components/product/ShareCardGenerator";
import Link from "next/link";

export const metadata = {
  title: "Pembuat Infografis Konten - Portal Admin CekHarga",
  description: "Generate gambar perbandingan produk terhemat dalam aspek rasio 9:16 untuk diposting ke TikTok/Instagram.",
};

export default function GeneratorPage() {
  return (
    <div style={{ flex: 1, padding: "40px 0" }} className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.03em" }}>🎨 Pembuat Konten Infografis</h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Input harga produk untuk men-generate gambar perbandingan terhemat siap posting ke TikTok atau Reels.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/admin" className="btn btn-secondary" style={{ textDecoration: "none" }}>
            ← Kembali ke Admin
          </Link>
        </div>
      </div>

      <ShareCardGenerator />
    </div>
  );
}
