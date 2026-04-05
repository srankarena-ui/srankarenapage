"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

export default function LoLDataTerminalPage({ params }: { params: Promise<{ puuid: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const res = await fetch(`/api/lol/${resolvedParams.puuid}`);
        
        // CHEQUEO CRÍTICO: Si no es JSON, capturar el error
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("El servidor no respondió con JSON. Revisa la consola del servidor.");
        }

        const json = await res.json();
        setData(json);
      } catch (err: any) { 
        console.error("Fetch error:", err.message);
        setData({ error: err.message });
      } finally { 
        setLoading(false); 
      }
    }
    fetchAll();
  }, [resolvedParams.puuid]);

  if (loading) return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center text-blue-400 font-mono text-xs tracking-[0.5em] animate-pulse uppercase">
      RECONSTRUCTING_COMBAT_LOGS...
    </div>
  );

  if (!data || data.error) return (
    <div className="min-h-screen bg-[#05070a] text-red-500 p-20 font-mono flex flex-col items-center justify-center text-center">
       <div className="border border-red-500/30 p-10 bg-red-500/5 rounded-lg max-w-xl">
          <h2 className="text-2xl font-black mb-4 uppercase italic">Critical Stream Error</h2>
          <p className="text-xs text-gray-500 mb-8 leading-relaxed">
            {data?.error || "Error de comunicación con la API."} <br/>
            Causa probable: RIOT_API_KEY expirada o URL de Supabase incorrecta.
          </p>
          <Link href="/" className="bg-red-500 text-white px-8 py-3 rounded text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all">Volver a Base</Link>
       </div>
    </div>
  );

  const matches = Array.isArray(data.matches) ? data.matches : [];
  const getP = (m: any) => m?.info?.participants?.find((p: any) => p.puuid === resolvedParams.puuid);

  // Estadísticas acumuladas
  const totalWards = matches.reduce((acc, m) => acc + (getP(m)?.wardsPlaced || 0), 0);
  const totalPentas = matches.reduce((acc, m) => acc + (getP(m)?.pentaKills || 0), 0);
  const totalGold = matches.reduce((acc, m) => acc + (getP(m)?.goldEarned || 0), 0);

  return (
    <main className="min-h-screen bg-[#05070a] text-gray-400 p-4 md:p-10 font-mono text-[11px] selection:bg-blue-900">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HEADER */}
        <div className="border border-blue-900/30 bg-[#0a0d14] p-8 rounded-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-1">{data.summoner?.name} <span className="text-blue-900">#{data.region}</span></h1>
              <p className="text-blue-500 font-bold uppercase tracking-widest opacity-50">ID: {resolvedParams.puuid}</p>
            </div>
            <div className="text-right border-l border-blue-900/30 pl-6">
              <p className="text-gray-600">ACC_LEVEL</p>
              <p className="text-2xl font-black text-white">{data.summoner?.summonerLevel}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* STATS PURE TEXT */}
          <div className="space-y-6">
            <h2 className="text-blue-400 font-bold uppercase border-b border-blue-900/30 pb-2">Combat_Metrics (Last 20)</h2>
            <div className="bg-[#0a0d14] border border-blue-900/10 p-6 space-y-3">
              <div className="flex justify-between italic"><span>Total Wards:</span> <span className="text-white">{totalWards}</span></div>
              <div className="flex justify-between italic"><span>Pentakills:</span> <span className="text-purple-500">{totalPentas}</span></div>
              <div className="flex justify-between italic"><span>Gold Accumulation:</span> <span className="text-yellow-500">{totalGold.toLocaleString()} G</span></div>
            </div>
          </div>

          {/* HISTORY LOG */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-blue-400 font-bold uppercase border-b border-blue-900/30 pb-2">Historical_Log</h2>
            <div className="space-y-3">
              {matches.map((m: any, idx: number) => {
                const p = getP(m);
                return (
                  <div key={idx} className="bg-[#0a0d14] border border-gray-900 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="border-r border-gray-900">
                      <p className="text-blue-400 font-black">{p?.championName}</p>
                      <p className={p?.win ? "text-green-500" : "text-red-500"}>{p?.win ? "SUCCESS" : "FAIL"}</p>
                    </div>
                    <div>
                      <p>KDA: {p?.kills}/{p?.deaths}/{p?.assists}</p>
                      <p>CS: {p?.totalMinionsKilled + (p?.neutralMinionsKilled || 0)}</p>
                    </div>
                    <div className="text-[9px] text-gray-600">
                       DMG: {p?.totalDamageDealtToChampions.toLocaleString()} <br/>
                       TAKEN: {p?.totalDamageTaken.toLocaleString()}
                    </div>
                    <div className="text-right text-gray-500">
                       {Math.floor(m.info.gameDuration / 60)}m | {m.info.gameMode}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}