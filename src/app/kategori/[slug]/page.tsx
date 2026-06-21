import { createClient } from "@/lib/supabase/server";
import ProductCard, { ProductCardData } from "@/components/product/ProductCard";
import CategoryTabs from "@/components/layout/CategoryTabs";
import { searchShopeeOffers } from "@/lib/shopee/api";
import { classifyPriceBands } from "@/lib/unit-price/calculator";
import Link from "next/link";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Category static profiles
const CATEGORY_PROFILES: Record<string, { name: string; emoji: string; mockId: number }> = {
  "susu-formula": { name: "Susu Formula", emoji: "🍼", mockId: 1 },
  "popok": { name: "Popok Bayi", emoji: "👶", mockId: 2 },
  "skincare": { name: "Skincare", emoji: "💄", mockId: 3 },
};

async function CategoryProducts({ slug = "" }) {
  let products: ProductCardData[] = [];
  const profile = CATEGORY_PROFILES[slug];

  try {
    const supabase = await createClient();
    const { data: dbProducts, error } = await supabase
      .from("products")
      .select("*, categories!inner(*)")
      .eq("categories.slug", slug)
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
    }
  } catch (err) {
    console.warn("⚠️ Failed to load database products for category. Using API fallback.", err);
  }

  // Fallback to Mock API offers if DB is empty
  if (products.length === 0 && profile) {
    const { list } = await searchShopeeOffers({
      categoryId: profile.mockId,
      limit: 20,
    });

    products = list.map((item, idx) => {
      let weightUnit = "g";
      let weightValue = 900;
      let displayUnit = "100g";
      let factor = 100;

      if (slug === "popok") {
        weightUnit = "pcs";
        weightValue = item.offerName.toLowerCase().includes("royal") ? 64 : 30;
        displayUnit = "pcs";
        factor = 1;
      } else if (slug === "skincare") {
        weightUnit = "ml";
        weightValue = item.offerName.toLowerCase().includes("snail") ? 100 : 150;
        displayUnit = "ml";
        factor = 1;
      }

      const calculatedUnitVal = item.price / weightValue;

      return {
        id: `mock-cat-${idx}`,
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

  // Assign price bands (hemat, sedang, mahal)
  const bands = classifyPriceBands(products);
  const productsWithBands = products.map((p) => ({
    ...p,
    price_band: bands[p.id] || "sedang",
  }));

  if (productsWithBands.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <p style={{ color: "var(--text-secondary)" }}>Kategori ini belum memiliki data produk.</p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: "16px", display: "inline-flex" }}>
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {productsWithBands.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default async function KategoriPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const profile = CATEGORY_PROFILES[slug] || { name: "Kategori Lain", emoji: "📦" };

  return (
    <div style={{ flex: 1, padding: "40px 0" }} className="container">
      {/* Category Header */}
      <section style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "24px", marginBottom: "32px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ fontSize: "40px" }}>{profile.emoji}</span>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-0.03em" }}>
              Kategori: {profile.name}
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Menampilkan pilihan produk {profile.name.toLowerCase()} terhemat diurutkan berdasarkan harga per unit.
            </p>
          </div>
        </div>

        {/* Category Tab Selector Pills */}
        <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "12px" }}>
          <CategoryTabs activeSlug={slug} />
        </div>
      </section>

      {/* Products Grid */}
      <Suspense fallback={
        <div style={{ textAlign: "center", padding: "64px 0" }}>
          <div style={{ fontSize: "16px", color: "var(--text-secondary)" }}>Memuat katalog produk terhemat...</div>
        </div>
      }>
        <CategoryProducts slug={slug} />
      </Suspense>
    </div>
  );
}
