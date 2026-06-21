"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { generateInvolveDeeplink, detectMarketplace } from "@/lib/involve/api";
import { extractQuantity, extractBrand } from "@/lib/unit-price/extractor";
import { normalizeToBaseUnit } from "@/lib/unit-price/normalizer";
import { calculateUnitPrice, formatUnitPriceDisplay } from "@/lib/unit-price/calculator";
import { cleanProductTitle } from "@/lib/shopee/transform";

export interface ActionResponse {
  success: boolean;
  message: string;
}

/**
 * Server Action to insert or update a product in the database.
 * Includes Involve Asia deeplink generation and automatic unit price calculations.
 */
export async function saveProductAction(
  formData: FormData,
  adminPasswordInput: string
): Promise<ActionResponse> {
  const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";

  // 1. Authenticate admin
  if (adminPasswordInput !== expectedPassword) {
    return { success: false, message: "Password admin salah!" };
  }

  // 2. Extract values from form
  const name = formData.get("name") as string;
  const rawPrice = formData.get("price") as string;
  const productUrl = formData.get("productUrl") as string;
  const categorySlug = formData.get("categorySlug") as string;
  const customBrand = formData.get("brand") as string;
  const customImageUrl = formData.get("imageUrl") as string;
  const shopNameInput = formData.get("shopName") as string;

  if (!name || !rawPrice || !productUrl || !categorySlug) {
    return { success: false, message: "Harap isi semua kolom wajib!" };
  }

  const price = parseFloat(rawPrice);
  if (isNaN(price) || price <= 0) {
    return { success: false, message: "Harga produk tidak valid!" };
  }

  const marketplace = detectMarketplace(productUrl);
  if (!marketplace) {
    return {
      success: false,
      message: "Tautan tidak valid! Hanya mendukung Shopee, Tokopedia, dan Lazada.",
    };
  }

  try {
    const supabase = createAdminClient();

    // 3. Resolve category ID and fetch its unit configuration
    const { data: category, error: catError } = await supabase
      .from("categories")
      .select("*, category_unit_configs(*)")
      .eq("slug", categorySlug)
      .single();

    if (catError || !category) {
      return { success: false, message: "Kategori tidak ditemukan di database!" };
    }

    // 4. Generate Involve Asia Affiliate Link
    console.log(`Generating deeplink for URL: ${productUrl}`);
    const affiliateLink = await generateInvolveDeeplink(productUrl);

    // 5. Automatic calculations
    const cleanTitle = cleanProductTitle(name);
    const brand = customBrand.trim() || extractBrand(name);
    const shopName = shopNameInput.trim() || `${brand} Official Store`;
    
    // Get regex configurations from DB if available
    const regexPatterns = category.category_unit_configs?.map((c: any) => c.regex_pattern) || [];
    const qty = extractQuantity(name, regexPatterns);

    let weightValue: number | null = null;
    let weightUnit: string | null = null;
    let unitPrice: number | null = null;
    let unitPriceDisplay: string | null = null;

    if (qty) {
      weightValue = qty.value;
      weightUnit = qty.unit;

      const { normalizedValue } = normalizeToBaseUnit(qty.value, qty.unit);
      unitPrice = calculateUnitPrice(price, normalizedValue);

      const config = category.category_unit_configs?.[0];
      if (config) {
        unitPriceDisplay = formatUnitPriceDisplay(
          unitPrice,
          Number(config.normalization_factor),
          config.display_label
        );
      } else {
        unitPriceDisplay = `Rp ${unitPrice.toFixed(0)} / ${weightUnit}`;
      }
    }

    // Default image if none provided
    const imageUrl = customImageUrl.trim() || "https://picsum.photos/seed/placeholder/300/300";

    // Generate random mock item/shop IDs since we are manual
    const mockItemId = BigInt(Math.floor(100000 + Math.random() * 900000));
    const mockShopId = BigInt(Math.floor(200000 + Math.random() * 800000));

    // 6. Save to Supabase
    const { error: insertError } = await supabase.from("products").insert({
      shopee_item_id: mockItemId,
      shopee_shop_id: mockShopId,
      category_id: category.id,
      name,
      normalized_name: cleanTitle,
      brand,
      image_url: imageUrl,
      current_price: price,
      weight_value: weightValue,
      weight_unit: weightUnit,
      unit_price: unitPrice,
      unit_price_display: unitPriceDisplay,
      affiliate_link: affiliateLink,
      shop_name: shopName,
      marketplace,
      rank_in_category: 1, // Default, will be recalculated
    });

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return { success: false, message: `Gagal menyimpan ke database: ${insertError.message}` };
    }

    // 7. Recalculate ranks in this category
    await recalculateCategoryRanks(category.id);

    return { success: true, message: `Sukses menyimpan produk "${cleanTitle}"!` };
  } catch (error: any) {
    console.error("Action error:", error);
    return { success: false, message: `Error tidak terduga: ${error.message || error}` };
  }
}

/**
 * Recalculates and updates the ranks of products inside a specific category based on unit price.
 */
async function recalculateCategoryRanks(categoryId: string) {
  const supabase = createAdminClient();

  // Get all products in category that have valid unit price, sorted by unit price ascending (cheapest first)
  const { data: products } = await supabase
    .from("products")
    .select("id, unit_price")
    .eq("category_id", categoryId)
    .filter("unit_price", "gt", 0)
    .order("unit_price", { ascending: true });

  if (!products || products.length === 0) return;

  // Update ranks sequentially
  for (let i = 0; i < products.length; i++) {
    await supabase
      .from("products")
      .update({ rank_in_category: i + 1 })
      .eq("id", products[i].id);
  }
}
