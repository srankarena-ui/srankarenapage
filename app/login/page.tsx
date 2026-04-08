"use client";

import { useState } from "react";
// Importamos directamente el cliente de supabase que arreglamos
import { supabase } from "../../lib/supabase"; 
import { useRouter } from "next/navigation";
import Link from "next/link";
import Modal from "../../components/Modal";

const GoogleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92V14.5h7.73c-.34 2.13-2.3 6.18-7.73 6.18-4.73 0-8.59-3.92-8.59-8.75s3.86-8.75 8.59-8.75c2.69 0 4.5 1.15 5.53 2.13l2.82-2.82C18.9 1.15 15.96 0 12.48 0 5.58 0 0 5.58 0 12.48s5.58 12.48 12.48 12.48c7.2 0 12-5.06 12-12.2 0-.83-.09-1.46-.27-2.08H12.48z"/></svg>;
const DiscordIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"/></svg>;
const XIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>;

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{isOpen: boolean, title: string, message: string, type: 'alert' | 'confirm'}>({isOpen: false, title: '', message: '', type: 'alert'});

  const handleSocialAuth = async (provider: 'google' | 'discord' | 'twitter') => {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        // Usamos window.location para forzar un refresco y que la página lea la nueva sesión
        window.location.href = "/"; 
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username } },
      });
      
      if (error) setError(error.message);
      else {
        setModal({isOpen: true, title: 'Éxito', message: '¡Despertar completado! Revisa tu email para confirmar.', type: 'alert'});
      }
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>

        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black text-purple-500 tracking-wider">
            S-RANK ARENA
          </Link>
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.3em] mt-2">Terminal de Autenticación</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <button onClick={() => handleSocialAuth('google')} className="flex items-center justify-center py-3 bg-gray-950 border border-gray-800 rounded-xl hover:bg-gray-800 transition-all hover:border-gray-600 group">
            <GoogleIcon />
          </button>
          <button onClick={() => handleSocialAuth('discord')} className="flex items-center justify-center py-3 bg-[#5865F2]/10 border border-[#5865F2]/30 rounded-xl hover:bg-[#5865F2] transition-all group">
            <DiscordIcon />
          </button>
          <button onClick={() => handleSocialAuth('twitter')} className="flex items-center justify-center py-3 bg-gray-950 border border-gray-800 rounded-xl hover:bg-white hover:text-black transition-all group">
            <XIcon />
          </button>
        </div>

        <div className="relative flex items-center justify-center mb-8">
          <div className="w-full h-[1px] bg-gray-800"></div>
          <span className="absolute bg-gray-900 px-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">O Usa Credenciales</span>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-xs text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Alias del Hunter</label>
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-all" placeholder="SungJinWoo" />
            </div>
          )}

          <div>
            <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Email Seguro</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-all" placeholder="hunter@gremio.com" />
          </div>

          <div>
            <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Llave de Acceso</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-all" placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black text-[11px] uppercase tracking-[0.2em] py-4 rounded-xl mt-6 transition-all shadow-[0_10px_20px_rgba(168,85,247,0.2)] disabled:opacity-50">
            {loading ? "Sincronizando..." : (isLogin ? "Enlace a la Arena" : "Iniciar Despertar")}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-purple-400 transition-colors">
            {isLogin ? "¿No tienes licencia? Regístrate" : "¿Ya eres un Hunter? Login"}
          </button>
        </div>
      </div>
      <Modal isOpen={modal.isOpen} title={modal.title} message={modal.message} onClose={() => setModal({...modal, isOpen: false})} type={modal.type} />
    </main>
  );
}