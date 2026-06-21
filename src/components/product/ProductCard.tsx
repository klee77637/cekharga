"use client";

import Image from "next/image";
import Link from "next/link";
import { PriceBand } from "@/lib/unit-price/calculator";
import { formatRupiah } from "@/lib/unit-price/normalizer";
import UnitPriceBadge from "../ui/UnitPriceBadge";

export interface ProductCardData {
  id: string;
  name: string;
  normalized_name: string;
  brand: string;
  image_url: string;
  current_price: number;
  original_price?: number;
  weight_value?: number;
  weight_unit?: string;
  unit_price?: number;
  unit_price_display?: string;
  affiliate_link: string;
  shop_name: string;
  rank_in_category?: number;
  price_band?: PriceBand;
}

interface ProductCardProps {
  product: ProductCardData;
  isCompared?: boolean;
  onToggleCompare?: (id: string) => void;
}

export default function ProductCard({
  product,
  isCompared = false,
  onToggleCompare,
}: ProductCardProps) {
  const {
    id,
    normalized_name,
    brand,
    image_url,
    current_price,
    original_price,
    unit_price_display,
    affiliate_link,
    shop_name,
    price_band = "sedang",
  } = product;

  // format prices
  const formattedPrice = formatRupiah(current_price);
  const formattedOriginal = original_price ? formatRupiah(original_price) : null;

  return (
    <article className="product-card">
      {/* Price Band Badge */}
      <div className="card-badge">
        <UnitPriceBadge band={price_band} />
      </div>

      {/* Product Image */}
      <div className="card-image-wrapper">
        <Image
          src={image_url || "/og-image.png"}
          alt={normalized_name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="card-image"
          priority={false}
          unoptimized={image_url?.startsWith("http")} // bypass next/image domain checks for external shopee urls
        />
      </div>

      {/* Card Content */}
      <div className="card-content">
        <div className="product-brand">{brand || "Merek Lain"}</div>
        <Link href={`/produk/${id}`} className="product-name" title={normalized_name}>
          {normalized_name}
        </Link>
        
        <div className="product-shop">
          <span>🏪 Store: {shop_name}</span>
        </div>

        {/* HERO element: Unit Price */}
        <div className="unit-price-section">
          <div className="unit-price-label">Harga Satuan</div>
          <div className="unit-price-value">{unit_price_display || "-"}</div>
        </div>

        {/* Total Price and Original price */}
        <div className="price-row">
          <div>
            {formattedOriginal && (
              <div className="price-original">{formattedOriginal}</div>
            )}
            <div className="price-current">{formattedPrice}</div>
          </div>

          {/* Comparison checkbox */}
          {onToggleCompare && (
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                cursor: "pointer",
                padding: "4px 8px",
                backgroundColor: isCompared ? "var(--accent-light)" : "transparent",
                border: `1px solid ${isCompared ? "var(--accent)" : "var(--border-color)"}`,
                borderRadius: "var(--radius-sm)",
                color: isCompared ? "var(--accent)" : "var(--text-secondary)",
                transition: "all var(--transition-fast)",
              }}
            >
              <input
                type="checkbox"
                checked={isCompared}
                onChange={() => onToggleCompare(id)}
                style={{ cursor: "pointer", accentColor: "var(--accent)" }}
              />
              Bandingkan
            </label>
          )}
        </div>

        {/* Affiliate Redirect Call-to-Action */}
        <div className="card-cta">
          <a
            href={affiliate_link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-block"
            onClick={(e) => {
              // Click tracking would go here
              console.log(`Product affiliate link clicked: ${id}`);
            }}
          >
            Beli di Shopee 🛒
          </a>
        </div>
      </div>
    </article>
  );
}
