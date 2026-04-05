"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    loadUser();

    // Escuchar cambios de sesión (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadUser();
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  // Ocultar navbar en login o registro para mantener la pantalla limpia
  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <nav className="bg-gray-950 border-b border-gray-800 sticky top-0 z-50 shadow-2xl">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Lado Izquierdo: Logo y Links Principales */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-4 group">
              {/* AQUÍ ESTÁ EL CAMBIO: w-12 h-14 y en md w-14 h-16 para que sea mucho más grande */}
              <div className="relative w-12 h-14 md:w-14 md:h-16 flex-shrink-0">
                <Image 
                  src="/s-rank-logo.svg" 
                  alt="S-Rank Arena Logo" 
                  fill
                  className="object-contain invert opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black italic tracking-tighter text-white uppercase leading-none group-hover:text-purple-500 transition-colors">
                  S-Rank
                </span>
                <span className="text-[10px] md:text-[11px] font-black tracking-[0.3em] text-purple-500 uppercase leading-none mt-1">
                  Arena
                </span>
              </div>
            </Link>
            
            {user && (
              <div className="hidden md:flex space-x-2">
                <Link 
                  href="/tournaments" 
                  className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-colors ${pathname.startsWith("/tournaments") ? "bg-purple-600 text-white" : "text-gray-500 hover:bg-gray-900 hover:text-gray-300"}`}
                >
                  Eventos
                </Link>
                {(user.role === 'admin' || user.role === 'organizador') && (
                  <Link 
                    href="/admin" 
                    className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-colors ${pathname.startsWith("/admin") ? "bg-gray-800 text-white" : "text-gray-500 hover:bg-gray-900 hover:text-gray-300"}`}
                  >
                    Panel Admin
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Lado Derecho: Perfil y Ajustes */}
          <div className="flex items-center gap-4">
            {!loading && user ? (
              <>
                <Link 
                  href={`/profile/${user.username}`} 
                  className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-colors ${pathname.startsWith("/profile") ? "bg-purple-500/10 text-purple-400 border border-purple-500/30" : "text-white bg-gray-900 hover:bg-gray-800 border border-gray-800"}`}
                >
                  {user.username}
                </Link>
                
                <Link href="/settings" className="text-gray-500 hover:text-white transition-colors" title="Ajustes">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                </Link>
                
                <button 
                  onClick={handleLogout} 
                  className="text-gray-600 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-colors ml-2"
                >
                  Salir
                </button>
              </>
            ) : !loading && !user ? (
              <Link href="/login" className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">
                Iniciar Sesión
              </Link>
            ) : null}
          </div>
        </div>

        {/* Menú Móvil (Simple) */}
        {user && (
          <div className="md:hidden flex gap-4 pb-3 overflow-x-auto">
            <Link href="/tournaments" className="text-[10px] font-black uppercase text-gray-400 hover:text-white">Eventos</Link>
            {(user.role === 'admin' || user.role === 'organizador') && (
              <Link href="/admin" className="text-[10px] font-black uppercase text-gray-400 hover:text-white">Admin</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}