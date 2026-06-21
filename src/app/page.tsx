import { Suspense } from "react";
import SearchBar from "@/components/ui/SearchBar";
import CategoryTabs from "@/components/layout/CategoryTabs";
import ProductCard, { ProductCardData } from "@/components/product/ProductCard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Fallback mock categories for UI presentation if DB is empty
const MOCK_CATEGORIES = [
  { name: "Susu Formula", slug: "susu-formula", emoji: "🍼" },
  { name: "Popok Bayi", slug: "popok", emoji: "👶" },
  { name: "Skincare", slug: "skincare", emoji: "💄" },
];

// Fallback mock products for UI presentation if DB is empty
const MOCK_PRODUCTS: ProductCardData[] = [
  {
    id: "mock-1",
    name: "SGM Eksplor 1+ Madu Susu Formula 900g / 900 gram",
    normalized_name: "Sgm Eksplor 1+ Madu 900g",
    brand: "SGM",
    image_url: "https://picsum.photos/seed/sgm1madu/300/300",
    current_price: 94500,
    original_price: 105000,
    weight_value: 900,
    weight_unit: "g",
    unit_price: 105,
    unit_price_display: "Rp 10.500 / 100g",
    affiliate_link: "https://shope.ee/mock-sgm-900g",
    shop_name: "SGM Official Store",
    price_band: "hemat",
  },
  {
    id: "mock-2",
    name: "Bebelac 3 Madu Susu Formula Anak 1-3 Tahun 1.8kg (1800g)",
    normalized_name: "Bebelac 3 Madu 1.8kg",
    brand: "Bebelac",
    image_url: "https://picsum.photos/seed/bebelac3/300/300",
    current_price: 289000,
    original_price: 315000,
    weight_value: 1800,
    weight_unit: "g",
    unit_price: 160.5,
    unit_price_display: "Rp 16.050 / 100g",
    affiliate_link: "https://shope.ee/mock-bebelac-1800g",
    shop_name: "Nutricia Official Store",
    price_band: "hemat",
  },
  {
    id: "mock-3",
    name: "MamyPoko Pants Royal Soft Size M 64 pcs / lembar",
    normalized_name: "Mamypoko Pants Royal Soft Size M 64 Pcs",
    brand: "MamyPoko",
    image_url: "https://picsum.photos/seed/mamypokom64/300/300",
    current_price: 156000,
    original_price: 180000,
    weight_value: 64,
    weight_unit: "pcs",
    unit_price: 2437.5,
    unit_price_display: "Rp 2.438 / pcs",
    affiliate_link: "https://shope.ee/mock-mamypoko-m64",
    shop_name: "MamyPoko Official Shop",
    price_band: "hemat",
  },
  {
    id: "mock-4",
    name: "Skintific 5X Ceramide Barrier Moisture Gel 50g",
    normalized_name: "Skintific 5x Ceramide Barrier Moisture Gel 50g",
    brand: "Skintific",
    image_url: "https://picsum.photos/seed/skintific50g/300/300",
    current_price: 139000,
    original_price: 169000,
    weight_value: 50,
    weight_unit: "g",
    unit_price: 2780,
    unit_price_display: "Rp 2.780 / ml",
    affiliate_link: "https://shope.ee/mock-skintific-50g",
    shop_name: "Skintific Official Store",
    price_band: "sedang",
  },
  {
    id: "mock-5",
    name: "COSRX Low pH Good Morning Gel Cleanser 150ml",
    normalized_name: "Cosrx Low Ph Good Morning Gel Cleanser 150ml",
    brand: "COSRX",
    image_url: "https://picsum.photos/seed/cosrx150ml/300/300",
    current_price: 99000,
    original_price: 149000,
    weight_value: 150,
    weight_unit: "ml",
    unit_price: 660,
    unit_price_display: "Rp 660 / ml",
    affiliate_link: "https://shope.ee/mock-cosrx-150ml",
    shop_name: "COSRX Indonesia Official",
    price_band: "hemat",
  },
  {
    id: "mock-6",
    name: "SGM Eksplor 1+ Vanila Susu Formula 400g",
    normalized_name: "Sgm Eksplor 1+ Vanila 400g",
    brand: "SGM",
    image_url: "https://picsum.photos/seed/sgm1vanila/300/300",
    current_price: 45000,
    original_price: 50000,
    weight_value: 400,
    weight_unit: "g",
    unit_price: 112.5,
    unit_price_display: "Rp 11.250 / 100g",
    affiliate_link: "https://shope.ee/mock-sgm-400g",
    shop_name: "SGM Official Store",
    price_band: "sedang",
  },
];

export default async function Home() {
  let categories = MOCK_CATEGORIES;
  let products: ProductCardData[] = MOCK_PRODUCTS;
  let isFromDatabase = false;

  try {
    const supabase = await createClient();
    
    // Fetch featured categories
    const { data: dbCategories, error: catError } = await supabase
      .from("categories")
      .select("*")
      .eq("is_featured", true);
      
    if (!catError && dbCategories && dbCategories.length > 0) {
      categories = dbCategories;
    }

    // Fetch top hemat products in database
    const { data: dbProducts, error: prodError } = await supabase
      .from("products")
      .select("*")
      .filter("unit_price", "gt", 0)
      .order("unit_price", { ascending: true })
      .limit(6);

    if (!prodError && dbProducts && dbProducts.length > 0) {
      // Map database schema to ProductCardData interface
      products = dbProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        normalized_name: p.normalized_name || p.name,
        brand: p.brand || "Merek Lain",
        image_url: p.image_url,
        current_price: Number(p.current_price),
        original_price: p.original_price ? Number(p.original_price) : undefined,
        weight_value: p.weight_value ? Number(p.weight_value) : undefined,
        weight_unit: p.weight_unit,
        unit_price: p.unit_price ? Number(p.unit_price) : undefined,
        unit_price_display: p.unit_price_display,
        affiliate_link: p.affiliate_link,
        shop_name: p.shop_name,
        price_band: "hemat", // default to hemat since we sorted by unit price asc
      }));
      isFromDatabase = true;
    }
  } catch (error) {
    console.warn("⚠️ Failed to load data from Supabase. Falling back to mock presentation data.", error);
  }

  return (
    <div style={{ flex: 1, paddingBottom: "64px" }}>
      {/* 🚀 Hero Section */}
      <section className="hero container">
        <h1 className="hero-title">Bandingkan & Cari Harga Satuan Paling Hemat</h1>
        <p className="hero-subtitle">
          Bandingkan harga per gram susu formula, per lembar popok bayi, dan per ml skincare.
          Temukan kemasan mana yang paling menguntungkan belanjaan Anda!
        </p>

        {/* Search Bar */}
        <Suspense fallback={
          <div className="search-wrapper">
            <div className="search-bar" style={{ opacity: 0.6 }}>
              <input className="search-input" placeholder="Memuat pencarian..." disabled style={{ cursor: "not-allowed" }} />
              <button className="search-button" disabled style={{ cursor: "not-allowed" }}>Cari 🔍</button>
            </div>
          </div>
        }>
          <SearchBar />
        </Suspense>

        {/* Category Tab Selector */}
        <CategoryTabs />
      </section>

      {/* ⭐ Best Value Highlights Section */}
      <section className="container" style={{ marginTop: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700 }}>
            🔥 Paling Hemat Minggu Ini
          </h2>
          {isFromDatabase && (
            <span style={{ fontSize: "12px", color: "var(--color-hemat)", fontWeight: 600 }}>
              ⚡ Terkini dari Database
            </span>
          )}
        </div>

        {/* Grid of Product Cards */}
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ℹ️ How it works section */}
      <section className="container" style={{ marginTop: "80px", backgroundColor: "var(--bg-secondary)", borderRadius: "var(--radius-lg)", padding: "40px", border: "1px solid var(--border-color)" }}>
        <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px", textAlign: "center" }}>
          Kenapa Harus CekHarga? 🤔
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "32px", marginTop: "24px" }}>
          <div>
            <h4 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px", color: "var(--accent)" }}>
              1. Jebakan Kemasan Sachet / Kecil
            </h4>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              Kemasan besar tidak selalu lebih murah! Banyak produsen mematok harga lebih murah
              per gram pada kemasan sedang atau kecil saat ada promo. Kami membedahnya secara objektif.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px", color: "var(--accent)" }}>
              2. Normalisasi Satuan yang Adil
            </h4>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              Kami mengubah semua takaran (kg ke gram, liter ke ml) ke satuan pembanding dasar yang sama
              sehingga Anda dapat membandingkan harga dengan mudah tanpa ribet menghitung manual.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px", color: "var(--accent)" }}>
              3. Penilaian Hijau-Kuning-Merah
            </h4>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              Setiap produk diklasifikasikan secara real-time. Label hijau 🟢 berarti produk memiliki nilai
              per satuan terbaik di kelasnya. Belanja jadi lebih yakin dan anti-boros!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
