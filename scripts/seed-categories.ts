import { createClient } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";
import WebSocket from "ws";

// Polyfill WebSocket for Node.js environment compatibility with Supabase Realtime
if (typeof global.WebSocket === "undefined") {
  (global as any).WebSocket = WebSocket;
}

// Load environment variables from .env.local
const projectDir = process.cwd();
const { combinedEnv } = loadEnvConfig(projectDir);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || combinedEnv.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || combinedEnv.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables. Make sure to setup .env.local first.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CategorySeed {
  name: string;
  slug: string;
  icon_emoji: string;
  is_featured: boolean;
  default_unit: string;
  unit_configs: {
    unit_type: string;
    display_label: string;
    normalization_factor: number;
    regex_pattern: string;
  }[];
}

const categoriesToSeed: CategorySeed[] = [
  {
    name: "Susu Formula",
    slug: "susu-formula",
    icon_emoji: "🍼",
    is_featured: true,
    default_unit: "gram",
    unit_configs: [
      {
        unit_type: "gram",
        display_label: "per 100g",
        normalization_factor: 100.0,
        // Matches e.g. "800g", "1.2kg", "400 gr", "1800 gram", "3 x 400g"
        regex_pattern: "(\\d+(?:\\.\\d+)?)\\s*(?:g|gr|gram|kg|kilogram)\\b"
      }
    ]
  },
  {
    name: "Popok Bayi",
    slug: "popok",
    icon_emoji: "👶",
    is_featured: true,
    default_unit: "pcs",
    unit_configs: [
      {
        unit_type: "pcs",
        display_label: "per pcs",
        normalization_factor: 1.0,
        // Matches e.g. "32pcs", "isi 40", "S40", "M34", "L-30", "XL26", "26 lembar", "pack of 50"
        regex_pattern: "(?:isi|x)?\\s*(\\d+)\\s*(?:pcs|pc|lembar|sheet|s\\b|m\\b|l\\b|xl\\b|xxl\b)"
      }
    ]
  },
  {
    name: "Skincare",
    slug: "skincare",
    icon_emoji: "💄",
    is_featured: true,
    default_unit: "ml",
    unit_configs: [
      {
        unit_type: "ml",
        display_label: "per ml",
        normalization_factor: 1.0,
        // Matches e.g. "50ml", "15 ml", "100g" (skincare creams), "1 liter", "250 ml"
        regex_pattern: "(\\d+(?:\\.\\d+)?)\\s*(?:ml|l|liter|gr|g|gram)\\b"
      }
    ]
  }
];

async function seed() {
  console.log("🌱 Starting database seeding for categories and unit configurations...");

  for (const cat of categoriesToSeed) {
    console.log(`\nProcessing category: ${cat.name} (${cat.slug})...`);

    // 1. Upsert Category
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .upsert(
        {
          name: cat.name,
          slug: cat.slug,
          icon_emoji: cat.icon_emoji,
          is_featured: cat.is_featured,
          default_unit: cat.default_unit
        },
        { onConflict: "slug" }
      )
      .select()
      .single();

    if (categoryError || !categoryData) {
      console.error(`❌ Error upserting category ${cat.name}:`, categoryError);
      continue;
    }

    console.log(`✅ Upserted category: ${cat.name} with ID: ${categoryData.id}`);

    // 2. Process unit configurations
    for (const config of cat.unit_configs) {
      const { data: configData, error: configError } = await supabase
        .from("category_unit_configs")
        .upsert(
          {
            category_id: categoryData.id,
            unit_type: config.unit_type,
            display_label: config.display_label,
            normalization_factor: config.normalization_factor,
            regex_pattern: config.regex_pattern
          },
          // We can match on category_id and unit_type combination (but we don't have unique constraint on it yet, so we can just delete and insert, or update if we find it)
          // Since we want to make it simple, let's delete existing configs for this category and insert them fresh
        );

      // Clean approach: delete existing first, then insert
      const { error: deleteError } = await supabase
        .from("category_unit_configs")
        .delete()
        .eq("category_id", categoryData.id);

      if (deleteError) {
        console.error(`❌ Error clearing old configs for ${cat.name}:`, deleteError);
        continue;
      }

      // Now insert configs
      const insertConfigs = cat.unit_configs.map((c) => ({
        category_id: categoryData.id,
        unit_type: c.unit_type,
        display_label: c.display_label,
        normalization_factor: c.normalization_factor,
        regex_pattern: c.regex_pattern
      }));

      const { error: insertError } = await supabase
        .from("category_unit_configs")
        .insert(insertConfigs);

      if (insertError) {
        console.error(`❌ Error inserting configs for ${cat.name}:`, insertError);
      } else {
        console.log(`✅ Seeded ${insertConfigs.length} unit configuration(s) for ${cat.name}`);
      }
    }
  }

  console.log("\n🌱 Seeding complete!");
}

seed().catch((err) => {
  console.error("❌ Seeding failed with unexpected error:", err);
  process.exit(1);
});
