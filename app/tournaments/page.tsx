"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase"; // Adjust this route if necessary
import { useRouter } from "next/navigation";
import { Tournament } from "../../types";

// Native SVG Icons
const CalendarIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const ClockIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const Swords = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" y1="14" x2="9" y2="18"/><line x1="7" y1="17" x2="4" y2="20"/><line x1="3" y1="19" x2="5" y2="21"/></svg>;
const TrophyIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;

export default function TournamentHub() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setTournaments(data);
      setLoading(false);
    };

    fetchTournaments();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center text-purple-500 font-black italic tracking-widest animate-pulse">
        LOADING TOURNAMENTS...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0e14] text-gray-200 font-sans pb-20">
      
      {/* HEADER */}
      <div className="pt-20 pb-12 px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black uppercase italic text-white tracking-tighter leading-none mb-4">
          TOURNAMENT <span className="text-purple-500">HUB</span>
        </h1>
        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs leading-relaxed max-w-2xl mx-auto">
          SELECT A TOURNAMENT. COMPETE AGAINST THE BEST AND BUILD YOUR COMPETITIVE LEGACY.
        </p>
      </div>

      {/* TOURNAMENT CARDS GRID */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex justify-center md:justify-start">
        {tournaments.length === 0 ? (
          <div className="text-center py-20 w-full bg-[#121620] rounded-[3rem] border-2 border-dashed border-gray-800">
            <p className="text-gray-600 font-black uppercase tracking-widest italic text-sm">NO TOURNAMENTS AVAILABLE AT THE MOMENT.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full justify-items-center md:justify-items-start">
            {tournaments.map(t => (
              <div 
                key={t.id} 
                onClick={() => router.push(`/tournaments/${t.id}`)}
                className="bg-[#1e2235] w-full max-w-[320px] rounded-2xl border border-[#2a2f4c] overflow-hidden shadow-2xl flex flex-col group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
              >
                
                {/* Image Banner (FIXED: h-40 for perfect 2:1 ratio on 320px width) */}
                <div className="h-40 w-full bg-[#0b0e14] relative overflow-hidden">
                  {t.banner_url ? (
                    <img 
                      src={t.banner_url} 
                      alt={t.title} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" 
                      onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/1200x600?text=S-RANK+ARENA")}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-950 to-[#0b0e14] flex items-center justify-center">
                       <span className="text-white/20 text-[9px] font-black uppercase tracking-widest">S-RANK ARENA</span>
                    </div>
                  )}
                  {/* Gradient to smooth the downward transition */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1e2235] via-[#1e2235]/20 to-transparent pointer-events-none"></div>
                  
                  {/* Floating format badge (e.g., 1V1) */}
                  <div className="absolute top-3 left-3 bg-purple-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest shadow-lg">
                    {t.mode || "1V1"}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex flex-col gap-3 -mt-6 relative z-10">
                  <h4 className="font-black text-white text-lg leading-tight tracking-tight drop-shadow-md truncate">
                    {t.title}
                  </h4>

                  {/* Row: Date and Time */}
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-300">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon /> 
                      {t.start_date ? new Date(t.start_date).toLocaleDateString('en-US', {weekday:'short', month:'short', day:'numeric'}) : "TBA"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ClockIcon /> {t.start_time || "TBA"}
                      <span className="ml-1 bg-indigo-500 text-white px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest uppercase shadow-[0_0_8px_rgba(99,102,241,0.4)]">Live</span>
                    </div>
                  </div>

                  <div className="h-px w-full bg-[#2a2f4c]" />

                  {/* Row: Region and Reward */}
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-gray-400">{t.region || "Global"}</span>
                    <span className="flex items-center gap-1 text-purple-400 font-black">
                      <TrophyIcon /> +{t.reward_points || "100"} EXP
                    </span>
                  </div>

                  <div className="h-px w-full bg-[#2a2f4c]" />

                  {/* Row: Game and View Details Button */}
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2 text-[11px] font-black text-white truncate pr-2">
                      <div className="w-6 h-6 bg-[#2a2f4c] text-indigo-400 rounded flex shrink-0 items-center justify-center border border-gray-700">
                        <Swords />
                      </div>
                      <span className="truncate">{t.game}</span>
                    </div>
                    <span className="text-[9px] shrink-0 font-black text-gray-500 uppercase tracking-widest group-hover:text-purple-400 transition-colors flex items-center gap-1">
                      View Details <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}