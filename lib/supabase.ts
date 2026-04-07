import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,      // Mantiene la sesión en el localStorage
    autoRefreshToken: true,    // Refresca el token en segundo plano antes de que expire
    detectSessionInUrl: true,  // Crítico para que Google/Discord funcionen al volver a la web
    storageKey: 's-rank-auth-token', // Llave personalizada para evitar conflictos
  }
});