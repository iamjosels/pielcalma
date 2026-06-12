import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Solo se crea el cliente con una URL https válida (ignora placeholders/vacíos).
// Si no, supabase = null y la app funciona solo con localStorage.
let client = null;
try {
  if (url && anonKey && /^https?:\/\//i.test(url) && anonKey.length > 20) {
    client = createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
} catch {
  client = null;
}

export const supabase = client;

export function isSupabaseConfigured() {
  return Boolean(supabase);
}
