import SearchBar from "@/components/ui/SearchBar";
import ProductCard, { ProductCardData } from "@/components/product/ProductCard";
import { createClient } from "@/lib/supabase/server";
import { searchShopeeOffers } from "@/lib/shopee/api";
import { classifyPriceBands } from "@/lib/unit-price/calculator";
import Link from "next/link";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
}

// Map slugs to mock category numeric IDs for API fallbacks
const MOCK_CAT_MAP: Record<string, number> = {
  "susu-formula": 1,
  "popok": 2,
  "skincare": 3,
};

async function SearchResults({ q = "", categorySlug = "" }) {
  let products: ProductCardData[] = [];
  let isFromDatabase = false;

  try {
    const supabase = await createClient();
    let query = supabase.from("products").select("*, categories!inner(*)");

    if (q.trim()) {
      query = query.or(`name.ilike.%${q}%,normalized_name.ilike.%${q}%,brand.ilike.%${q}%`);
    }

    if (categorySlug) {
      query = query.eq("categories.slug", categorySlug);
    }

    // Sort by unit price ascending by default (cheapest per gram first)
    const { data: dbProducts, error } = await query
      .filter("unit_price", "gt", 0)
      .order("unit_price", { ascending: true })
      .limit(30);

    if (!error && dbProducts && dbProducts.length > 0) {
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
      }));
      isFromDatabase = true;
    }
  } catch (err) {
    console.warn("⚠️ Database query failed, checking mock api fallback...", err);
  }

  // Fallback to Mock API Penawaran Shopee if database yields nothing
  if (products.length === 0) {
    const mockCatId = MOCK_CAT_MAP[categorySlug];
    const { list } = await searchShopeeOffers({
      keyword: q,
      categoryId: mockCatId,
      limit: 20,
    });

    products = list.map((item, idx) => {
      let weightUnit = "g";
      let weightValue = 900;
      let displayUnit = "100g";
      let factor = 100;

      if (categorySlug === "popok" || item.offerName.toLowerCase().includes("pants") || item.offerName.toLowerCase().includes("diapers")) {
        weightUnit = "pcs";
        weightValue = 32;
        displayUnit = "pcs";
        factor = 1;
      } else if (categorySlug === "skincare" || item.offerName.toLowerCase().includes("ml") || item.offerName.toLowerCase().includes("essence")) {
        weightUnit = "ml";
        weightValue = 100;
        displayUnit = "ml";
        factor = 1;
      }

      const calculatedUnitVal = item.price / weightValue;

      return {
        id: `mock-search-${idx}`,
        name: item.offerName,
        normalized_name: item.offerName,
        brand: item.shopName.split(" ")[0] || "Shopee",
        image_url: item.imageUrl,
        current_price: item.price,
        original_price: item.originalPrice,
        weight_value: weightValue,
        weight_unit: weightUnit,
        unit_price: calculatedUnitVal,
        unit_price_display: `Rp ${(calculatedUnitVal * factor).toFixed(0)} / ${displayUnit}`,
        affiliate_link: item.offerLink,
        shop_name: item.shopName,
      };
    });
  }

  // Calculate price bands (hemat, sedang, mahal) for results
  const bands = classifyPriceBands(products);
  const productsWithBands = products.map((p) => ({
    ...p,
    price_band: bands[p.id] || "sedang",
  }));

  if (productsWithBands.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>
          Tidak menemukan produk dengan kata kunci tersebut.
        </p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: "16px", display: "inline-flex" }}>
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700 }}>
          Daftar Hasil Temuan ({productsWithBands.length})
        </h2>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          Diurutkan berdasarkan: <strong>Unit Price Terendah 🟢</strong>
        </span>
      </div>

      <div className="product-grid">
        {productsWithBands.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default async function CariPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";
  const categorySlug = resolvedParams.category || "";

  return (
    <div style={{ flex: 1, padding: "40px 0" }} className="container">
      {/* Search Header */}
      <section style={{ marginBottom: "32px", display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
        <SearchBar initialValue={q} initialCategory={categorySlug} />
      </section>

      {/* Results Section */}
      <Suspense fallback={
        <div style={{ textAlign: "center", padding: "64px 0" }}>
          <div style={{ fontSize: "16px", color: "var(--text-secondary)" }}>Mencari produk terhemat...</div>
        </div>
      }>
        <SearchResults q={q} categorySlug={categorySlug} />
      </Suspense>
    </div>
  );
}
