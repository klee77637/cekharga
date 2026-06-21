import { ShopeeProductOffer } from "./api";
import { extractQuantity, extractBrand } from "../unit-price/extractor";
import { normalizeToBaseUnit } from "../unit-price/normalizer";
import { calculateUnitPrice, formatUnitPriceDisplay } from "../unit-price/calculator";

export interface TransformedProduct {
  shopee_item_id: bigint;
  shopee_shop_id: bigint;
  category_id: string; // Category UUID from DB
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
  commission_rate: number;
  affiliate_link: string;
  shop_name: string;
  marketplace: string;
}

/**
 * Cleans up product titles by removing common spam/marketing buzzwords in Shopee Indonesia.
 */
export function cleanProductTitle(title: string): string {
  let cleaned = title
    // Remove brackets with text inside (e.g. "[PROMO]", "[BPOM]")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\([^)]*\)/g, "")
    // Remove common marketing terms
    .replace(/\b(promo|murah|original|terlaris|ready|stock|bpom|100%|diskon|flash sale|gratis ongkir)\b/gi, "")
    // Clean multiple spaces and trim
    .replace(/\s+/g, " ")
    .trim();

  // Capitalize first letter of each word for neatness
  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Transforms a Shopee product offer from the API into our database schema format.
 * Automatically handles weight extraction, normalization, and unit price calculation.
 * 
 * @param offer Product offer from Shopee API
 * @param categoryId Database category UUID
 * @param unitConfig Category unit configurations for display formatting (factor, label, custom regexes)
 */
export function transformShopeeProduct(
  offer: ShopeeProductOffer,
  categoryId: string,
  unitConfig?: {
    normalization_factor: number;
    display_label: string;
    regex_patterns?: string[];
  }
): TransformedProduct {
  const brand = extractBrand(offer.offerName);
  const normalizedName = cleanProductTitle(offer.offerName);

  // Extract quantity (weight, volume, count)
  const qty = extractQuantity(offer.offerName, unitConfig?.regex_patterns);

  let weightValue: number | undefined;
  let weightUnit: string | undefined;
  let unitPrice: number | undefined;
  let unitPriceDisplay: string | undefined;

  if (qty) {
    weightValue = qty.value;
    weightUnit = qty.unit;

    // Normalize to base unit (e.g. kg -> gram)
    const { normalizedValue } = normalizeToBaseUnit(qty.value, qty.unit);

    // Calculate unit price per base unit (1g / 1ml / 1pcs)
    unitPrice = calculateUnitPrice(offer.price, normalizedValue);

    // Format unit price display (e.g. "Rp 150 / gram")
    if (unitConfig) {
      unitPriceDisplay = formatUnitPriceDisplay(
        unitPrice,
        unitConfig.normalization_factor,
        unitConfig.display_label
      );
    } else {
      // Fallback display format per base unit
      unitPriceDisplay = `${offer.price / normalizedValue} / ${qty.unit}`;
    }
  }

  return {
    shopee_item_id: offer.itemId,
    shopee_shop_id: offer.shopId,
    category_id: categoryId,
    name: offer.offerName,
    normalized_name: normalizedName,
    brand,
    image_url: offer.imageUrl,
    current_price: offer.price,
    original_price: offer.originalPrice,
    weight_value: weightValue,
    weight_unit: weightUnit,
    unit_price: unitPrice,
    unit_price_display: unitPriceDisplay,
    commission_rate: offer.commissionRate,
    affiliate_link: offer.offerLink,
    shop_name: offer.shopName,
    marketplace: "shopee",
  };
}
