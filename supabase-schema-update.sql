-- Update Schema for Russia Gateway
-- Run this in your Supabase SQL Editor!

ALTER TABLE users_applications ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE users_applications ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE users_applications ADD COLUMN IF NOT EXISTS has_saudi_residency BOOLEAN DEFAULT false;
ALTER TABLE users_applications ADD COLUMN IF NOT EXISTS residency_expiry DATE;
ALTER TABLE users_applications ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE users_applications ADD COLUMN IF NOT EXISTS notes TEXT;

-- Clear Supabase schema cache
NOTIFY pgrst, 'reload schema';

CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  about_ar TEXT NOT NULL DEFAULT '{"title":"","subtitle":"","description":"بوابة روسيا هي منصة متخصصة تهدف لتسهيل الإجراءات.","features":"","hero_image":"","about_image":""}',
  about_en TEXT NOT NULL DEFAULT '{"title":"","subtitle":"","description":"Russia Gateway is a specialized platform.","features":"","hero_image":"","about_image":""}'
);

CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_ar TEXT NOT NULL,
  desc_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  desc_en TEXT NOT NULL,
  icon TEXT DEFAULT 'Briefcase',
  sort_order INTEGER DEFAULT 0
);

DROP TABLE IF EXISTS faqs CASCADE;
CREATE TABLE faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_ar TEXT NOT NULL,
  answer_ar TEXT NOT NULL,
  question_en TEXT NOT NULL,
  answer_en TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Delete old row if it exists with bad format so we can insert the new JSON format
DELETE FROM site_settings WHERE id = 1;

INSERT INTO site_settings (id, about_ar, about_en) VALUES (
  1, 
  '{"title":"من نحن","subtitle":"شريكك الموثوق للانطلاق نحو روسيا","description":"بوابة روسيا هي منصة متخصصة تهدف لتسهيل جميع الإجراءات المتعلقة بالسفر والإقامة في روسيا.","features":"ميزة 1\nميزة 2","hero_image":"","about_image":""}', 
  '{"title":"About Us","subtitle":"Your Trusted Partner","description":"Russia Gateway is a specialized platform aimed at facilitating all procedures related to travel and residence in Russia.","features":"Feature 1\nFeature 2","hero_image":"","about_image":""}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO services (title_ar, desc_ar, title_en, desc_en, icon, sort_order) VALUES
('الدراسة في روسيا', 'قبولات جامعية في أفضل الجامعات الروسية.', 'Study in Russia', 'University admissions at the best Russian universities.', 'GraduationCap', 1),
('فرص العمل', 'نوفر فرص عمل مميزة.', 'Work Opportunities', 'We provide outstanding work opportunities.', 'Briefcase', 2)
ON CONFLICT DO NOTHING;

INSERT INTO faqs (question_ar, answer_ar, question_en, answer_en, sort_order) VALUES
('هل الشهادات الروسية معترف بها؟', 'نعم، الشهادات الروسية معترف بها دولياً وفي معظم الدول العربية.', 'Are Russian degrees recognized?', 'Yes, Russian degrees are internationally recognized.', 1),
('كم تستغرق مدة استخراج الفيزا؟', 'تستغرق عادة بين 14 إلى 30 يوماً.', 'How long does the visa take?', 'Usually takes between 14 to 30 days.', 2)
ON CONFLICT DO NOTHING;
