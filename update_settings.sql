-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON site_settings FOR SELECT USING (true);

-- Allow all access for development (you might want to restrict this later to authenticated users only)
CREATE POLICY "Allow all access for development" ON site_settings FOR ALL USING (true);

-- Seed initial home page settings
INSERT INTO site_settings (key, value) VALUES
('homepage_collage_image', '"https://owyphcjcrtczrvqtuziz.supabase.co/storage/v1/object/public/images/site/1777456479_web_collage.png"'),
('homepage_story_title', '"Our Story"'),
('homepage_story_description', '"OnlyBrass was born from a passion for timeless craftsmanship. We believe that hardware is the jewelry of the home—the final, defining touch that turns a house into a sanctuary of style. Every piece in our collection is a testament to the enduring beauty of solid brass, hand-finished to perfection for those who appreciate the finer details of living."'),
('homepage_story_image', '"https://owyphcjcrtczrvqtuziz.supabase.co/storage/v1/object/public/images/site/1777456483_story_image.png"'),
('homepage_mailing_title', '"Contact Us"'),
('homepage_mailing_description', '"Have a question or looking for a bespoke consultation? We''d love to hear from you."'),
('contact_email', '"hello@onlybrass.com"'),
('mailing_address', '"123 Brass Avenue, Design District, New Delhi, India 110001"')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
