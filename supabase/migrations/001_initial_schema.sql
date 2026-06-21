-- 🏗️ Initial DB Schema Migration for CekHarga
-- Create date: 2026-06-21

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon_emoji TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    default_unit TEXT NOT NULL, -- e.g., 'gram', 'ml', 'pcs'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. category_unit_configs Table
CREATE TABLE category_unit_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
    unit_type TEXT NOT NULL, -- e.g., 'gram', 'ml', 'pcs', 'sheet'
    display_label TEXT NOT NULL, -- e.g., 'per 100g', 'per ml', 'per pcs'
    normalization_factor NUMERIC NOT NULL DEFAULT 1.0, -- e.g., 100.0 (for price per 100g)
    regex_pattern TEXT NOT NULL, -- regex to extract weight/volume from name
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shopee_item_id BIGINT NOT NULL,
    shopee_shop_id BIGINT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    normalized_name TEXT,
    brand TEXT,
    image_url TEXT,
    current_price NUMERIC NOT NULL,
    original_price NUMERIC,
    weight_value NUMERIC,
    weight_unit TEXT,
    unit_price NUMERIC, -- normalized price per base unit (e.g. per 1 gram)
    unit_price_display TEXT, -- formatted display price (e.g., 'Rp 150 / gram')
    commission_rate NUMERIC,
    affiliate_link TEXT,
    shop_name TEXT,
    marketplace TEXT DEFAULT 'shopee' NOT NULL,
    rank_in_category INTEGER,
    price_updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (shopee_item_id, shopee_shop_id, marketplace)
);

-- 4. product_variants Table
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    variant_name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    weight_value NUMERIC,
    weight_unit TEXT,
    unit_price NUMERIC,
    affiliate_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. price_history Table
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    price NUMERIC NOT NULL,
    unit_price NUMERIC,
    recorded_date DATE DEFAULT CURRENT_DATE NOT NULL,
    UNIQUE (product_id, recorded_date)
);

-- 6. users Table
CREATE TABLE users (
    id UUID PRIMARY KEY, -- Maps directly to auth.users.id
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    auth_provider TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. favorites Table
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, product_id)
);

-- 8. search_history Table
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- nullable for anonymous searches
    query TEXT NOT NULL,
    category_slug TEXT,
    results_count INTEGER,
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. search_analytics Table
CREATE TABLE search_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    category_slug TEXT,
    search_count INTEGER DEFAULT 1,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    UNIQUE (query, category_slug, date)
);

-- 🚀 Indexes for Performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_current_price ON products(current_price);
CREATE INDEX idx_products_unit_price ON products(unit_price);
CREATE INDEX idx_products_rank ON products(rank_in_category);
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_price_history_product_date ON price_history(product_id, recorded_date);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_search_history_user ON search_history(user_id);
CREATE INDEX idx_search_analytics_query ON search_analytics(query, date);

-- 🔒 Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_unit_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;

-- 🛡️ RLS Policies

-- Public Read Tables
CREATE POLICY "Allow public read on categories" ON categories 
    FOR SELECT USING (true);

CREATE POLICY "Allow public read on category_unit_configs" ON category_unit_configs 
    FOR SELECT USING (true);

CREATE POLICY "Allow public read on products" ON products 
    FOR SELECT USING (true);

CREATE POLICY "Allow public read on product_variants" ON product_variants 
    FOR SELECT USING (true);

CREATE POLICY "Allow public read on price_history" ON price_history 
    FOR SELECT USING (true);

CREATE POLICY "Allow public read on search_analytics" ON search_analytics 
    FOR SELECT USING (true);

-- Authenticated Users & Profile Management
CREATE POLICY "Allow user to select own profile" ON users 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow user to insert own profile" ON users 
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow user to update own profile" ON users 
    FOR UPDATE USING (auth.uid() = id);

-- Favorites Policies
CREATE POLICY "Allow user to select own favorites" ON favorites 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow user to insert own favorites" ON favorites 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow user to delete own favorites" ON favorites 
    FOR DELETE USING (auth.uid() = user_id);

-- Search History Policies
CREATE POLICY "Allow user to select own search history" ON search_history 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow anyone to insert search history" ON search_history 
    FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Analytics & Cron Ops (Service role bypasses RLS naturally, so we only need to secure clients)
CREATE POLICY "Allow anyone to insert/update search analytics" ON search_analytics 
    FOR INSERT WITH CHECK (true);
