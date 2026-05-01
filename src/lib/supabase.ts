import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Client-side Supabase client (limited permissions)
// We add a check to avoid crashing during build if env vars are missing
export const supabase = supabaseUrl 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : (null as any);

// Server-side Supabase client (full permissions)
export const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : (null as any);

export { supabaseUrl, supabaseAnonKey };
