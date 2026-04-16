-- 1. Create Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Sub-Categories Table
CREATE TABLE sub_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  series TEXT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  sub_category_id UUID NOT NULL REFERENCES sub_categories(id) ON DELETE CASCADE,
  description TEXT,
  is_top_seller BOOLEAN DEFAULT false,
  images TEXT[] DEFAULT '{}'::text[],
  base_price NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create Product Variants Table
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL, -- e.g., 'Size', 'Color'
  group_type TEXT NOT NULL DEFAULT 'standard', -- 'standard' or 'color'
  value TEXT NOT NULL, -- e.g., 'XL' or '#FFFFFF'
  price NUMERIC,
  images TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enable Row Level Security (RLS)
-- For now, allow public access for development
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update for development" ON categories FOR ALL USING (true);

CREATE POLICY "Allow public read-only access" ON sub_categories FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update for development" ON sub_categories FOR ALL USING (true);

CREATE POLICY "Allow public read-only access" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update for development" ON products FOR ALL USING (true);

CREATE POLICY "Allow public read-only access" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update for development" ON product_variants FOR ALL USING (true);

-- 6. Storage Policies (Run after creating the 'images' bucket)
-- Allow public uploads to the 'images' bucket
CREATE POLICY "Public Upload"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'images');

-- Allow public viewing of images
CREATE POLICY "Public View"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'images');
