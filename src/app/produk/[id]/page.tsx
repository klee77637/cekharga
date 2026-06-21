import { createClient } from "@/lib/supabase/server";
import { formatRupiah, normalizeToBaseUnit } from "@/lib/unit-price/normalizer";
import { calculateUnitPrice, formatUnitPriceDisplay } from "@/lib/unit-price/calculator";
import UnitPriceBadge from "@/components/ui/UnitPriceBadge";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Fallback mock database for search/detail lookup
const MOCK_PRODUCTS_DB: Record<string, any> = {
  "mock-1": {
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
    category_slug: "susu-formula",
  },
  "mock-2": {
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
    category_slug: "susu-formula",
  },
  "mock-3": {
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
    category_slug: "popok",
  },
  "mock-4": {
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
    category_slug: "skincare",
  },
  "mock-5": {
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
    category_slug: "skincare",
  },
  "mock-6": {
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
    category_slug: "susu-formula",
  },
};

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  let product: any = null;
  let variants: any[] = [];
  let isMock = false;

  // 1. Attempt to fetch details from Supabase database
  if (!id.startsWith("mock-")) {
    try {
      const supabase = await createClient();
      
      // Fetch current product
      const { data: dbProduct, error } = await supabase
        .from("products")
        .select("*, categories(*)")
        .eq("id", id)
        .single();

      if (!error && dbProduct) {
        product = {
          ...dbProduct,
          current_price: Number(dbProduct.current_price),
          original_price: dbProduct.original_price ? Number(dbProduct.original_price) : undefined,
          weight_value: dbProduct.weight_value ? Number(dbProduct.weight_value) : undefined,
          unit_price: dbProduct.unit_price ? Number(dbProduct.unit_price) : undefined,
          category_slug: dbProduct.categories?.slug,
        };

        // Fetch variants (other products from the same brand and same category)
        const { data: dbVariants } = await supabase
          .from("products")
          .select("*")
          .eq("category_id", dbProduct.category_id)
          .eq("brand", dbProduct.brand)
          .filter("unit_price", "gt", 0)
          .order("unit_price", { ascending: true });

        if (dbVariants && dbVariants.length > 0) {
          variants = dbVariants.map((v) => ({
            id: v.id,
            name: v.name,
            weight_value: Number(v.weight_value),
            weight_unit: v.weight_unit,
            price: Number(v.current_price),
            unit_price: Number(v.unit_price),
            unit_price_display: v.unit_price_display,
            affiliate_link: v.affiliate_link,
            shop_name: v.shop_name,
          }));
        }
      }
    } catch (err) {
      console.warn("⚠️ Database query failed for product detail. Falling back to mock database.", err);
    }
  }

  // 2. Fallback to mock product detail
  if (!product) {
    product = MOCK_PRODUCTS_DB[id];
    isMock = true;

    if (!product) {
      notFound();
    }

    // Filter mock database variants of the same brand and category slug
    variants = Object.keys(MOCK_PRODUCTS_DB)
      .map((key) => ({ id: key, ...MOCK_PRODUCTS_DB[key] }))
      .filter((v) => v.category_slug === product.category_slug && v.brand === product.brand)
      .sort((a, b) => a.unit_price - b.unit_price)
      .map((v) => ({
        id: v.id,
        name: v.name,
        weight_value: v.weight_value,
        weight_unit: v.weight_unit,
        price: v.current_price,
        unit_price: v.unit_price,
        unit_price_display: v.unit_price_display,
        affiliate_link: v.affiliate_link,
        shop_name: v.shop_name,
      }));
  }

  // Double check if variants is empty, push itself as single variant
  if (variants.length === 0) {
    variants = [
      {
        id: product.id,
        name: product.name,
        weight_value: product.weight_value,
        weight_unit: product.weight_unit,
        price: product.current_price,
        unit_price: product.unit_price,
        unit_price_display: product.unit_price_display,
        affiliate_link: product.affiliate_link,
        shop_name: product.shop_name,
      },
    ];
  }

  // Determine ranks for display table (cheapest is rank 1)
  const formattedPrice = formatRupiah(product.current_price);
  const formattedOriginal = product.original_price ? formatRupiah(product.original_price) : null;

  return (
    <div style={{ flex: 1, padding: "40px 0" }} className="container">
      {/* Back button */}
      <Link
        href={product.category_slug ? `/kategori/${product.category_slug}` : "/"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "14px",
          color: "var(--text-secondary)",
          marginBottom: "24px",
          transition: "color var(--transition-fast)",
        }}
      >
        ← Kembali ke Katalog
      </Link>

      {/* Product Detail Layout */}
      <div className="product-detail-layout">
        {/* Left: Product Image */}
        <div className="detail-image-box">
          <Image
            src={product.image_url || "/og-image.png"}
            alt={product.normalized_name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "contain", padding: "20px" }}
            unoptimized={product.image_url?.startsWith("http")}
          />
        </div>

        {/* Right: Info and CTA */}
        <div className="detail-info">
          <span className="detail-brand-badge">{product.brand}</span>
          <h1 className="detail-title">{product.normalized_name}</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px", lineHeight: "1.5" }}>
            {product.name}
          </p>

          <div style={{ display: "flex", gap: "24px", alignItems: "baseline", marginBottom: "24px" }}>
            <div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Harga Total</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "32px", fontWeight: 800 }}>{formattedPrice}</span>
                {formattedOriginal && (
                  <span style={{ fontSize: "16px", color: "var(--text-muted)", textDecoration: "line-through" }}>
                    {formattedOriginal}
                  </span>
                )}
              </div>
            </div>

            <div style={{ paddingLeft: "24px", borderLeft: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Harga Satuan (Hero)</div>
              <span style={{ fontSize: "24px", fontWeight: 800, color: "var(--accent)" }}>
                {product.unit_price_display || "-"}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Toko</span>
            <div style={{ fontSize: "15px", fontWeight: 600 }}>🏪 {product.shop_name}</div>
          </div>

          <a
            href={product.affiliate_link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ width: "100%", padding: "16px", fontSize: "16px", borderRadius: "var(--radius-md)" }}
          >
            Beli Sekarang di Shopee 🛒
          </a>

          {isMock && (
            <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "12px", textAlign: "center", display: "block" }}>
              💡 Menampilkan data demo. Hubungkan Supabase & API Involve Asia untuk data nyata.
            </span>
          )}
        </div>
      </div>

      {/* ⚖️ Varian & Kemasan Comparison Section */}
      <section style={{ marginTop: "64px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "16px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
          ⚖️ Perbandingan Ukuran Kemasan Lain ({product.brand})
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
          Berikut perbandingan harga per satuan untuk merek <strong>{product.brand}</strong>. Kemasan di bagian paling atas adalah kemasan dengan harga satuan paling hemat!
        </p>

        {/* Comparison List Table */}
        <div style={{ width: "100%", overflowX: "auto", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", backgroundColor: "var(--bg-secondary)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)", backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
                <th style={{ padding: "16px", fontWeight: 700 }}>Kemasan / Variant</th>
                <th style={{ padding: "16px", fontWeight: 700 }}>Takaran</th>
                <th style={{ padding: "16px", fontWeight: 700 }}>Harga Total</th>
                <th style={{ padding: "16px", fontWeight: 700 }}>Harga Satuan</th>
                <th style={{ padding: "16px", fontWeight: 700 }}>Nilai Kehematan</th>
                <th style={{ padding: "16px", fontWeight: 700 }}>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v, index) => {
                const isCurrent = v.id === id;
                const savingsRate = index === 0 ? "hemat" : index === variants.length - 1 ? "mahal" : "sedang";
                
                return (
                  <tr
                    key={v.id}
                    style={{
                      borderBottom: "1px solid var(--border-color)",
                      backgroundColor: isCurrent ? "rgba(255, 107, 53, 0.03)" : "transparent",
                      fontWeight: isCurrent ? 600 : 400,
                    }}
                  >
                    <td style={{ padding: "16px" }}>
                      {v.name.split("Susu Formula")[0].split("Pants")[0].trim() || v.name}
                      {isCurrent && <span style={{ fontSize: "11px", color: "var(--accent)", marginLeft: "8px", fontStyle: "italic" }}>(sedang dilihat)</span>}
                    </td>
                    <td style={{ padding: "16px" }}>{v.weight_value} {v.weight_unit}</td>
                    <td style={{ padding: "16px" }}>{formatRupiah(v.price)}</td>
                    <td style={{ padding: "16px", color: index === 0 ? "var(--color-hemat)" : "inherit", fontWeight: index === 0 ? 700 : "inherit" }}>
                      {v.unit_price_display}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <UnitPriceBadge band={savingsRate} />
                    </td>
                    <td style={{ padding: "16px" }}>
                      {isCurrent ? (
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Aktif</span>
                      ) : (
                        <Link href={`/produk/${v.id}`} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>
                          Bandingkan
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
