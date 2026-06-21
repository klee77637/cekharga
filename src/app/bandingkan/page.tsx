"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatRupiah } from "@/lib/unit-price/normalizer";
import UnitPriceBadge from "@/components/ui/UnitPriceBadge";
import { classifyPriceBands } from "@/lib/unit-price/calculator";

interface CompareItem {
  id: string;
  name: string;
  normalized_name: string;
  brand: string;
  image_url: string;
  current_price: number;
  weight_value: number;
  weight_unit: string;
  unit_price: number;
  unit_price_display: string;
  affiliate_link: string;
  shop_name: string;
}

// Fallback details for mock compared products if database is not active
const MOCK_PRODUCTS_LIST: Record<string, CompareItem> = {
  "mock-1": {
    id: "mock-1",
    name: "SGM Eksplor 1+ Madu Susu Formula 900g / 900 gram",
    normalized_name: "Sgm Eksplor 1+ Madu 900g",
    brand: "SGM",
    image_url: "https://picsum.photos/seed/sgm1madu/300/300",
    current_price: 94500,
    weight_value: 900,
    weight_unit: "g",
    unit_price: 105,
    unit_price_display: "Rp 10.500 / 100g",
    affiliate_link: "https://shope.ee/mock-sgm-900g",
    shop_name: "SGM Official Store",
  },
  "mock-2": {
    id: "mock-2",
    name: "Bebelac 3 Madu Susu Formula Anak 1-3 Tahun 1.8kg (1800g)",
    normalized_name: "Bebelac 3 Madu 1.8kg",
    brand: "Bebelac",
    image_url: "https://picsum.photos/seed/bebelac3/300/300",
    current_price: 289000,
    weight_value: 1800,
    weight_unit: "g",
    unit_price: 160.5,
    unit_price_display: "Rp 16.050 / 100g",
    affiliate_link: "https://shope.ee/mock-bebelac-1800g",
    shop_name: "Nutricia Official Store",
  },
  "mock-6": {
    id: "mock-6",
    name: "SGM Eksplor 1+ Vanila Susu Formula 400g",
    normalized_name: "Sgm Eksplor 1+ Vanila 400g",
    brand: "SGM",
    image_url: "https://picsum.photos/seed/sgm1vanila/300/300",
    current_price: 45000,
    weight_value: 400,
    weight_unit: "g",
    unit_price: 112.5,
    unit_price_display: "Rp 11.250 / 100g",
    affiliate_link: "https://shope.ee/mock-sgm-400g",
    shop_name: "SGM Official Store",
  },
};

export default function BandingkanPage() {
  const [comparedProducts, setComparedProducts] = useState<CompareItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load compared product IDs from localStorage
  useEffect(() => {
    loadComparedProducts();
  }, []);

  const loadComparedProducts = () => {
    setLoading(true);
    try {
      const storedIds = localStorage.getItem("cekharga_compare_ids");
      const ids: string[] = storedIds ? JSON.parse(storedIds) : [];
      
      // Load details for each ID
      const items: CompareItem[] = [];
      
      // For testing/mocking, if localStorage is empty, let's load mock products A and B
      if (ids.length === 0) {
        items.push(MOCK_PRODUCTS_LIST["mock-1"]);
        items.push(MOCK_PRODUCTS_LIST["mock-2"]);
      } else {
        ids.forEach(id => {
          // If mock id, load from mock list
          if (MOCK_PRODUCTS_LIST[id]) {
            items.push(MOCK_PRODUCTS_LIST[id]);
          } else {
            // In a real setup, we would fetch details from database via API
            // For now, let's check local cache or just fetch a mock details representation
            const cachedItem = localStorage.getItem(`cekharga_product_cache_${id}`);
            if (cachedItem) {
              items.push(JSON.parse(cachedItem));
            }
          }
        });
      }
      
      // Classify price bands for compared list
      const bands = classifyPriceBands(items);
      const itemsWithBands = items.map(item => ({
        ...item,
        price_band: bands[item.id] || "sedang"
      }));

      setComparedProducts(itemsWithBands);
    } catch (e) {
      console.error("Failed to load compared products", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (id: string) => {
    try {
      const storedIds = localStorage.getItem("cekharga_compare_ids");
      const ids: string[] = storedIds ? JSON.parse(storedIds) : [];
      
      const newIds = ids.filter(item => item !== id);
      localStorage.setItem("cekharga_compare_ids", JSON.stringify(newIds));
      
      loadComparedProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClear = () => {
    try {
      localStorage.setItem("cekharga_compare_ids", JSON.stringify([]));
      setComparedProducts([]);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, padding: "80px 0", textAlign: "center" }} className="container">
        <div style={{ fontSize: "16px", color: "var(--text-secondary)" }}>Memuat perbandingan produk...</div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, padding: "40px 0" }} className="container">
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.03em" }}>⚖️ Perbandingan Side-by-Side</h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Bandingkan harga satuan, total, dan nilai kehematan produk yang Anda pilih.
          </p>
        </div>
        {comparedProducts.length > 0 && (
          <button 
            onClick={handleClear}
            className="btn btn-secondary" 
            style={{ padding: "8px 16px", fontSize: "13px" }}
          >
            Bersihkan Semua 🗑️
          </button>
        )}
      </div>

      {comparedProducts.length === 0 ? (
        <div className="compare-card-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3h18v18H3z" />
            <path d="M21 9H3" />
            <path d="M21 15H3" />
            <path d="M12 3v18" />
          </svg>
          <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>
            Belum ada produk terpilih untuk dibandingkan
          </p>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px", textAlign: "center", maxWidth: "40ch" }}>
            Silakan cari produk di halaman utama dan centang checkbox "Bandingkan" pada kartu produk.
          </p>
          <Link href="/" className="btn btn-primary">
            Cari Produk Sekarang
          </Link>
        </div>
      ) : (
        <div style={{ width: "100%", overflowX: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: `160px repeat(${comparedProducts.length}, minmax(240px, 1fr))`, gap: "1px", backgroundColor: "var(--border-color)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            
            {/* Row 1: Image */}
            <div style={{ backgroundColor: "var(--bg-secondary)", padding: "16px", display: "flex", alignItems: "center", fontWeight: 700 }}>
              Produk
            </div>
            {comparedProducts.map(p => (
              <div key={p.id} style={{ backgroundColor: "var(--bg-secondary)", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                <button 
                  onClick={() => handleRemove(p.id)}
                  style={{ position: "absolute", top: "10px", right: "10px", color: "var(--text-muted)", cursor: "pointer", fontSize: "16px", padding: "4px" }}
                  title="Hapus dari perbandingan"
                >
                  ✕
                </button>
                <div style={{ width: "120px", height: "120px", position: "relative", marginBottom: "12px", backgroundColor: "#1e1e24", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                  <Image
                    src={p.image_url}
                    alt={p.normalized_name}
                    fill
                    sizes="120px"
                    style={{ objectFit: "contain", padding: "8px" }}
                    unoptimized={p.image_url?.startsWith("http")}
                  />
                </div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", marginBottom: "4px" }}>
                  {p.brand}
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, textAlign: "center", lineHeight: "1.4", height: "40px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {p.normalized_name}
                </div>
              </div>
            ))}

            {/* Row 2: Kehematan */}
            <div style={{ backgroundColor: "var(--bg-secondary)", padding: "16px", display: "flex", alignItems: "center", fontWeight: 700 }}>
              Nilai Hemat
            </div>
            {comparedProducts.map(p => (
              <div key={p.id} style={{ backgroundColor: "var(--bg-secondary)", padding: "16px", display: "flex", justifyContent: "center" }}>
                <UnitPriceBadge band={(p as any).price_band} />
              </div>
            ))}

            {/* Row 3: Harga Satuan */}
            <div style={{ backgroundColor: "var(--bg-secondary)", padding: "16px", display: "flex", alignItems: "center", fontWeight: 700 }}>
              Harga Satuan
            </div>
            {comparedProducts.map(p => (
              <div key={p.id} style={{ backgroundColor: "var(--bg-secondary)", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
                  {p.unit_price_display}
                </span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  (Rp {p.unit_price.toFixed(1)} / {p.weight_unit})
                </span>
              </div>
            ))}

            {/* Row 4: Harga Total */}
            <div style={{ backgroundColor: "var(--bg-secondary)", padding: "16px", display: "flex", alignItems: "center", fontWeight: 700 }}>
              Harga Paket
            </div>
            {comparedProducts.map(p => (
              <div key={p.id} style={{ backgroundColor: "var(--bg-secondary)", padding: "16px", textAlign: "center", fontSize: "16px", fontWeight: 600 }}>
                {formatRupiah(p.current_price)}
              </div>
            ))}

            {/* Row 5: Takaran / Berat */}
            <div style={{ backgroundColor: "var(--bg-secondary)", padding: "16px", display: "flex", alignItems: "center", fontWeight: 700 }}>
              Ukuran Takaran
            </div>
            {comparedProducts.map(p => (
              <div key={p.id} style={{ backgroundColor: "var(--bg-secondary)", padding: "16px", textAlign: "center", fontSize: "15px" }}>
                {p.weight_value} {p.weight_unit}
              </div>
            ))}

            {/* Row 6: Toko */}
            <div style={{ backgroundColor: "var(--bg-secondary)", padding: "16px", display: "flex", alignItems: "center", fontWeight: 700 }}>
              Nama Toko
            </div>
            {comparedProducts.map(p => (
              <div key={p.id} style={{ backgroundColor: "var(--bg-secondary)", padding: "16px", textAlign: "center", color: "var(--text-secondary)" }}>
                🏪 {p.shop_name}
              </div>
            ))}

            {/* Row 7: Action CTA */}
            <div style={{ backgroundColor: "var(--bg-secondary)", padding: "16px", display: "flex", alignItems: "center", fontWeight: 700 }}>
              Tindakan
            </div>
            {comparedProducts.map(p => (
              <div key={p.id} style={{ backgroundColor: "var(--bg-secondary)", padding: "20px", display: "flex", justifyContent: "center" }}>
                <a 
                  href={p.affiliate_link}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "10px" }}
                >
                  Beli di Shopee 🛒
                </a>
              </div>
            ))}

          </div>
        </div>
      )}
    </div>
  );
}
