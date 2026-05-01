import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value.length > 0) {
    env[key.trim()] = value.join('=').trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']!;
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY']!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log("Testing insert...");
  const { data, error } = await supabase.from('users_applications').insert({
    full_name: 'Test Name',
    age: 25,
    country: 'Egypt',
    nationality: 'Egypt',
    phone: '+20123456789',
    has_saudi_residency: false,
    residency_expiry: null,
    status: 'جديد'
  }).select();

  if (error) {
    console.error("Insert failed:", error);
  } else {
    console.log("Insert success:", data);
  }
}

testInsert();
