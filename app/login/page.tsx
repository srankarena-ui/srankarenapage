"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase"; 
import { useRouter } from "next/navigation";
import Link from "next/link";
import Modal from "../../components/Modal";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{isOpen: boolean, title: string, message: string, type: 'alert' | 'confirm'}>({isOpen: false, title: '', message: '', type: 'alert'});

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        window.location.href = "/"; 
      }
    } else {
      console.log("Intentando crear Hunter con:", email, username);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username } },
      });
      
      console.log("Respuesta de Supabase:", data, error);
      
      if (error) {
        setError(error.message);
      } else {
        setModal({
          isOpen: true, 
          title: 'Success', 
          message: 'Sign Up completed! Welcome to the Arena.', 
          type: 'alert'
        });
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
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.3em] mt-2">Authentication Portal</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-xs text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Player Alias</label>
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-all" placeholder="Username" />
            </div>
          )}

          <div>
            <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Secure Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-all" placeholder="player@example.com" />
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
          <button type="button" onClick={() => { setIsLogin(!isLogin); setError(null); }} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-purple-400 transition-colors">
            {isLogin ? "¿No tienes licencia? Regístrate" : "¿Ya eres un Hunter? Login"}
          </button>
        </div>
      </div>
      <Modal isOpen={modal.isOpen} title={modal.title} message={modal.message} onClose={() => {
        setModal({...modal, isOpen: false});
        if (modal.title === 'Éxito') window.location.href = "/";
      }} type={modal.type} />
    </main>
  );
}