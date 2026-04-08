import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();
    
    // Creamos un cliente específico de servidor para intercambiar el código
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Esto es normal en rutas GET, se ignora el error
            }
          },
        },
      }
    );
    
    // Canjeamos el código por una sesión de verdad
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Redirigimos al inicio una vez completado el canje
      return NextResponse.redirect(`${origin}/`);
    } else {
      console.error("Error canjeando código:", error);
    }
  }

  // Si no hay código o hubo un error, volvemos al login
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}