/**
 * Normalizes different units of measurement to standard base units.
 * 
 * Target base units:
 * - Weight -> 'gram'
 * - Volume -> 'ml'
 * - Count  -> 'pcs'
 * 
 * @param value The raw numeric value (e.g., 1.8)
 * @param unit The raw unit string (e.g., 'kg')
 * @returns Object with the normalized value and the base unit
 */
export function normalizeToBaseUnit(
  value: number,
  unit: string
): { normalizedValue: number; baseUnit: string } {
  const cleanUnit = unit.toLowerCase().trim();

  // 1. Weight normalization
  if (cleanUnit === "kg" || cleanUnit === "kilogram") {
    return { normalizedValue: value * 1000, baseUnit: "gram" };
  }
  if (cleanUnit === "g" || cleanUnit === "gr" || cleanUnit === "gram") {
    return { normalizedValue: value, baseUnit: "gram" };
  }

  // 2. Volume normalization
  if (cleanUnit === "l" || cleanUnit === "liter") {
    return { normalizedValue: value * 1000, baseUnit: "ml" };
  }
  if (cleanUnit === "ml") {
    return { normalizedValue: value, baseUnit: "ml" };
  }

  // 3. Count/Pieces normalization
  if (
    cleanUnit === "pcs" ||
    cleanUnit === "pc" ||
    cleanUnit === "lembar" ||
    cleanUnit === "sheet" ||
    cleanUnit === "sachet" ||
    cleanUnit === "sct"
  ) {
    return { normalizedValue: value, baseUnit: "pcs" };
  }

  // Fallback
  return { normalizedValue: value, baseUnit: cleanUnit || "unit" };
}

/**
 * Formats a currency value to Indonesian Rupiah (IDR).
 * e.g., 94500 -> "Rp 94.500"
 */
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/\s+/g, " "); // normalize spaces
}
