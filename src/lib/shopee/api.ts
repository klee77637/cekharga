import { generateShopeeAuthHeader } from "./auth";

const SHOPEE_API_URL = "https://open.shopee.com/api/v2";

export interface ShopeeProductOffer {
  itemId: bigint;
  shopId: bigint;
  offerName: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  offerLink: string;
  commissionRate: number;
  commission: number;
  shopName: string;
  categoryId: number;
}

export interface SearchOffersResponse {
  list: ShopeeProductOffer[];
  total: number;
}

const SEARCH_OFFERS_QUERY = `
  query searchOffers($keyword: String, $page: Int, $limit: Int, $categoryId: Int) {
    shopeeOfferV2(keyword: $keyword, page: $page, limit: $limit, categoryId: $categoryId) {
      list {
        imageUrl
        offerName
        offerLink
        price
        originalPrice
        commissionRate
        commission
        shopName
        itemId
        shopId
        categoryId
      }
      total
    }
  }
`;

/**
 * Sends a signed request to the Shopee Affiliate Open API (GraphQL).
 */
async function makeShopeeRequest<T>(query: string, variables: Record<string, any>): Promise<T> {
  const body = JSON.stringify({ query, variables });
  
  try {
    const headers = {
      "Content-Type": "application/json",
      ...generateShopeeAuthHeader(body),
    };

    const response = await fetch(SHOPEE_API_URL, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      throw new Error(`Shopee API responded with status ${response.status}`);
    }

    const json = await response.json();
    if (json.errors && json.errors.length > 0) {
      throw new Error(`GraphQL error: ${json.errors[0].message}`);
    }

    return json.data as T;
  } catch (error) {
    console.warn("⚠️ Shopee API request failed, checking for mock fallback...", error);
    
    // If credentials are not set, fallback to mock data
    if (!process.env.SHOPEE_APP_ID || !process.env.SHOPEE_SECRET_KEY) {
      console.log("ℹ️ Using mock Shopee data because API credentials are not set.");
      return getMockData(variables) as T;
    }
    
    throw error;
  }
}

/**
 * Searches for product offers on the Shopee Affiliate program.
 */
export async function searchShopeeOffers(params: {
  keyword?: string;
  page?: number;
  limit?: number;
  categoryId?: number;
}): Promise<SearchOffersResponse> {
  const variables = {
    keyword: params.keyword || "",
    page: params.page || 1,
    limit: params.limit || 20,
    categoryId: params.categoryId,
  };

  try {
    const data = await makeShopeeRequest<any>(SEARCH_OFFERS_QUERY, variables);
    return data.shopeeOfferV2 as SearchOffersResponse;
  } catch (error) {
    console.error("Failed to fetch offers from Shopee API:", error);
    return { list: [], total: 0 };
  }
}

/**
 * Generates realistic mock data for development when API keys are not provided.
 */
function getMockData(variables: Record<string, any>): any {
  const keyword = (variables.keyword || "").toLowerCase();
  const page = variables.page || 1;
  const limit = variables.limit || 20;

  // Mock products list
  const mockDatabase: ShopeeProductOffer[] = [
    // Susu Formula
    {
      itemId: BigInt(11101),
      shopId: BigInt(20001),
      offerName: "SGM Eksplor 1+ Madu Susu Formula 900g / 900 gram",
      price: 94500,
      originalPrice: 105000,
      imageUrl: "https://picsum.photos/seed/sgm1madu/300/300",
      offerLink: "https://shope.ee/mock-sgm-900g",
      commissionRate: 0.07,
      commission: 6615,
      shopName: "SGM Official Store",
      categoryId: 1, // Susu Formula ID
    },
    {
      itemId: BigInt(11102),
      shopId: BigInt(20001),
      offerName: "SGM Eksplor 1+ Vanila Susu Formula 400g",
      price: 45000,
      originalPrice: 50000,
      imageUrl: "https://picsum.photos/seed/sgm1vanila/300/300",
      offerLink: "https://shope.ee/mock-sgm-400g",
      commissionRate: 0.07,
      commission: 3150,
      shopName: "SGM Official Store",
      categoryId: 1,
    },
    {
      itemId: BigInt(11103),
      shopId: BigInt(20002),
      offerName: "Bebelac 3 Madu Susu Formula Anak 1-3 Tahun 1.8kg (1800g)",
      price: 289000,
      originalPrice: 315000,
      imageUrl: "https://picsum.photos/seed/bebelac3/300/300",
      offerLink: "https://shope.ee/mock-bebelac-1800g",
      commissionRate: 0.06,
      commission: 17340,
      shopName: "Nutricia Official Store",
      categoryId: 1,
    },
    {
      itemId: BigInt(11104),
      shopId: BigInt(20002),
      offerName: "Bebelac 3 Vanila Susu Formula 800 gram",
      price: 145000,
      originalPrice: 155000,
      imageUrl: "https://picsum.photos/seed/bebelac3vanila/300/300",
      offerLink: "https://shope.ee/mock-bebelac-800g",
      commissionRate: 0.06,
      commission: 8700,
      shopName: "Nutricia Official Store",
      categoryId: 1,
    },
    
    // Popok
    {
      itemId: BigInt(11201),
      shopId: BigInt(20003),
      offerName: "MamyPoko Pants Royal Soft Size M 64 pcs / lembar",
      price: 156000,
      originalPrice: 180000,
      imageUrl: "https://picsum.photos/seed/mamypokom64/300/300",
      offerLink: "https://shope.ee/mock-mamypoko-m64",
      commissionRate: 0.05,
      commission: 7800,
      shopName: "MamyPoko Official Shop",
      categoryId: 2, // Popok ID
    },
    {
      itemId: BigInt(11202),
      shopId: BigInt(20003),
      offerName: "MamyPoko Pants Standar Tipe Celana Size L 30 lembar",
      price: 65000,
      originalPrice: 72000,
      imageUrl: "https://picsum.photos/seed/mamypokol30/300/300",
      offerLink: "https://shope.ee/mock-mamypoko-l30",
      commissionRate: 0.05,
      commission: 3250,
      shopName: "MamyPoko Official Shop",
      categoryId: 2,
    },
    {
      itemId: BigInt(11203),
      shopId: BigInt(20004),
      offerName: "Sweety Bronze Pants M34 Tipe Celana isi 34 pcs",
      price: 52000,
      originalPrice: 58000,
      imageUrl: "https://picsum.photos/seed/sweety-m34/300/300",
      offerLink: "https://shope.ee/mock-sweety-m34",
      commissionRate: 0.05,
      commission: 2600,
      shopName: "Sweety Official Store",
      categoryId: 2,
    },

    // Skincare
    {
      itemId: BigInt(11301),
      shopId: BigInt(20005),
      offerName: "COSRX Low pH Good Morning Gel Cleanser 150ml",
      price: 99000,
      originalPrice: 149000,
      imageUrl: "https://picsum.photos/seed/cosrx150ml/300/300",
      offerLink: "https://shope.ee/mock-cosrx-150ml",
      commissionRate: 0.10,
      commission: 9900,
      shopName: "COSRX Indonesia Official",
      categoryId: 3, // Skincare ID
    },
    {
      itemId: BigInt(11302),
      shopId: BigInt(20005),
      offerName: "COSRX Advanced Snail 96 Mucin Power Essence 100ml",
      price: 165000,
      originalPrice: 220000,
      imageUrl: "https://picsum.photos/seed/cosrx100ml/300/300",
      offerLink: "https://shope.ee/mock-cosrx-100ml",
      commissionRate: 0.10,
      commission: 16500,
      shopName: "COSRX Indonesia Official",
      categoryId: 3,
    },
    {
      itemId: BigInt(11303),
      shopId: BigInt(20006),
      offerName: "Skintific 5X Ceramide Barrier Moisture Gel 50g",
      price: 139000,
      originalPrice: 169000,
      imageUrl: "https://picsum.photos/seed/skintific50g/300/300",
      offerLink: "https://shope.ee/mock-skintific-50g",
      commissionRate: 0.12,
      commission: 16680,
      shopName: "Skintific Official Store",
      categoryId: 3,
    }
  ];

  // Filter based on keyword
  let filtered = mockDatabase;
  if (keyword) {
    filtered = mockDatabase.filter(
      (item) =>
        item.offerName.toLowerCase().includes(keyword) ||
        item.shopName.toLowerCase().includes(keyword)
    );
  }

  // Filter by categoryId if provided (Note: mock IDs: 1 for susu, 2 for popok, 3 for skincare)
  if (variables.categoryId) {
    filtered = filtered.filter((item) => item.categoryId === variables.categoryId);
  }

  // Paginate
  const start = (page - 1) * limit;
  const list = filtered.slice(start, start + limit);

  return {
    shopeeOfferV2: {
      list,
      total: filtered.length,
    },
  };
}
