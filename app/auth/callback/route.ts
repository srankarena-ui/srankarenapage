import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer' // Asegúrate que esta ruta sea correcta

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    // AQUÍ ES DONDE SE CREA EL USUARIO EN SUPABASE:
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}/`)
    }
  }

  // Si algo falla o no hay código, lo mandamos al login
  return NextResponse.redirect(`${origin}/login?error=no_session_created`)
}