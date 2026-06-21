interface ExtractedQuantity {
  value: number;
  unit: string;
  isMultiPack: boolean;
  multiplier: number;
  baseValue: number;
}

/**
 * Extracts volume, weight, or count from a product title.
 * Handles single packages (e.g. "900g", "150ml") and multipacks (e.g. "3x400g", "3 x 400 gram").
 * Normalizes Indonesian decimal commas to dots (e.g., "1,8 kg" -> "1.8 kg").
 * 
 * @param title Product title
 * @param categoryPatterns Optional array of regex patterns to test first
 * @returns ExtractedQuantity object or null if extraction fails
 */
export function extractQuantity(
  title: string,
  categoryPatterns?: string[]
): ExtractedQuantity | null {
  // Normalize title: lowercase, replace commas with dots between digits (e.g. "1,8" -> "1.8")
  let normalizedTitle = title.toLowerCase().replace(/(\d+),(\d+)/g, "$1.$2");

  // Helper to parse matched numbers safely
  const parseNum = (str: string): number => {
    const parsed = parseFloat(str);
    return isNaN(parsed) ? 0 : parsed;
  };

  // 1. Try multipack pattern first: e.g. "3x400g", "3 x 400 gram", "isi 3 box x 400g"
  // Match format: [multiplier] x [value] [unit]
  const multiPackRegex = /(\d+)\s*(?:box|pack|pcs|btg)?\s*x\s*(\d+(?:\.\d+)?)\s*(g|gr|gram|kg|ml|l|liter|pcs|pc|lembar|sheet|sachet|sct)\b/;
  const multiMatch = normalizedTitle.match(multiPackRegex);

  if (multiMatch) {
    const multiplier = parseInt(multiMatch[1], 10);
    const baseValue = parseNum(multiMatch[2]);
    const unit = multiMatch[3];
    
    if (multiplier > 0 && baseValue > 0) {
      return {
        value: multiplier * baseValue,
        unit,
        isMultiPack: true,
        multiplier,
        baseValue,
      };
    }
  }

  // 2. Try matching custom category patterns if provided
  if (categoryPatterns && categoryPatterns.length > 0) {
    for (const patternStr of categoryPatterns) {
      try {
        const regex = new RegExp(patternStr, "i");
        const match = normalizedTitle.match(regex);
        if (match && match[1]) {
          const value = parseNum(match[1]);
          const unit = match[2] || detectUnitFromMatch(match[0]) || "";
          
          if (value > 0) {
            return {
              value,
              unit,
              isMultiPack: false,
              multiplier: 1,
              baseValue: value,
            };
          }
        }
      } catch (err) {
        console.error("Invalid regex pattern in category config:", patternStr, err);
      }
    }
  }

  // 3. Fallback to general patterns for weight/volume
  // Matches "900g", "1.8 kg", "150 ml", "1 liter", "60 pcs", etc.
  const generalRegex = /(\d+(?:\.\d+)?)\s*(g|gr|gram|kg|kilogram|ml|l|liter|pcs|pc|lembar|sheet|sachet|sct)\b/;
  const generalMatch = normalizedTitle.match(generalRegex);

  if (generalMatch) {
    const value = parseNum(generalMatch[1]);
    const unit = generalMatch[2];

    if (value > 0) {
      return {
        value,
        unit,
        isMultiPack: false,
        multiplier: 1,
        baseValue: value,
      };
    }
  }

  // 4. Try matching popok size + quantity pattern (specific to diapers)
  // e.g. "m34", "l 30", "xl-26", "m-34", "s50"
  const diaperSizeQtyRegex = /\b(?:s|m|l|xl|xxl)\s*[-/]?\s*(\d+)\b/;
  const diaperMatch = normalizedTitle.match(diaperSizeQtyRegex);
  
  // Ensure it's not a year or other common number
  if (diaperMatch && diaperMatch[1]) {
    const value = parseInt(diaperMatch[1], 10);
    if (value > 5 && value < 150) { // realistic range for diaper counts
      return {
        value,
        unit: "pcs",
        isMultiPack: false,
        multiplier: 1,
        baseValue: value,
      };
    }
  }

  // 5. Try matching general "isi [number]" or "pack of [number]" at the end
  const countRegex = /\b(?:isi|pack of|qty)\s*(\d+)\b/;
  const countMatch = normalizedTitle.match(countRegex);
  if (countMatch && countMatch[1]) {
    const value = parseInt(countMatch[1], 10);
    if (value > 0) {
      return {
        value,
        unit: "pcs",
        isMultiPack: false,
        multiplier: 1,
        baseValue: value,
      };
    }
  }

  return null;
}

/**
 * Heuristic to detect unit type from a string match if not explicitly captured.
 */
function detectUnitFromMatch(match: string): string {
  const lowercase = match.toLowerCase();
  if (lowercase.includes("kg") || lowercase.includes("kilogram")) return "kg";
  if (lowercase.includes("ml")) return "ml";
  if (lowercase.includes("l") || lowercase.includes("liter")) return "l";
  if (lowercase.includes("g") || lowercase.includes("gr") || lowercase.includes("gram")) return "g";
  if (lowercase.includes("pcs") || lowercase.includes("pc") || lowercase.includes("lembar") || lowercase.includes("sheet")) return "pcs";
  return "";
}

/**
 * Extracts brand name from a product title using simple heuristic.
 * Typically the first word, or first two words if the first is common.
 */
export function extractBrand(title: string): string {
  const words = title.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return "Tanpa Merek";

  const firstWord = words[0].toLowerCase();
  const commonWords = ["susu", "popok", "diapers", "promo", "murah", "original", "bpom", "ready", "jual"];
  
  if (commonWords.includes(firstWord) && words.length > 1) {
    return words[1];
  }
  
  return words[0];
}
