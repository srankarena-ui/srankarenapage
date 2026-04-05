"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Modal from "../../components/Modal";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm?: () => void, type: 'alert' | 'confirm'}>({isOpen: false, title: '', message: '', type: 'alert'});

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isLogin) {
      // Iniciar sesión
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else router.push("/"); // Volver a la arena
    } else {
      // Registrarse
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username, // Se envía al gatillo de Supabase
          },
        },
      });
      
      if (error) setError(error.message);
      else {
        setModal({isOpen: true, title: 'Éxito', message: 'Awakening successful! Welcome to the Arena.', type: 'alert'});
        router.push(`/profile/${username}`);
      }
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        {/* Adorno visual */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>

        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black text-purple-500 tracking-wider">
            S-RANK ARENA
          </Link>
          <h1 className="text-xl font-bold text-gray-300 mt-4">
            {isLogin ? "Enter the Arena" : "Begin your Awakening"}
          </h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2">Hunter Name (Username)</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="e.g. SungJinWoo"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="hunter@guild.com"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded mt-6 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.4)] disabled:opacity-50"
          >
            {loading ? "Processing..." : (isLogin ? "Login" : "Register")}
          </button>
        </form>

        <div className="mt-8 text-center text-gray-500 text-sm">
          {isLogin ? "Don't have a Hunter License yet?" : "Already an Awakened Hunter?"}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-purple-400 hover:text-purple-300 font-bold ml-2 transition-colors"
          >
            {isLogin ? "Register now" : "Login here"}
          </button>
        </div>
      </div>
      <Modal isOpen={modal.isOpen} title={modal.title} message={modal.message} onClose={() => setModal({...modal, isOpen: false})} onConfirm={modal.onConfirm} type={modal.type} />
    </main>
  );
}