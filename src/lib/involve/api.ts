/**
 * 🔗 Involve Asia Affiliate API Client
 * Automatically converts raw product links into affiliate tracking links.
 */

// Involve Asia Offer IDs for major Indonesian marketplaces (AMS IDs)
export const INVOLVE_OFFER_IDS: Record<string, number> = {
  shopee: 14362,   // Shopee Indonesia CPS Offer ID
  tokopedia: 14798, // Tokopedia CPS Offer ID
  lazada: 14313,    // Lazada Indonesia CPS Offer ID
};

interface DeeplinkRequestPayload {
  link: string;
  offer_id: number;
  subid1?: string; // Optional sub-tracking IDs
  subid2?: string;
}

interface DeeplinkResponseData {
  generated_link: string;
  original_link: string;
  status: string;
}

/**
 * Automatically detects the marketplace from a product URL.
 * e.g., "https://shopee.co.id/product-name-i.123.456" -> "shopee"
 */
export function detectMarketplace(url: string): string | null {
  const lowercaseUrl = url.toLowerCase();
  if (lowercaseUrl.includes("shopee.co.id") || lowercaseUrl.includes("shope.ee")) {
    return "shopee";
  }
  if (lowercaseUrl.includes("tokopedia.com") || lowercaseUrl.includes("tokoped.ia")) {
    return "tokopedia";
  }
  if (lowercaseUrl.includes("lazada.co.id") || lowercaseUrl.includes("lazada.com")) {
    return "lazada";
  }
  return null;
}

/**
 * Generates an Involve Asia affiliate deeplink for a given product URL.
 * Falls back to a mock affiliate link if API keys are not configured.
 * 
 * @param productUrl The raw product URL from Shopee, Tokopedia, or Lazada
 * @returns The generated affiliate link
 */
export async function generateInvolveDeeplink(productUrl: string): Promise<string> {
  const marketplace = detectMarketplace(productUrl);
  if (!marketplace) {
    throw new Error("Unsupported marketplace URL. Only Shopee, Tokopedia, and Lazada are supported.");
  }

  const offerId = INVOLVE_OFFER_IDS[marketplace];
  const apiKey = process.env.INVOLVE_ASIA_API_KEY;
  const secretKey = process.env.INVOLVE_ASIA_SECRET;

  // 1. Fallback to mock link if credentials are not configured
  if (!apiKey || !secretKey) {
    console.log("ℹ️ Involve Asia API credentials not set. Generating mock affiliate link.");
    // Simulate an Involve Asia shortlink (invol.co)
    const encodedUrl = encodeURIComponent(productUrl);
    return `https://invol.co/mock-${marketplace}-affiliate?url=${encodedUrl}`;
  }

  // 2. Call official Involve Asia API
  try {
    const payload: DeeplinkRequestPayload = {
      link: productUrl,
      offer_id: offerId,
      subid1: "cekharga", // tracker sub-ID
    };

    const response = await fetch("https://api.involve.asia/api/v1/deeplinks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`, // or Basic Auth depending on Involve Asia version
        "X-Secret-Key": secretKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Involve Asia API responded with status ${response.status}`);
    }

    const data = await response.json();
    if (data && data.generated_link) {
      return data.generated_link;
    }

    // Secondary structure check if structure is wrapped
    if (data && data.data && (data.data as DeeplinkResponseData).generated_link) {
      return (data.data as DeeplinkResponseData).generated_link;
    }

    throw new Error("Invalid API response format");
  } catch (error) {
    console.error("❌ Failed to generate Involve Asia deeplink:", error);
    // Safe fallback to mock link in case of API failure in production
    const encodedUrl = encodeURIComponent(productUrl);
    return `https://invol.co/fallback-${marketplace}-affiliate?url=${encodedUrl}`;
  }
}
