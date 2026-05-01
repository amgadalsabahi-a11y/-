-- ============================================
-- Russia Gateway - Supabase Schema
-- بوابة روسيا - مخطط قاعدة البيانات
-- ============================================

-- 1. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Users Applications Table
CREATE TABLE IF NOT EXISTS users_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  age INTEGER,
  country TEXT,
  nationality TEXT,
  phone TEXT,
  has_saudi_residency BOOLEAN DEFAULT false,
  residency_expiry DATE,
  file_url TEXT,
  notes TEXT,
  status TEXT DEFAULT 'جديد' CHECK (status IN ('جديد', 'تم التواصل', 'مرفوض')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_ar TEXT NOT NULL,
  answer_ar TEXT NOT NULL,
  question_en TEXT NOT NULL DEFAULT '',
  answer_en TEXT NOT NULL DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Apply trigger to applications
CREATE TRIGGER update_users_applications_updated_at
  BEFORE UPDATE ON users_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Apply trigger to faqs
CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Row Level Security (RLS)
ALTER TABLE users_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts to applications (public form)
CREATE POLICY "Allow public insert" ON users_applications
  FOR INSERT WITH CHECK (true);

-- Policy: Allow service role full access to applications
CREATE POLICY "Allow service role full access apps" ON users_applications
  FOR ALL USING (true) WITH CHECK (true);

-- Policy: Allow public read on active FAQs
CREATE POLICY "Allow public read active faqs" ON faqs
  FOR SELECT USING (is_active = true);

-- Policy: Allow service role full access to faqs
CREATE POLICY "Allow service role full access faqs" ON faqs
  FOR ALL USING (true) WITH CHECK (true);

-- Policy: Allow service role full access to admin_users
CREATE POLICY "Allow service role full access admin" ON admin_users
  FOR ALL USING (true) WITH CHECK (true);

-- 8. Storage Bucket for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('applications', 'applications', true)
ON CONFLICT DO NOTHING;

-- Policy: Allow public uploads to applications bucket
CREATE POLICY "Allow public upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'applications');

-- Policy: Allow public read from applications bucket
CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'applications');

-- 9. Seed default FAQs
INSERT INTO faqs (question_ar, answer_ar, question_en, answer_en, sort_order) VALUES
('ما هي الخدمات التي تقدمونها؟', 'نقدم خدمات شاملة تشمل الدراسة في روسيا، فرص العمل، السياحة، وتأسيس الأعمال التجارية. نساعدك في كل خطوة من التقديم حتى الوصول.', 'What services do you offer?', 'We offer comprehensive services including studying in Russia, work opportunities, tourism, and business establishment. We help you every step from application to arrival.', 1),
('كم تستغرق عملية التقديم؟', 'تختلف المدة حسب نوع الخدمة. عادةً ما تستغرق طلبات الدراسة من 2-4 أسابيع، بينما تأشيرات السياحة تستغرق من 5-10 أيام عمل.', 'How long does the application process take?', 'Duration varies by service type. Study applications typically take 2-4 weeks, while tourist visas take 5-10 business days.', 2),
('هل تقدمون خدمات للمقيمين في السعودية؟', 'نعم، نقدم خدمات متخصصة للمقيمين في المملكة العربية السعودية بما في ذلك المساعدة في إجراءات السفر والتأشيرات.', 'Do you provide services for Saudi residents?', 'Yes, we provide specialized services for residents in Saudi Arabia including travel and visa procedure assistance.', 3),
('ما هي تكلفة الخدمات؟', 'تختلف التكاليف حسب نوع الخدمة المطلوبة. نقدم استشارة مجانية أولية لتحديد احتياجاتك وتقديم عرض سعر مناسب.', 'What are the service costs?', 'Costs vary depending on the service type. We offer a free initial consultation to determine your needs and provide an appropriate quote.', 4),
('هل يمكنني التقديم أونلاين؟', 'بالتأكيد! يمكنك التسجيل من خلال موقعنا الإلكتروني وسيقوم فريقنا بالتواصل معك خلال 24 ساعة.', 'Can I apply online?', 'Absolutely! You can register through our website and our team will contact you within 24 hours.', 5);

-- 10. Seed default admin (password: Admin@Russia2024)
-- Note: In production, use proper bcrypt hashing
INSERT INTO admin_users (email, password_hash, name) VALUES
('admin@russia-gateway.com', 'Admin@Russia2024', 'مدير النظام')
ON CONFLICT DO NOTHING;
