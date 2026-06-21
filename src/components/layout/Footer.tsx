import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-links">
          <Link href="/" className="footer-link">
            Beranda
          </Link>
          <Link href="/tentang" className="footer-link">
            Tentang Kami
          </Link>
          <Link href="/kebijakan-privasi" className="footer-link">
            Kebijakan Privasi
          </Link>
        </div>

        <div className="footer-disclaimer">
          <p>
            <strong>Pemberitahuan Kemitraan:</strong> CekHarga adalah platform pembanding harga
            independen dan berpartisipasi dalam Program Afiliasi Shopee. Kami dapat menerima komisi
            apabila Anda membeli produk melalui tautan rujukan di situs ini tanpa biaya tambahan bagi Anda.
          </p>
          <p style={{ marginTop: "8px", fontSize: "11px", color: "var(--text-muted)" }}>
            🍼 <strong>Pemberitahuan Kesehatan Bayi:</strong> Air Susu Ibu (ASI) adalah nutrisi terbaik untuk
            bayi Anda. Konsultasikan dengan dokter anak atau tenaga medis sebelum menggunakan susu formula.
          </p>
          <p style={{ marginTop: "8px", fontSize: "11px", color: "var(--text-muted)" }}>
            ⚠️ Harga yang ditampilkan dapat berubah sewaktu-waktu sesuai ketentuan pihak penjual di marketplace.
            Selalu cek ulang harga terkini di aplikasi resmi sebelum melakukan transaksi.
          </p>
        </div>

        <div className="footer-saweria">
          <span>Suka dengan alat ini? Dukung kami:</span>
          <a
            href="https://saweria.co/mock-cekharga"
            target="_blank"
            rel="noopener noreferrer"
            className="saweria-btn"
          >
            ☕ Dukung di Saweria
          </a>
        </div>

        <p style={{ marginTop: "16px", fontSize: "11px" }}>
          &copy; {currentYear} CekHarga. Dibuat dengan ❤️ untuk Ibu & Ayah cerdas Indonesia.
        </p>
      </div>
    </footer>
  );
}
