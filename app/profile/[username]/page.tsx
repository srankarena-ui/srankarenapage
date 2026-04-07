"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import { ACHIEVEMENT_DEFINITIONS } from "../../../lib/achievements";
import AchievementBadge from "../../../components/AchievementBadge";

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  async function loadAllData() {
    // 1. Cargar Perfil
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", resolvedParams.username)
      .single();

    if (profileData) {
      setProfile(profileData);
      
      // 2. Cargar Estadísticas de Logros (Arena Stats)
      const { data: statsData } = await supabase
        .from("user_arena_stats")
        .select("*")
        .eq("user_id", profileData.id)
        .single();
      
      setStats(statsData || {});
    }
    setLoading(false);
  }

  useEffect(() => {
    loadAllData();
  }, [resolvedParams.username]);

  const handleSync = async () => {
    if (!profile?.riot_puuid) return;
    setSyncing(true);
    try {
      const res = await fetch("/api/lol/sync", {
        method: "POST",
        body: JSON.stringify({ 
          userId: profile.id, 
          puuid: profile.riot_puuid, 
          region: profile.lol_region || 'LAN' 
        }),
      });
      if (res.ok) await loadAllData();
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center text-purple-500 font-black italic tracking-tighter uppercase animate-pulse">ACCEDIENDO AL NÚCLEO...</div>;
  if (!profile) return <div className="min-h-screen bg-[#0b0e14] text-white p-20 text-center font-black">USUARIO NO ENCONTRADO</div>;

  return (
    <main className="min-h-screen bg-[#0b0e14] text-gray-200 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="bg-[#121620] border border-gray-800 rounded-[2.5rem] p-8 md:p-12 mb-8 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none text-[12rem] font-black italic text-purple-500">
            {profile.rank?.split(' ')[1] || 'F'}
          </div>
          
          <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
            <div className="w-32 h-32 bg-gray-950 rounded-[2.5rem] border-4 border-purple-600/30 flex items-center justify-center text-5xl font-black italic text-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
              {profile.username[0].toUpperCase()}
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">{profile.username}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <span className="bg-purple-600/10 text-purple-500 text-[10px] font-black px-4 py-1 rounded-full border border-purple-600/20 uppercase tracking-widest">Cazador de la Arena</span>
                <span className="bg-gray-800 text-gray-400 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">S-Rank Level {profile.experience ? Math.floor(profile.experience / 1000) : 1}</span>
              </div>
            </div>
            
            {/* BOTÓN SYNC */}
            {profile.riot_puuid && (
              <button 
                onClick={handleSync}
                disabled={syncing}
                className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${syncing ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-purple-600 border-purple-500 text-white hover:bg-purple-500 shadow-lg shadow-purple-900/20'}`}
              >
                {syncing ? 'Sincronizando...' : 'Sincronizar Arena'}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PANEL IZQUIERDO: PROGRESO & NEXO */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#121620] border border-gray-800 rounded-[2rem] p-8 shadow-xl">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8 italic">Progreso Arena</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase text-gray-500">Rango Actual</span>
                  <span className="text-3xl font-black text-white italic uppercase leading-none">{profile.rank || 'Rank F'}</span>
                </div>
                <div className="h-2 w-full bg-gray-950 rounded-full overflow-hidden border border-gray-800 p-[2px]">
                  <div className="h-full bg-gradient-to-r from-purple-800 to-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all duration-1000" style={{ width: `${Math.min(((profile.experience || 0) / 5000) * 100, 100)}%` }}></div>
                </div>
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{profile.experience || 0} XP Acumulada</p>
              </div>
            </div>

            <div className="bg-[#121620] border border-gray-800 rounded-[2rem] p-8 shadow-xl">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8 italic">Nexus de Juegos</h3>
              
              {/* BLOQUE LEAGUE OF LEGENDS */}
              {profile.riot_puuid ? (
                <div className="space-y-4 mb-4">
                  <div className="bg-[#0b0e14] p-6 rounded-2xl border border-gray-800 group hover:border-purple-500 transition-all shadow-inner">
                    <p className="text-[9px] text-gray-600 font-black uppercase mb-1">Enlace Neural LOL</p>
                    <p className="text-xl font-black text-white mb-6 uppercase italic tracking-tight">{profile.riot_gamename} <span className="text-gray-700">#{profile.riot_tagline}</span></p>
                    <Link href={`/lol/${profile.riot_puuid}`} className="block w-full py-3 bg-gray-800 hover:bg-purple-600 text-[10px] font-black text-center uppercase tracking-widest rounded-xl transition-all text-white shadow-lg">
                      Analizar Combatiente &rarr;
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 mb-4 border-2 border-dashed border-gray-800 rounded-[2rem]">
                  <p className="text-[10px] font-black text-gray-600 uppercase mb-4 tracking-widest italic opacity-50">Sin Enlace LOL Detectado</p>
                  <Link href="/settings" className="text-[10px] font-black text-purple-500 uppercase underline tracking-widest hover:text-white transition-colors">Vincular Riot ID</Link>
                </div>
              )}

              {/* BLOQUE CLASH ROYALE */}
              {profile.cr_tag ? (
                <div className="space-y-4">
                  <div className="bg-[#0b0e14] p-6 rounded-2xl border border-gray-800 group hover:border-blue-500 transition-all shadow-inner">
                    <p className="text-[9px] text-gray-600 font-black uppercase mb-1">Enlace Neural CR</p>
                    <p className="text-xl font-black text-white uppercase italic tracking-tight mb-2">{profile.cr_name || "Clash Royale"}</p>
                    <p className="text-[11px] font-bold text-gray-500 mb-6">{profile.cr_tag}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-gray-800 rounded-[2rem]">
                  <p className="text-[10px] font-black text-gray-600 uppercase mb-4 tracking-widest italic opacity-50">Sin Enlace CR Detectado</p>
                  <Link href="/settings" className="text-[10px] font-black text-blue-500 uppercase underline tracking-widest hover:text-white transition-colors">Vincular CR Tag</Link>
                </div>
              )}

            </div>
          </div>

          {/* PANEL DERECHO: LOGROS (Nuevo Sistema S-Rank) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-4">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] italic">Arena Combat Badges</h3>
              <div className="h-[1px] flex-1 bg-gray-800"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ACHIEVEMENT_DEFINITIONS.map((ach) => (
                <AchievementBadge 
                  key={ach.id} 
                  achievement={ach} 
                  userValue={stats ? (stats[ach.stat_key] || 0) : 0} 
                />
              ))}
            </div>
            
            <p className="text-center text-[9px] text-gray-700 font-bold uppercase tracking-[0.3em] pt-4">
              * Los logros se calculan basándose únicamente en partidas jugadas post-vinculación.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}