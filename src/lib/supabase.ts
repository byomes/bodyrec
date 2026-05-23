import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('[bodyrec] Supabase URL:', supabaseUrl ?? '(missing)');
console.log('[bodyrec] Supabase key:', supabaseAnonKey ? supabaseAnonKey.slice(0, 24) + '…' : '(missing)');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
