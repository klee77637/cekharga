import Link from "next/link";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar-container">
        <Link href="/" className="logo">
          🔍 CekHarga<span>.my.id</span>
        </Link>
        <nav className="nav-links">
          <Link href="/" className="nav-link">
            Cari
          </Link>
          <Link href="/kategori/susu-formula" className="nav-link">
            🍼 Susu Formula
          </Link>
          <Link href="/kategori/popok" className="nav-link">
            👶 Popok
          </Link>
          <Link href="/kategori/skincare" className="nav-link">
            💄 Skincare
          </Link>
          <Link href="/bandingkan" className="nav-link">
            ⚖️ Bandingkan
          </Link>
        </nav>
      </div>
    </header>
  );
}
