"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [gameName, setGameName] = useState("");
  const [tagline, setTagline] = useState("");
  const [region, setRegion] = useState("LAN");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/login");
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (data) {
        setProfile(data);
        if (data.riot_gamename) setGameName(data.riot_gamename);
        if (data.riot_tagline) setTagline(data.riot_tagline);
        if (data.lol_region) setRegion(data.lol_region);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch("/api/lol/verify", {
        method: "POST",
        body: JSON.stringify({ gameName, tagline, region }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const { error: dbError } = await supabase.from("profiles").update({
        riot_puuid: data.puuid,
        riot_gamename: data.gameName,
        riot_tagline: data.tagLine,
        lol_region: region
      }).eq("id", profile.id);

      if (dbError) throw dbError;

      alert("Cuenta de Riot vinculada con éxito.");
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0b0e14]"></div>;

  return (
    <main className="min-h-screen bg-[#0b0e14] text-gray-200 p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <header className="mb-12">
          <Link href={`/profile/${profile.username}`} className="text-[10px] font-black uppercase text-gray-600 hover:text-white transition-all tracking-[0.2em]">&larr; Volver al Perfil</Link>
          <h1 className="text-4xl font-black text-white italic uppercase mt-4">Ajustes</h1>
        </header>

        <section className="bg-[#121620] border border-gray-800 rounded-3xl p-8">
           <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 bg-red-600/10 flex items-center justify-center rounded-xl text-red-500 font-black italic">R</div>
              <div>
                <h2 className="text-lg font-black text-white uppercase italic">Enlace de Riot Games</h2>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Configuración de servidor global</p>
              </div>
           </div>

           {profile.riot_puuid ? (
             <div className="bg-[#0b0e14] border border-green-500/20 p-6 rounded-2xl flex justify-between items-center shadow-2xl">
                <div>
                  <p className="text-[9px] text-gray-600 font-black uppercase mb-1">Vinculado en {profile.lol_region}</p>
                  <p className="text-xl font-black text-white italic">{profile.riot_gamename} <span className="text-gray-700">#{profile.riot_tagline}</span></p>
                </div>
                <button onClick={async () => {
                   await supabase.from("profiles").update({ riot_puuid: null, riot_gamename: null, riot_tagline: null, lol_region: null }).eq("id", profile.id);
                   window.location.reload();
                }} className="bg-red-600/10 text-red-500 border border-red-500/20 px-5 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">Desvincular</button>
             </div>
           ) : (
             <form onSubmit={handleLink} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Hydro" value={gameName} onChange={(e) => setGameName(e.target.value)} className="bg-[#0b0e14] border border-gray-800 p-4 rounded-xl text-sm outline-none focus:border-purple-500 transition-all" required />
                  <input type="text" placeholder="LAN" value={tagline} onChange={(e) => setTagline(e.target.value)} className="bg-[#0b0e14] border border-gray-800 p-4 rounded-xl text-sm outline-none focus:border-purple-500 transition-all" required />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Región del Servidor</label>
                  <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full bg-[#0b0e14] border border-gray-800 p-4 rounded-xl text-sm text-white outline-none focus:border-purple-500 transition-all">
                    <option value="LAN">LAN</option>
                    <option value="LAS">LAS</option>
                    <option value="NA">NA</option>
                    <option value="EUW">EUW</option>
                    <option value="BR">BR</option>
                  </select>
                </div>
                <button type="submit" disabled={updating} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-purple-900/20 transition-all">
                  {updating ? "Verificando..." : "Vincular Riot ID"}
                </button>
             </form>
           )}
        </section>
      </div>
    </main>
  );
}