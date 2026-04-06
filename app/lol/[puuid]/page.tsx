"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

export default function LoLDataTerminalPage({ params }: { params: Promise<{ puuid: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const RIOT_PATCH = "14.8.1"; 

  useEffect(() => {
    async function fetchAll() {
      try {
        const res = await fetch(`/api/lol/${resolvedParams.puuid}`);
        
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
    <div className="min-h-screen bg-[#111111] flex items-center justify-center text-blue-500 font-bold animate-pulse">
      Cargando datos del invocador...
    </div>
  );

  if (!data || data.error) return (
    <div className="min-h-screen bg-[#111111] text-red-500 p-10 flex flex-col items-center justify-center text-center">
       <div className="border border-red-500/30 p-10 bg-red-500/5 rounded-lg max-w-xl">
          <h2 className="text-2xl font-black mb-4 uppercase">Error de Conexión</h2>
          <p className="text-sm text-gray-400 mb-8">
            {data?.error || "Error de comunicación con la API de Riot."}
          </p>
          <Link href="/" className="bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700 transition">Volver</Link>
       </div>
    </div>
  );

  const matches = Array.isArray(data.matches) ? data.matches : [];
  const getP = (m: any) => m?.info?.participants?.find((p: any) => p.puuid === resolvedParams.puuid);

  const rankData = Array.isArray(data.rank) ? data.rank : [];
  const soloRank = rankData.find((r: any) => r.queueType === "RANKED_SOLO_5x5");
  const flexRank = rankData.find((r: any) => r.queueType === "RANKED_FLEX_SR");

  let kills = 0, deaths = 0, assists = 0, wins = 0;
  let doubles = 0, triples = 0, quadras = 0, pentas = 0;

  matches.forEach((m) => {
    const p = getP(m);
    if (p) {
      kills += p.kills;
      deaths += p.deaths;
      assists += p.assists;
      if (p.win) wins++;
      doubles += p.doubleKills || 0;
      triples += p.tripleKills || 0;
      quadras += p.quadraKills || 0;
      pentas += p.pentaKills || 0;
    }
  });

  const totalGames = matches.length;
  const winrate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  const avgKills = totalGames > 0 ? (kills / totalGames).toFixed(1) : "0";
  const avgDeaths = totalGames > 0 ? (deaths / totalGames).toFixed(1) : "0";
  const avgAssists = totalGames > 0 ? (assists / totalGames).toFixed(1) : "0";
  const kdaRatio = deaths === 0 ? "Perfecto" : ((kills + assists) / deaths).toFixed(2);

  return (
    <main className="min-h-screen bg-[#111111] text-gray-300 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="bg-[#1e1e1e] rounded-lg p-6 flex flex-col md:flex-row items-center gap-6 border border-gray-800 shadow-lg">
          <div className="relative">
            <img 
              src={`https://ddragon.leagueoflegends.com/cdn/${RIOT_PATCH}/img/profileicon/${data.summoner?.profileIconId || 1}.png`} 
              alt="Profile Icon" 
              className="w-24 h-24 rounded-2xl shadow-md border-2 border-gray-700"
            />
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full border border-gray-700">
              {data.summoner?.summonerLevel || 0}
            </span>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-white mb-1">
              {data.summoner?.name} <span className="text-gray-500 text-xl font-normal">#{data.region}</span>
            </h1>
            <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded transition">
              Actualizar Datos
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="bg-[#1e1e1e] rounded-lg p-5 border border-gray-800">
              <h3 className="text-gray-400 text-sm mb-3">Clasificatoria Solo/Dúo</h3>
              {soloRank ? (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-xl font-bold text-blue-400 capitalize">{soloRank.tier?.toLowerCase()} {soloRank.rank}</p>
                    <p className="text-gray-400 text-sm">{soloRank.leaguePoints} LP</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-400">{soloRank.wins}V {soloRank.losses}D</p>
                    <p className="text-gray-500">Win Rate {Math.round((soloRank.wins / (soloRank.wins + soloRank.losses)) * 100)}%</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic text-sm">Unranked</p>
              )}
            </div>

            <div className="bg-[#1e1e1e] rounded-lg p-5 border border-gray-800">
              <h3 className="text-gray-400 text-sm mb-3">Clasificatoria Flexible</h3>
              {flexRank ? (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-xl font-bold text-blue-400 capitalize">{flexRank.tier?.toLowerCase()} {flexRank.rank}</p>
                    <p className="text-gray-400 text-sm">{flexRank.leaguePoints} LP</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-400">{flexRank.wins}V {flexRank.losses}D</p>
                    <p className="text-gray-500">Win Rate {Math.round((flexRank.wins / (flexRank.wins + flexRank.losses)) * 100)}%</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic text-sm">Unranked</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#1e1e1e] rounded-lg p-5 border border-gray-800 flex flex-col md:flex-row gap-6 items-center md:justify-between">
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-400 mb-1">{totalGames} Partidas Recientes</p>
                <p className="text-xl font-bold text-white">{wins}V {totalGames - wins}D</p>
                <p className={`text-lg font-bold ${winrate >= 50 ? 'text-blue-500' : 'text-red-500'}`}>
                  {winrate}% Win Rate
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-lg font-bold text-white">{avgKills} / <span className="text-red-500">{avgDeaths}</span> / {avgAssists}</p>
                <p className="text-sm font-semibold text-gray-400">{kdaRatio}:1 KDA</p>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-400">
                <p>Dobles: <span className="text-white font-bold">{doubles}</span></p>
                <p>Triples: <span className="text-green-400 font-bold">{triples}</span></p>
                <p>Quadras: <span className="text-purple-400 font-bold">{quadras}</span></p>
                <p>Pentas: <span className="text-yellow-400 font-bold">{pentas}</span></p>
              </div>
            </div>

            <div className="space-y-2">
              {matches.map((m: any, idx: number) => {
                const p = getP(m);
                if (!p) return null;
                
                const isWin = p.win;
                const matchKDA = p.deaths === 0 ? "Perfecto" : ((p.kills + p.assists) / p.deaths).toFixed(2);
                const cs = p.totalMinionsKilled + (p.neutralMinionsKilled || 0);
                const gameMinutes = Math.floor(m.info.gameDuration / 60);

                return (
                  <div key={idx} className={`flex items-center gap-4 p-3 rounded-md border-l-4 ${isWin ? 'bg-[#28344e] border-blue-500' : 'bg-[#59343b] border-red-500'}`}>
                    <div className="w-20 text-xs text-gray-300">
                      <p className={`font-bold ${isWin ? 'text-blue-400' : 'text-red-400'}`}>{isWin ? 'Victoria' : 'Derrota'}</p>
                      <p>{m.info.gameMode}</p>
                      <p className="text-gray-400">{gameMinutes} min</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <img 
                        src={`https://ddragon.leagueoflegends.com/cdn/${RIOT_PATCH}/img/champion/${p.championName}.png`} 
                        alt={p.championName}
                        className="w-12 h-12 rounded-full"
                      />
                    </div>

                    <div className="flex-1 text-center">
                      <p className="text-lg font-bold text-white">{p.kills} / <span className="text-red-400">{p.deaths}</span> / {p.assists}</p>
                      <p className="text-xs text-gray-400">{matchKDA}:1 KDA</p>
                    </div>

                    <div className="w-24 text-right text-xs text-gray-300 hidden md:block">
                      <p>CS {cs} ({((cs) / gameMinutes).toFixed(1)})</p>
                      {p.pentaKills > 0 && <span className="bg-yellow-600 text-white px-2 py-0.5 rounded-full mt-1 inline-block">Penta</span>}
                      {p.quadraKills > 0 && p.pentaKills === 0 && <span className="bg-purple-600 text-white px-2 py-0.5 rounded-full mt-1 inline-block">Quadra</span>}
                      {p.tripleKills > 0 && p.quadraKills === 0 && p.pentaKills === 0 && <span className="bg-green-600 text-white px-2 py-0.5 rounded-full mt-1 inline-block">Triple</span>}
                      {p.doubleKills > 0 && p.tripleKills === 0 && p.quadraKills === 0 && p.pentaKills === 0 && <span className="bg-red-600 text-white px-2 py-0.5 rounded-full mt-1 inline-block">Doble</span>}
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