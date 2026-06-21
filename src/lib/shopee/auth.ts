import crypto from "crypto";

interface ShopeeAuthHeader {
  Authorization: string;
}

/**
 * Generates the HMAC-SHA256 authorization header for Shopee Affiliate Open API.
 * 
 * Signature format:
 * HMAC-SHA256(SecretKey, AppID + Timestamp + Payload)
 * 
 * Header format:
 * SHA256 AppID=appId, Signature=signature, Timestamp=timestamp
 * 
 * @param payload The request body (stringified JSON)
 * @returns Object containing the Authorization header
 */
export function generateShopeeAuthHeader(payload: string): ShopeeAuthHeader {
  const appId = process.env.SHOPEE_APP_ID;
  const secretKey = process.env.SHOPEE_SECRET_KEY;

  if (!appId || !secretKey) {
    throw new Error(
      "Missing Shopee Affiliate Open API credentials. Please set SHOPEE_APP_ID and SHOPEE_SECRET_KEY."
    );
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  
  // Signature base string: AppID + Timestamp + Payload
  const baseString = appId + timestamp + payload;

  // Generate HMAC-SHA256 signature
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(baseString)
    .digest("hex");

  return {
    Authorization: `SHA256 AppID=${appId}, Signature=${signature}, Timestamp=${timestamp}`,
  };
}
