// ============================================================
// src/lib/supabase.ts
// ============================================================
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client-side Supabase client (للمتصفح - صلاحيات محدودة)
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Server-side Supabase client (للـ API فقط - صلاحيات كاملة)
// يرمي خطأ واضح بدلاً من null as any الخطير
function createAdminClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    // في بيئة البناء (build time) يكون هذا متوقعاً
    // في بيئة الـ runtime يجب أن تكون المتغيرات موجودة
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL أو SUPABASE_SERVICE_ROLE_KEY غير موجودين في متغيرات البيئة"
      );
    }
    // في development نرجع client فارغ لتجنب crash أثناء البناء
    return createClient(
      supabaseUrl ?? "https://placeholder.supabase.co",
      supabaseServiceKey ?? "placeholder-key"
    );
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

export const supabaseAdmin = createAdminClient();

export { supabaseUrl, supabaseAnonKey };