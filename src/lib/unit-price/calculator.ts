import { formatRupiah } from "./normalizer";

/**
 * Calculates unit price per base unit (e.g., price per 1 gram/ml/pcs).
 * 
 * @param price Total product price
 * @param normalizedValue Total quantity in base unit
 * @returns Unit price per 1 base unit
 */
export function calculateUnitPrice(price: number, normalizedValue: number): number {
  if (normalizedValue <= 0) return 0;
  return price / normalizedValue;
}

/**
 * Formats unit price for display based on category configuration.
 * e.g., unitPrice = 105, factor = 100, label = "per 100g" -> "Rp 10.500 / 100g"
 * 
 * @param unitPrice Unit price per 1 base unit
 * @param normalizationFactor Factor to multiply unitPrice for display (e.g., 100 for per 100g)
 * @param displayLabel Display suffix (e.g., "100g", "ml", "pcs")
 * @returns Formatted unit price string
 */
export function formatUnitPriceDisplay(
  unitPrice: number,
  normalizationFactor: number,
  displayLabel: string
): string {
  if (unitPrice <= 0) return "-";
  const displayPrice = unitPrice * normalizationFactor;
  
  // Format numeric value nicely, keep 1 decimal if not a whole number for micro-prices
  const formattedPrice = formatRupiah(displayPrice);
  return `${formattedPrice} / ${displayLabel.replace(/^per\s+/, "")}`;
}

export type PriceBand = "hemat" | "sedang" | "mahal";

/**
 * Assigns price bands (hemat, sedang, mahal) to a list of products in the same category.
 * Uses tertiles (dividing the sorted range into 3 equal parts) for the classification.
 * 
 * @param items List of items with unitPrice
 * @returns Map of item IDs to their price bands
 */
export function classifyPriceBands<T extends { id: string; unit_price?: number }>(
  items: T[]
): Record<string, PriceBand> {
  const result: Record<string, PriceBand> = {};
  if (items.length === 0) return result;

  // Filter out items without a valid unit price
  const validItems = items
    .filter((item) => item.unit_price !== undefined && item.unit_price > 0)
    .sort((a, b) => (a.unit_price || 0) - (b.unit_price || 0));

  if (validItems.length === 0) {
    // If no items have valid unit prices, default all to sedang
    items.forEach((item) => {
      result[item.id] = "sedang";
    });
    return result;
  }

  const count = validItems.length;

  // Tertile indices
  const tertile1Idx = Math.floor(count / 3);
  const tertile2Idx = Math.floor((count * 2) / 3);

  // Get threshold values
  const threshold1 = validItems[tertile1Idx]?.unit_price || 0;
  const threshold2 = validItems[tertile2Idx]?.unit_price || 0;

  items.forEach((item) => {
    const price = item.unit_price || 0;
    if (price <= 0) {
      result[item.id] = "sedang";
      return;
    }

    if (price <= threshold1) {
      result[item.id] = "hemat";
    } else if (price <= threshold2) {
      result[item.id] = "sedang";
    } else {
      result[item.id] = "mahal";
    }
  });

  return result;
}
