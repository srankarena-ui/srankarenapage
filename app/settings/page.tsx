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

  // Estados de League of Legends
  const [gameName, setGameName] = useState("");
  const [tagline, setTagline] = useState("");
  const [region, setRegion] = useState("LAN");

  // Estados de Clash Royale
  const [crTag, setCrTag] = useState("");
  const [crName, setCrName] = useState("");
  const [updatingCR, setUpdatingCR] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/login");
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (data) {
        setProfile(data);
        
        // Cargar datos LOL
        if (data.riot_gamename) setGameName(data.riot_gamename);
        if (data.riot_tagline) setTagline(data.riot_tagline);
        if (data.lol_region) setRegion(data.lol_region);

        // Cargar datos CR
        if (data.cr_tag) setCrTag(data.cr_tag);
        if (data.cr_name) setCrName(data.cr_name);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  // =====================================
  // GUARDADO DE LEAGUE OF LEGENDS
  // =====================================
  const handleLinkRiot = async (e: React.FormEvent) => {
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

  // =====================================
  // GUARDADO DE CLASH ROYALE
  // =====================================
  const handleLinkCR = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingCR(true);
    try {
      if (!crTag.trim()) throw new Error("El Player Tag es obligatorio.");
      if (!crName.trim()) throw new Error("Debes escribir tu nombre de jugador.");

      // Limpiamos el Tag para asegurarnos de que empiece con '#'
      let finalTag = crTag.trim().toUpperCase();
      if (!finalTag.startsWith("#")) {
          finalTag = "#" + finalTag;
      }

      const { error: dbError } = await supabase.from("profiles").update({
        cr_tag: finalTag,
        cr_name: crName.trim()
      }).eq("id", profile.id);

      if (dbError) throw dbError;

      alert("¡Cuenta de Clash Royale vinculada con éxito!");
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingCR(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0b0e14]"></div>;

  return (
    <main className="min-h-screen bg-[#0b0e14] text-gray-200 p-8 font-sans pb-32">
      <div className="max-w-2xl mx-auto">
        <header className="mb-12">
          <Link href={`/profile/${profile.username}`} className="text-[10px] font-black uppercase text-gray-600 hover:text-white transition-all tracking-[0.2em]">&larr; Volver al Perfil</Link>
          <h1 className="text-4xl font-black text-white italic uppercase mt-4">Ajustes del Nexo</h1>
        </header>

        <div className="space-y-8">
            {/* ==============================================
                SECCIÓN: LEAGUE OF LEGENDS
                ============================================== */}
            <section className="bg-[#121620] border border-gray-800 rounded-[2.5rem] p-8 shadow-xl">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 bg-red-600/10 flex items-center justify-center rounded-xl text-red-500 font-black italic border border-red-500/20">L</div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase italic tracking-tighter">Enlace Neural LOL</h2>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Riot Games Uplink</p>
                  </div>
               </div>

               {profile.riot_puuid ? (
                 <div className="bg-[#0b0e14] border border-red-500/30 p-6 rounded-3xl flex flex-col sm:flex-row gap-6 justify-between items-center shadow-inner">
                    <div className="text-center sm:text-left">
                      <p className="text-[9px] text-gray-600 font-black uppercase mb-1 tracking-widest">Vinculado en {profile.lol_region}</p>
                      <p className="text-2xl font-black text-white italic uppercase tracking-tighter">{profile.riot_gamename} <span className="text-gray-700">#{profile.riot_tagline}</span></p>
                    </div>
                    <button onClick={async () => {
                       if(!confirm("¿Desvincular Riot ID? Perderás acceso a torneos de LOL.")) return;
                       await supabase.from("profiles").update({ riot_puuid: null, riot_gamename: null, riot_tagline: null, lol_region: null }).eq("id", profile.id);
                       window.location.reload();
                    }} className="w-full sm:w-auto bg-gray-900 text-gray-500 border border-gray-800 px-6 py-4 rounded-xl text-[10px] font-black uppercase hover:border-red-500 hover:text-red-500 transition-all tracking-widest">Desvincular</button>
                 </div>
               ) : (
                 <form onSubmit={handleLinkRiot} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                         <label className="text-[9px] font-black uppercase text-gray-600 absolute -top-2 left-4 bg-[#121620] px-2 tracking-widest">Riot ID</label>
                         <input type="text" placeholder="Ej: Hydro" value={gameName} onChange={(e) => setGameName(e.target.value)} className="w-full bg-[#0b0e14] border border-gray-800 p-4 rounded-xl text-sm font-bold outline-none focus:border-red-500 transition-all" required />
                      </div>
                      <div className="relative">
                         <label className="text-[9px] font-black uppercase text-gray-600 absolute -top-2 left-4 bg-[#121620] px-2 tracking-widest">Tagline</label>
                         <input type="text" placeholder="Ej: LAN" value={tagline} onChange={(e) => setTagline(e.target.value)} className="w-full bg-[#0b0e14] border border-gray-800 p-4 rounded-xl text-sm font-bold outline-none focus:border-red-500 transition-all" required />
                      </div>
                    </div>
                    <div className="relative mt-6">
                      <label className="text-[9px] font-black uppercase text-gray-600 absolute -top-2 left-4 bg-[#121620] px-2 tracking-widest">Región</label>
                      <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full bg-[#0b0e14] border border-gray-800 p-4 rounded-xl text-sm text-white font-bold outline-none focus:border-red-500 transition-all appearance-none">
                        <option value="LAN">Latinoamérica Norte (LAN)</option>
                        <option value="LAS">Latinoamérica Sur (LAS)</option>
                        <option value="NA">Norteamérica (NA)</option>
                        <option value="EUW">Europa Oeste (EUW)</option>
                        <option value="BR">Brasil (BR)</option>
                      </select>
                    </div>
                    <button type="submit" disabled={updating} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-xl text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-red-900/20 transition-all disabled:opacity-50">
                      {updating ? "Verificando..." : "Vincular Riot ID"}
                    </button>
                 </form>
               )}
            </section>

            {/* ==============================================
                SECCIÓN: CLASH ROYALE
                ============================================== */}
            <section className="bg-[#121620] border border-gray-800 rounded-[2.5rem] p-8 shadow-xl">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 bg-blue-600/10 flex items-center justify-center rounded-xl text-blue-500 font-black italic border border-blue-500/20">C</div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase italic tracking-tighter">Enlace Neural CR</h2>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Supercell Uplink</p>
                  </div>
               </div>

               {profile.cr_tag ? (
                 <div className="bg-[#0b0e14] border border-blue-500/30 p-6 rounded-3xl flex flex-col sm:flex-row gap-6 justify-between items-center shadow-inner">
                    <div className="text-center sm:text-left">
                      <p className="text-[9px] text-gray-600 font-black uppercase mb-1 tracking-widest">Arena de Supercell</p>
                      <p className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1">{profile.cr_name}</p>
                      <p className="text-xs font-bold text-gray-500 tracking-widest">{profile.cr_tag}</p>
                    </div>
                    <button onClick={async () => {
                       if(!confirm("¿Desvincular Clash Royale? Perderás acceso a torneos de CR.")) return;
                       await supabase.from("profiles").update({ cr_tag: null, cr_name: null }).eq("id", profile.id);
                       window.location.reload();
                    }} className="w-full sm:w-auto bg-gray-900 text-gray-500 border border-gray-800 px-6 py-4 rounded-xl text-[10px] font-black uppercase hover:border-blue-500 hover:text-blue-500 transition-all tracking-widest">Desvincular</button>
                 </div>
               ) : (
                 <form onSubmit={handleLinkCR} className="space-y-6">
                    <div className="relative">
                       <label className="text-[9px] font-black uppercase text-gray-600 absolute -top-2 left-4 bg-[#121620] px-2 tracking-widest">Nombre en el Juego</label>
                       <input type="text" placeholder="Ej: Hydro" value={crName} onChange={(e) => setCrName(e.target.value)} className="w-full bg-[#0b0e14] border border-gray-800 p-4 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all text-white" required />
                    </div>
                    <div className="relative">
                       <label className="text-[9px] font-black uppercase text-gray-600 absolute -top-2 left-4 bg-[#121620] px-2 tracking-widest">Player Tag</label>
                       <input type="text" placeholder="Ej: #2P0YQ029" value={crTag} onChange={(e) => setCrTag(e.target.value)} className="w-full bg-[#0b0e14] border border-gray-800 p-4 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all text-white uppercase" required />
                       <p className="text-[10px] text-gray-600 font-bold mt-3 ml-2 tracking-widest">Encuentras tu Tag debajo de tu nombre en el perfil del juego.</p>
                    </div>
                    <button type="submit" disabled={updatingCR} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-xl text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50">
                      {updatingCR ? "Sincronizando Tag..." : "Vincular CR Tag"}
                    </button>
                 </form>
               )}
            </section>
        </div>

      </div>
    </main>
  );
}