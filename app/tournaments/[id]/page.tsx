"use client";

import { useState, useEffect, use } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { Tournament, TournamentMatch, UserProfile } from "../../../types";
import { Bracket, Seed, SeedItem } from "react-brackets";

// ICONOS
const ReturnIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const LinkIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
const UserIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const TrophyIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
const ScanIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16-1.5-1.5"/></svg>;

export default function TournamentBracketPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const tournamentId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tournament, setTournament] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [isScanning, setIsScanning] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "bracket" | "players">("overview");

  const [seedingSlot, setSeedingSlot] = useState<{ matchId: string, playerSide: 1 | 2 } | null>(null);
  const [scoreModal, setScoreModal] = useState<{ match: TournamentMatch, p1Score: number, p2Score: number } | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);
  const [manualMatchId, setManualMatchId] = useState("");

  const loadInitialData = async () => {
    setLoading(true);
    const [tRes, pRes, mRes] = await Promise.all([
      supabase.from("tournaments").select("*").eq("id", tournamentId).single(),
      supabase.from("tournament_participants").select("*, profiles(*)").eq("tournament_id", tournamentId),
      supabase.from("tournament_matches").select("*").eq("tournament_id", tournamentId).order('round_number').order('match_number')
    ]);

    if (tRes.data) setTournament(tRes.data);
    if (pRes.data) setParticipants(pRes.data);
    if (mRes.data) setMatches(mRes.data);

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (profile) {
        setUserProfile(profile);
        if (profile.role === "admin" || profile.role === "organizador") setIsAdmin(true);
        if (pRes.data?.some((p: any) => p.user_id === session.user.id)) setIsRegistered(true);
      }
    }
    setLoading(false);
  };

  const refreshBracket = async () => {
    const [pRes, mRes] = await Promise.all([
      supabase.from("tournament_participants").select("*, profiles(*)").eq("tournament_id", tournamentId),
      supabase.from("tournament_matches").select("*").eq("tournament_id", tournamentId).order('round_number').order('match_number')
    ]);
    if (pRes.data) setParticipants(pRes.data);
    if (mRes.data) setMatches(mRes.data);
  };

  useEffect(() => { setMounted(true); loadInitialData(); }, [tournamentId]);

  const scanRiotMatch = async (match: TournamentMatch, customId?: string) => {
    if (!isAdmin || isScanning) return;
    setIsScanning(match.id);
    try {
      const res = await fetch("/api/riot/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: match.id, player1_id: match.player1_id, player2_id: match.player2_id, providedMatchId: customId })
      });
      const data = await res.json();
      if (!res.ok) return alert(`❌ Fallo: ${data.error}`);

      alert(`✅ Victoria detectada para: ${data.winner_id === match.player1_id ? 'P1' : 'P2'}`);
      setScoreModal({ match, p1Score: data.winner_id === match.player1_id ? 1 : 0, p2Score: data.winner_id === match.player2_id ? 1 : 0 });
      setSelectedMatch(null);
    } catch (err) { alert("Error de conexión."); }
    setIsScanning(null);
  };

  const generateBracket = async () => {
    if (!isAdmin || isGenerating || participants.length < 2) return;
    setIsGenerating(true);
    await supabase.from("tournament_matches").delete().eq("tournament_id", tournamentId);
    const p2 = Math.pow(2, Math.ceil(Math.log2(participants.length)));
    const totalRounds = Math.log2(p2);
    let newMatches = [];
    let shuffled = [...participants].sort(() => Math.random() - 0.5);
    for (let r = 1; r <= totalRounds; r++) {
      for (let m = 1; m <= (p2 / Math.pow(2, r)); m++) {
        newMatches.push({ tournament_id: tournamentId, round_number: r, match_number: m, status: "pending", player1_score: 0, player2_score: 0 });
      }
    }
    const r1 = newMatches.filter(m => m.round_number === 1);
    shuffled.forEach((p, i) => {
      const mIdx = Math.floor(i/2);
      if (i % 2 === 0) r1[mIdx].player1_id = p.user_id;
      else r1[mIdx].player2_id = p.user_id;
    });
    await supabase.from("tournament_matches").insert(newMatches);
    refreshBracket();
    setIsGenerating(false);
  };

  const handleSaveScore = async () => {
    if (!scoreModal) return;
    const { match, p1Score, p2Score } = scoreModal;
    const winnerId = p1Score > p2Score ? match.player1_id : match.player2_id;
    await supabase.from("tournament_matches").update({ player1_score: p1Score, player2_score: p2Score, winner_id: winnerId, status: "finished" }).eq("id", match.id);
    if (winnerId) {
      const nextRound = match.round_number + 1;
      const nextMatchNum = Math.ceil(match.match_number / 2);
      const { data: nextMatch } = await supabase.from("tournament_matches").select("*").eq("tournament_id", tournamentId).eq("round_number", nextRound).eq("match_number", nextMatchNum).single();
      if (nextMatch) await supabase.from("tournament_matches").update(match.match_number % 2 !== 0 ? { player1_id: winnerId } : { player2_id: winnerId }).eq("id", nextMatch.id);
    }
    setScoreModal(null); refreshBracket();
  };

  const CustomSeed = ({ seed, breakpoint }: any) => {
    const match = seed.match;
    const p1 = participants.find(p => p.user_id === match.player1_id)?.profiles;
    const p2 = participants.find(p => p.user_id === match.player2_id)?.profiles;
    
    const renderPlayer = (p: any, score: number, isWinner: boolean, side: 1|2) => (
      <div className={`p-4 flex justify-between items-center ${isWinner ? 'bg-purple-600/20' : ''}`}>
        <div className="flex flex-col truncate pr-2">
          <span className={`text-[12px] font-black uppercase italic ${isWinner ? 'text-purple-400' : 'text-white'}`}>
            {p?.riot_game_name ? `${p.riot_game_name}#${p.riot_tagline || 'LAN'}` : p?.username || "--- TBD ---"}
          </span>
          {p?.riot_game_name && <span className="text-[9px] text-gray-500 font-bold uppercase -mt-1">{p.username}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => isAdmin && !match.status.includes("finish") && setScoreModal({ match, p1Score: match.player1_score, p2Score: match.player2_score })}
            className="w-8 h-8 rounded bg-gray-900 border border-gray-700 text-white font-black text-xs"
          >
            {score}
          </button>
        </div>
      </div>
    );

    return (
      <Seed mobileBreakpoint={breakpoint}>
        <SeedItem>
          <div className="w-[320px] bg-[#0b0e14] border-2 border-gray-800 rounded-xl overflow-hidden shadow-2xl">
            {renderPlayer(p1, match.player1_score, match.winner_id === match.player1_id, 1)}
            <div className="h-[1px] bg-gray-800" />
            {renderPlayer(p2, match.player2_score, match.winner_id === match.player2_id, 2)}
            {isAdmin && match.status !== "finished" && p1 && p2 && (
              <button onClick={() => setSelectedMatch(match)} className="w-full bg-purple-600/10 hover:bg-purple-600 text-purple-400 hover:text-white py-2 text-[9px] font-black uppercase transition-all border-t border-gray-800">
                Resolve Encounter
              </button>
            )}
          </div>
        </SeedItem>
      </Seed>
    );
  };

  const formattedRounds = Array.from(new Set(matches.map(m => m.round_number))).sort((a,b) => a-b).map(r => ({
    title: `Round ${r}`,
    seeds: matches.filter(m => m.round_number === r).sort((a,b) => a.match_number - b.match_number).map(m => ({ id: m.id, match: m }))
  }));

  return (
    <>
      {mounted && scoreModal && createPortal(
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md" onClick={() => setScoreModal(null)}>
          <div className="bg-[#121620] border-2 border-purple-500 p-8 rounded-3xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black uppercase text-white mb-6 text-center italic">Report Result</h3>
            <div className="flex justify-around items-center mb-8">
              <input type="number" value={scoreModal.p1Score} onChange={e => setScoreModal({...scoreModal, p1Score: +e.target.value})} className="w-16 h-16 bg-gray-950 border-2 border-gray-700 rounded-xl text-center text-2xl font-black text-white" />
              <span className="text-gray-600 italic font-black text-xl">VS</span>
              <input type="number" value={scoreModal.p2Score} onChange={e => setScoreModal({...scoreModal, p2Score: +e.target.value})} className="w-16 h-16 bg-gray-950 border-2 border-gray-700 rounded-xl text-center text-2xl font-black text-white" />
            </div>
            <button onClick={handleSaveScore} className="w-full bg-purple-600 text-white py-4 rounded-xl font-black uppercase text-xs">Save Score</button>
          </div>
        </div>, document.body
      )}

      {mounted && selectedMatch && createPortal(
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md" onClick={() => setSelectedMatch(null)}>
          <div className="bg-[#121620] border-2 border-blue-500 p-8 rounded-3xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black uppercase text-white mb-2 text-center italic">Advanced Resolution</h3>
            <p className="text-[10px] text-gray-500 text-center uppercase font-bold mb-8">Automatic Validation via Riot API</p>
            
            <div className="space-y-4 mb-8">
              <button onClick={() => scanRiotMatch(selectedMatch)} disabled={isScanning === selectedMatch.id} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-3">
                {isScanning === selectedMatch.id ? "Analyzing History..." : <><ScanIcon /> Auto-Scan Recent History</>}
              </button>
              
              <div className="relative pt-4 border-t border-gray-800">
                <label className="text-[9px] font-black text-gray-500 uppercase absolute -top-2 left-4 bg-[#121620] px-2">Manual Uplink</label>
                <input 
                  type="text" 
                  placeholder="MATCH ID (Ej: LA1_1234567)" 
                  value={manualMatchId} 
                  onChange={e => setManualMatchId(e.target.value)} 
                  className="w-full bg-gray-950 border-2 border-gray-800 p-4 rounded-xl text-white font-bold text-xs outline-none focus:border-purple-500 mb-2"
                />
                <button onClick={() => scanRiotMatch(selectedMatch, manualMatchId)} className="w-full bg-gray-800 hover:bg-purple-600 text-gray-400 hover:text-white py-3 rounded-xl font-black uppercase text-[9px] transition-all">
                  Force Victory with ID
                </button>
              </div>
            </div>
            <button onClick={() => setSelectedMatch(null)} className="w-full text-gray-600 font-black uppercase text-[10px] py-2">Cancel</button>
          </div>
        </div>, document.body
      )}

      <main className="min-h-screen bg-[#0b0e14] pb-20">
        <div className="max-w-7xl mx-auto px-8 py-12">
          {/* Header Simplified */}
          <div className="flex justify-between items-end mb-12 border-b border-gray-800 pb-10">
            <div>
              <h1 className="text-6xl font-black uppercase italic text-white tracking-tighter mb-4">{tournament?.title || "Tournament"}</h1>
              <div className="flex gap-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">
                <span className="text-purple-500">{tournament?.series_format} Mode</span>
                <span>|</span>
                <span>{participants.length} Joined</span>
              </div>
            </div>
            {isAdmin && (
              <div className="flex gap-4">
                <button onClick={generateBracket} className="bg-purple-600 text-white px-8 py-4 rounded-xl font-black uppercase text-[10px]">Initialize Map</button>
                <button onClick={() => supabase.from("tournament_matches").delete().eq("tournament_id", tournamentId).then(refreshBracket)} className="bg-red-900/20 text-red-500 border border-red-900/50 px-4 py-4 rounded-xl"><TrashIcon /></button>
              </div>
            )}
          </div>

          {/* Bracket Full Width */}
          <div className="w-full bg-[#121620] p-10 rounded-[3rem] border border-gray-800 min-h-[600px] flex flex-col items-center">
            {matches.length > 0 ? (
              <div className="w-full overflow-x-auto py-10">
                <Bracket rounds={formattedRounds} renderSeedComponent={CustomSeed} />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                <p className="text-2xl font-black uppercase italic text-gray-500 tracking-[0.5em]">Awaiting Data</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}