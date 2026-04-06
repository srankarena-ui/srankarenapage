"use client";

import { useState, useEffect, use } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { Tournament, TournamentMatch, UserProfile } from "../../../types";
import { Bracket, Seed, SeedItem } from "react-brackets";

// ==========================================
// ICONOS SVG NATIVOS
// ==========================================
const CalendarIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const UserIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const TrophyIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
const SettingsIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;

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
  
  // ESTADOS DE LA LANDING PAGE
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "bracket" | "players">("overview");

  // ESTADOS DEL BRACKET
  const [dummyToAddCount, setDummyToAddCount] = useState<number>(1);
  const [seedingSlot, setSeedingSlot] = useState<{ matchId: string, playerSide: 1 | 2 } | null>(null);
  const [scoreModal, setScoreModal] = useState<{ match: TournamentMatch, p1Score: number, p2Score: number } | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);

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
        if (profile.role === "admin" || profile.role === "organizador") {
          setIsAdmin(true);
        }
        if (pRes.data && pRes.data.some((p: any) => p.user_id === session.user.id)) {
          setIsRegistered(true);
        }
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

  useEffect(() => { 
    setMounted(true);
    loadInitialData(); 
  }, [tournamentId]);

  // ==========================================
  // FUNCIONES DE REGISTRO Y DEREGISTRO
  // ==========================================
  const handleRegister = async () => {
    if (!userProfile) return router.push("/login");

    if (!userProfile.riot_puuid) {
      alert("¡Alto ahí, Hunter! 🛑\n\nNecesitas vincular tu cuenta de League of Legends (Riot ID) en tu perfil para poder entrar a la Arena.");
      return;
    }

    setIsRegistering(true);
    
    const { error } = await supabase.from("tournament_participants").insert([
      { tournament_id: tournamentId, user_id: userProfile.id }
    ]);

    if (error) {
      alert("Hubo un error al registrarse o ya estás inscrito.");
    } else {
      alert("¡Registro Exitoso!");
      setIsRegistered(true);
      refreshBracket();
    }
    setIsRegistering(false);
  };

  const handleUnregister = async () => {
    if (!userProfile) return;
    if (!confirm("¿Estás seguro que deseas abandonar la misión?")) return;

    setIsRegistering(true);
    const { error } = await supabase
      .from("tournament_participants")
      .delete()
      .eq("tournament_id", tournamentId)
      .eq("user_id", userProfile.id);

    if (error) {
      alert("Hubo un error al intentar retirarte del torneo.");
    } else {
      alert("Te has retirado de la misión.");
      setIsRegistered(false);
      refreshBracket();
    }
    setIsRegistering(false);
  };

  const scrollToBracket = () => {
    setActiveTab("bracket");
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  // ==========================================
  // FUNCIONES DEL BRACKET
  // ==========================================
  const generateBracket = async () => {
    if (!isAdmin) return;
    if (participants.length < 2) return alert("Se necesitan al menos 2 Hunters.");
    if (!confirm("Esto sobrescribirá el mapa táctico completo. ¿Proceder?")) return;

    await supabase.from("tournament_matches").delete().eq("tournament_id", tournamentId);

    const num = participants.length;
    const p2 = Math.pow(2, Math.ceil(Math.log2(num || 1)));
    const totalRounds = Math.log2(p2);
    
    let newMatches: any[] = [];
    let shuffled = [...participants].sort(() => Math.random() - 0.5);
    
    for (let r = 1; r <= totalRounds; r++) {
        const matchesInRound = p2 / Math.pow(2, r);
        for (let m = 1; m <= matchesInRound; m++) {
            newMatches.push({
                tournament_id: tournamentId, round_number: r, match_number: m,
                player1_id: null, player2_id: null, winner_id: null, status: "pending",
                player1_score: 0, player2_score: 0
            });
        }
    }
    
    const r1Matches = newMatches.filter(m => m.round_number === 1);
    for(let i = 0; i < p2; i++) {
         const matchIdx = Math.floor(i / 2);
         const isP1 = i % 2 === 0;
         const player = shuffled[i] ? shuffled[i].user_id : null;
         if (isP1) r1Matches[matchIdx].player1_id = player;
         else r1Matches[matchIdx].player2_id = player;
    }
    
    r1Matches.forEach(m => {
        if (m.player1_id && !m.player2_id) { m.winner_id = m.player1_id; m.status = "finished"; }
        else if (!m.player1_id && m.player2_id) { m.winner_id = m.player2_id; m.status = "finished"; }
        else if (!m.player1_id && !m.player2_id) { m.status = "finished"; }
    });
    
    newMatches.filter(x => x.round_number === 1 && x.status === "finished" && x.winner_id).forEach(match => {
        const nextRound = 2; const nextMatchNum = Math.ceil(match.match_number / 2); const isP1 = match.match_number % 2 !== 0;
        const nextMatch = newMatches.find(x => x.round_number === nextRound && x.match_number === nextMatchNum);
        if (nextMatch) {
            if (isP1) nextMatch.player1_id = match.winner_id;
            else nextMatch.player2_id = match.winner_id;
        }
    });

    await supabase.from("tournament_matches").insert(newMatches);
    refreshBracket();
  };

  const handleSaveScore = async () => {
    if (!isAdmin || !scoreModal) return;
    try {
      const { match, p1Score, p2Score } = scoreModal;
      const format = tournament.series_format || "Bo1";
      let neededToWin = 1;
      if (format === "Bo3") neededToWin = 2;
      if (format === "Bo5") neededToWin = 3;

      let winnerId = null;
      if (p1Score >= neededToWin) winnerId = match.player1_id;
      else if (p2Score >= neededToWin) winnerId = match.player2_id;

      await supabase.from("tournament_matches").update({
        player1_score: p1Score, player2_score: p2Score, winner_id: winnerId, status: winnerId ? "finished" : "pending"
      }).eq("id", match.id);

      if (winnerId) {
        const nextRound = match.round_number + 1; 
        const nextMatchNum = Math.ceil(match.match_number / 2); 
        const isNextP1 = match.match_number % 2 !== 0;
        const { data: nextMatch } = await supabase.from("tournament_matches").select("*").eq("tournament_id", tournamentId).eq("round_number", nextRound).eq("match_number", nextMatchNum).single();
        if (nextMatch) await supabase.from("tournament_matches").update(isNextP1 ? { player1_id: winnerId } : { player2_id: winnerId }).eq("id", nextMatch.id);
      }
      
      setScoreModal(null);
      await refreshBracket();
    } catch (err) {
      alert("Error al guardar score.");
    }
  };

  const forceWinner = async (matchId: string, winnerId: string) => {
    if (!isAdmin) return;
    try {
      const match = matches.find(m => m.id === matchId);
      if (!match) return;
      
      const nextRound = match.round_number + 1; 
      const nextMatchNum = Math.ceil(match.match_number / 2); 
      const isNextP1 = match.match_number % 2 !== 0;
      
      const { data: nextMatch } = await supabase.from("tournament_matches").select("*").eq("tournament_id", tournamentId).eq("round_number", nextRound).eq("match_number", nextMatchNum).single();
      if (nextMatch) {
        await supabase.from("tournament_matches").update(isNextP1 ? { player1_id: winnerId } : { player2_id: winnerId }).eq("id", nextMatch.id);
      }
      
      await supabase.from("tournament_matches").update({ winner_id: winnerId, status: "finished" }).eq("id", matchId);
      setSelectedMatch(null);
      await refreshBracket();
    } catch (err) {
      alert("Error al forzar ganador.");
    }
  };

  const swapPlayer = async (matchId: string, side: 1 | 2, newPlayerId: string) => {
    if (!isAdmin) return;
    await supabase.from("tournament_matches").update(side === 1 ? { player1_id: newPlayerId } : { player2_id: newPlayerId }).eq("id", matchId);
    setSeedingSlot(null); 
    refreshBracket();
  };

  const fillWithDummies = async () => {
    if (!isAdmin || !tournament) return;
    const maxP = tournament.max_participants || 16;
    const canAdd = maxP - participants.length;
    if (canAdd <= 0) return alert("Arena Full.");
    const newDummies = Array.from({ length: Math.min(dummyToAddCount, canAdd) }).map(() => ({ id: crypto.randomUUID(), username: `Dummy_${Math.floor(Math.random() * 90000)}`, rank: "IRON", role: "usuario", is_dummy: true }));
    await supabase.from("profiles").insert(newDummies);
    await supabase.from("tournament_participants").insert(newDummies.map(d => ({ tournament_id: tournament.id, user_id: d.id })));
    refreshBracket();
  };

  const CustomSeed = ({ seed, breakpoint }: any) => {
    const match = seed.match;
    const p1 = participants.find(p => p.user_id === match.player1_id)?.profiles;
    const p2 = participants.find(p => p.user_id === match.player2_id)?.profiles;
    const isFinished = match.status === "finished";
    const isGhost = !match.player1_id && !match.player2_id && isFinished;

    if (isGhost) return <div className="w-[320px] h-[80px] opacity-0 pointer-events-none"></div>;

    const openScoreModal = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isAdmin || isFinished || (!p1 && !p2)) return;
      setScoreModal({ match, p1Score: match.player1_score || 0, p2Score: match.player2_score || 0 });
    };

    return (
      <Seed mobileBreakpoint={breakpoint} style={{ fontSize: 12 }}>
        <SeedItem>
          <div className={`w-[320px] bg-[#0b0e14] border-2 rounded-xl overflow-hidden shadow-2xl relative transition-all ${isFinished ? 'border-gray-800 opacity-60' : 'border-gray-600 hover:border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)]'}`}>
            
            {/* Player 1 */}
            <div className={`p-4 flex justify-between items-center border-b border-gray-800 ${match.winner_id === match.player1_id ? 'bg-purple-600/20' : ''}`}>
              <span 
                onClick={(e) => { e.stopPropagation(); isAdmin && !isFinished && setSeedingSlot({ matchId: match.id, playerSide: 1 }); }} 
                className={`text-[11px] font-black uppercase truncate max-w-[180px] transition-colors relative z-10 ${isAdmin && !isFinished ? 'cursor-pointer hover:text-white' : ''} ${match.winner_id === match.player1_id ? 'text-purple-400' : 'text-gray-300'}`}
              >
                {p1?.username || "--- TBD ---"}
              </span>
              <button 
                onClick={openScoreModal}
                disabled={!isAdmin || isFinished || (!p1 && !p2)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-base transition-all relative z-10 ${isFinished || !isAdmin ? 'bg-gray-900 text-gray-500 cursor-default' : 'bg-gray-950 text-white border-2 border-gray-700 hover:border-purple-500 hover:bg-purple-900/30 cursor-pointer shadow-inner'}`}
              >
                {match.player1_score || 0}
              </button>
            </div>

            {/* Player 2 */}
            <div className={`p-4 flex justify-between items-center ${match.winner_id === match.player2_id ? 'bg-purple-600/20' : ''}`}>
              <span 
                onClick={(e) => { e.stopPropagation(); isAdmin && !isFinished && setSeedingSlot({ matchId: match.id, playerSide: 2 }); }} 
                className={`text-[11px] font-black uppercase truncate max-w-[180px] transition-colors relative z-10 ${isAdmin && !isFinished ? 'cursor-pointer hover:text-white' : ''} ${match.winner_id === match.player2_id ? 'text-purple-400' : 'text-gray-300'}`}
              >
                {p2?.username || "--- TBD ---"}
              </span>
              <button 
                onClick={openScoreModal}
                disabled={!isAdmin || isFinished || (!p1 && !p2)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-base transition-all relative z-10 ${isFinished || !isAdmin ? 'bg-gray-900 text-gray-500 cursor-default' : 'bg-gray-950 text-white border-2 border-gray-700 hover:border-purple-500 hover:bg-purple-900/30 cursor-pointer shadow-inner'}`}
              >
                {match.player2_score || 0}
              </button>
            </div>

            {/* Force Winner Button */}
            {isAdmin && !isFinished && (p1 || p2) && (
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedMatch(match); }} 
                className="w-full bg-purple-600/10 hover:bg-purple-600 text-purple-400 hover:text-white py-2 text-[9px] font-black uppercase transition-all tracking-widest border-t border-gray-800 relative z-10"
              >
                Force Victor
              </button>
            )}
            
          </div>
        </SeedItem>
      </Seed>
    );
  };

  const formattedRounds = Array.from(new Set(matches.map(m => m.round_number))).sort((a,b) => a-b).map(r => ({
    title: `Round ${r}`,
    seeds: matches.filter(m => m.round_number === r).sort((a,b) => a.match_number - b.match_number).map(m => ({
      id: m.id, date: "", teams: [], match: m
    }))
  }));

  if (loading && matches.length === 0) return <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center text-purple-500 font-black italic tracking-widest animate-pulse uppercase">Uplinking Data...</div>;
  if (!tournament) return <div className="min-h-screen bg-[#0b0e14] text-white flex items-center justify-center">Tournament not found.</div>;

  return (
    <>
      {/* MODALES DEL BRACKET */}
      {mounted && scoreModal && createPortal(
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md pointer-events-auto" onClick={() => setScoreModal(null)}>
          <div className="bg-[#121620] border-2 border-purple-500 p-10 rounded-[3rem] max-w-lg w-full shadow-[0_0_100px_rgba(168,85,247,0.4)]" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black italic uppercase text-white mb-2 text-center tracking-tighter">Report Combat Score</h3>
            <p className="text-[10px] text-gray-500 uppercase font-bold text-center mb-10 tracking-[0.2em]">Format: <span className="text-purple-400">{tournament.series_format || "Bo1"}</span></p>
            
            <div className="flex justify-between items-center gap-4 mb-10">
              <div className="flex flex-col items-center flex-1">
                <span className="text-[10px] font-black uppercase text-gray-300 mb-4 truncate w-full text-center italic">{participants.find(p => p.user_id === scoreModal.match.player1_id)?.profiles?.username || "TBD"}</span>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button onClick={() => setScoreModal({...scoreModal, p1Score: Math.max(0, scoreModal.p1Score - 1)})} className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-red-900/50 hover:border-red-500 font-black transition-all">-</button>
                  <input type="number" min="0" value={scoreModal.p1Score} onChange={(e) => setScoreModal({...scoreModal, p1Score: parseInt(e.target.value) || 0})} className="w-16 sm:w-20 h-16 sm:h-20 bg-[#0b0e14] border-2 border-gray-700 rounded-3xl text-center text-3xl sm:text-4xl font-black text-white outline-none focus:border-purple-500 transition-all shadow-inner" />
                  <button onClick={() => setScoreModal({...scoreModal, p1Score: scoreModal.p1Score + 1})} className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-green-900/50 hover:border-green-500 font-black transition-all">+</button>
                </div>
              </div>
              <span className="text-2xl font-black text-gray-800 italic mt-8 mx-2">VS</span>
              <div className="flex flex-col items-center flex-1">
                <span className="text-[10px] font-black uppercase text-gray-300 mb-4 truncate w-full text-center italic">{participants.find(p => p.user_id === scoreModal.match.player2_id)?.profiles?.username || "TBD"}</span>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button onClick={() => setScoreModal({...scoreModal, p2Score: Math.max(0, scoreModal.p2Score - 1)})} className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-red-900/50 hover:border-red-500 font-black transition-all">-</button>
                  <input type="number" min="0" value={scoreModal.p2Score} onChange={(e) => setScoreModal({...scoreModal, p2Score: parseInt(e.target.value) || 0})} className="w-16 sm:w-20 h-16 sm:h-20 bg-[#0b0e14] border-2 border-gray-700 rounded-3xl text-center text-3xl sm:text-4xl font-black text-white outline-none focus:border-purple-500 transition-all shadow-inner" />
                  <button onClick={() => setScoreModal({...scoreModal, p2Score: scoreModal.p2Score + 1})} className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-green-900/50 hover:border-green-500 font-black transition-all">+</button>
                </div>
              </div>
            </div>
            <button onClick={handleSaveScore} className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-purple-500 transition-all shadow-xl">Confirm Score</button>
            <button onClick={() => setScoreModal(null)} className="w-full mt-4 py-4 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-all tracking-[0.3em]">Cancel</button>
          </div>
        </div>,
        document.body
      )}

      {mounted && seedingSlot && createPortal(
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md pointer-events-auto" onClick={() => setSeedingSlot(null)}>
          <div className="bg-[#121620] border-2 border-purple-500/50 p-10 rounded-[3rem] max-w-2xl w-full shadow-[0_0_100px_rgba(168,85,247,0.3)]" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-black italic uppercase text-white mb-8 tracking-tighter">Assign Hunter</h3>
            <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
              {participants.map(p => <button key={p.id} onClick={() => swapPlayer(seedingSlot.matchId, seedingSlot.playerSide, p.user_id)} className="bg-[#0b0e14] border border-gray-800 hover:border-purple-600 hover:text-white p-5 rounded-2xl text-left font-black text-[11px] uppercase text-gray-400 transition-all truncate">{p.profiles?.username || "HUNTER DESCONOCIDO"}</button>)}
            </div>
            <button onClick={() => setSeedingSlot(null)} className="w-full mt-8 py-4 text-[11px] font-black uppercase text-gray-500 hover:text-white transition-all tracking-[0.4em]">Cancel</button>
          </div>
        </div>,
        document.body
      )}

      {mounted && selectedMatch && createPortal(
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md pointer-events-auto" onClick={() => setSelectedMatch(null)}>
          <div className="bg-[#121620] border-2 border-purple-500/50 p-10 rounded-[3rem] max-w-md w-full shadow-[0_0_100px_rgba(168,85,247,0.3)] text-center" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black italic uppercase text-white mb-10 tracking-tighter">Force Victor</h3>
            <div className="space-y-4">
              {[selectedMatch.player1_id, selectedMatch.player2_id].filter(Boolean).map(pid => {
                const p = participants.find(part => part.user_id === pid)?.profiles;
                return <button key={pid} onClick={() => forceWinner(selectedMatch.id, pid!)} className="w-full bg-[#0b0e14] border-2 border-gray-800 hover:bg-purple-600 hover:border-purple-400 p-6 rounded-3xl transition-all group flex justify-between items-center"><span className="font-black uppercase italic text-gray-300 group-hover:text-white text-lg">{p?.username || "TBD"}</span></button>
              })}
            </div>
            <button onClick={() => setSelectedMatch(null)} className="w-full mt-10 py-4 text-[11px] font-black uppercase text-gray-400 hover:text-white bg-gray-900 rounded-2xl transition-all tracking-widest">Abort Resolution</button>
          </div>
        </div>,
        document.body
      )}

      {/* =======================================================
          MAIN CONTENT (LANDING PAGE + BRACKET TAB)
          ======================================================= */}
      <main className="min-h-screen bg-[#0b0e14] text-gray-200 font-sans pb-20">
        
        {/* HERO SECTION */}
        <div className="relative h-[350px] overflow-hidden border-b border-gray-800">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] to-transparent z-10" />
          <div className="absolute inset-0 opacity-30 bg-[url('https://wallpaperaccess.com/full/1209700.jpg')] bg-cover bg-center" />
          
          <div className="relative z-20 max-w-7xl mx-auto h-full flex flex-col justify-end p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <span className="bg-purple-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">
                  {tournament.game} • {tournament.mode}
                </span>
                <h1 className="text-5xl md:text-7xl font-black uppercase italic text-white tracking-tighter leading-none mb-4">
                  {tournament.title}
                </h1>
                <div className="flex gap-6 text-gray-400 font-bold uppercase text-[11px] tracking-widest">
                  <span className="flex items-center gap-2"><CalendarIcon /> {tournament.start_date || "TBD"}</span>
                  <span className="flex items-center gap-2 text-purple-400"><TrophyIcon /> {tournament.reward_points || "100"} Points</span>
                  <span className="flex items-center gap-2 text-green-500"><UserIcon /> {participants.length} / {tournament.max_participants || "∞"} Joined</span>
                </div>
              </div>

              {/* BOTONES DE ACCIÓN RÁPIDA (Registro y Admin) */}
              <div className="flex flex-col gap-3 items-end">
                {mounted && isAdmin && (
                  <button 
                    onClick={scrollToBracket}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40"
                  >
                    <SettingsIcon /> CONFIGURE BRACKET
                  </button>
                )}
                
                {isRegistered ? (
                  <button 
                    onClick={handleUnregister}
                    disabled={isRegistering}
                    className="px-12 py-5 rounded-2xl font-black uppercase tracking-widest transition-all transform active:scale-95 shadow-2xl bg-[#1a1d2b] text-red-500 hover:bg-red-900/40 border border-red-900/50 hover:text-red-400"
                  >
                    {isRegistering ? "Processing..." : "Abort Mission (Leave)"}
                  </button>
                ) : (
                  <button 
                    onClick={handleRegister}
                    disabled={isRegistering}
                    className="px-12 py-5 rounded-2xl font-black uppercase tracking-widest transition-all transform active:scale-95 shadow-2xl bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/40"
                  >
                    {isRegistering ? "Registering..." : "Join Tournament"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TABS NAVEGACIÓN */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-10">
          <nav className="flex border-b border-gray-800 gap-10 overflow-x-auto relative z-30">
            {[
              { id: 'overview', label: 'Overview', show: true },
              { id: 'players', label: 'Participants', show: true },
              { id: 'bracket', label: isAdmin ? 'Manage Bracket' : 'Bracket', show: isAdmin || matches.length > 0 }
            ].filter(tab => tab.show).map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id ? "border-purple-500 text-white" : "border-transparent text-gray-500 hover:text-white"}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* CONTENIDO PRINCIPAL */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* TAB OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-12 animate-in fade-in duration-500">
                  <section>
                    <h2 className="text-2xl font-black uppercase italic text-white mb-6 tracking-tighter">Mission Rules</h2>
                    <div className="bg-[#121620] p-8 rounded-[2rem] border border-gray-800 text-gray-400 leading-relaxed font-medium whitespace-pre-wrap">
                      {tournament.rules || "No rules established for this operation yet."}
                    </div>
                  </section>
                  <section>
                    <h2 className="text-2xl font-black uppercase italic text-white mb-6 tracking-tighter">Bounty & Prizes</h2>
                    <div className="bg-[#121620] p-8 rounded-[2rem] border border-gray-800 text-gray-400 leading-relaxed font-medium whitespace-pre-wrap">
                      {tournament.prizes || "The rewards for this battleground are classified."}
                    </div>
                  </section>
                </div>
              )}

              {/* TAB PARTICIPANTS */}
              {activeTab === "players" && (
                <div className="animate-in fade-in duration-500 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {participants.length > 0 ? participants.map((p) => (
                    <div key={p.id} className="bg-[#121620] p-6 rounded-2xl border border-gray-800 flex items-center gap-4 group hover:border-purple-500/50 transition-all">
                      <div className="w-12 h-12 bg-[#0b0e14] rounded-xl flex items-center justify-center font-black text-purple-500 border border-gray-800">
                        #{participants.indexOf(p) + 1}
                      </div>
                      <span className="font-black text-white uppercase italic tracking-tighter text-lg">{p.profiles?.username || "HUNTER DESCONOCIDO"}</span>
                    </div>
                  )) : (
                    <p className="text-gray-500 italic uppercase font-bold tracking-widest">No hunters have joined the mission yet...</p>
                  )}
                </div>
              )}

              {/* TAB BRACKET */}
              {activeTab === "bracket" && (
                <div className="animate-in fade-in duration-500 w-full relative z-10">
                  
                  {/* BARRA DE CONTROL DEL BRACKET (EXCLUSIVA PARA ADMINS) */}
                  {isAdmin && (
                    <div className="bg-[#121620] p-8 rounded-[3rem] border border-purple-500/10 shadow-2xl mb-12 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
                        <div className="max-w-xl">
                          <button onClick={() => router.push('/admin')} className="text-[11px] font-black uppercase text-gray-500 mb-4 hover:text-white transition-all tracking-widest flex items-center gap-3 group"><span className="group-hover:-translate-x-2 transition-transform italic text-lg">←</span> Return to Dashboard</button>
                          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">{tournament.title}</h2>
                          <div className="flex gap-4 items-center flex-wrap">
                            <span className="text-[11px] font-black text-purple-500 uppercase tracking-[0.4em] italic">{tournament.series_format || "Bo1"} MODE</span>
                            <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                            <span className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em]">{participants.length} UNITS</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 bg-gray-950 p-4 rounded-[2rem] border border-gray-800 shadow-2xl">
                          <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Link Copied!"); }} className="bg-gray-900 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all border border-gray-700">Share Link</button>
                          
                          {matches.length === 0 && (
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col px-4 border-r border-gray-800 border-l border-gray-800">
                                <label className="text-[9px] font-black uppercase text-gray-600 mb-1 italic">Batch</label>
                                <input type="number" value={dummyToAddCount} onChange={(e) => setDummyToAddCount(Math.max(1, parseInt(e.target.value)))} className="bg-transparent text-purple-400 text-sm font-black w-10 outline-none" />
                              </div>
                              <button onClick={fillWithDummies} className="bg-white text-black px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all">Deploy Dummies</button>
                            </div>
                          )}
                          
                          <button onClick={generateBracket} className="bg-purple-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-purple-400 transition-all shadow-xl shadow-purple-900/50">
                            {matches.length > 0 ? "Purge Map" : "Initialize Map"}
                          </button>
                        </div>
                    </div>
                  )}

                  {/* VISOR DEL BRACKET PROTEGIDO */}
                  <div className="w-full bg-[#121620] p-6 md:p-10 rounded-[3rem] border-2 border-gray-900/50 shadow-2xl overflow-hidden min-h-[700px] flex flex-col relative z-0">
                    <h3 className="text-sm font-black uppercase italic text-gray-500 mb-12 border-b border-gray-800 pb-8 tracking-[0.6em] text-center">Live Operational Tactical Deployment Map</h3>
                    {mounted && matches.length > 0 ? (
                      <div className="flex-1 overflow-x-auto custom-scrollbar pt-10 w-full pb-10">
                        <Bracket rounds={formattedRounds} renderSeedComponent={CustomSeed} />
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center border-4 border-dashed border-gray-900/30 rounded-[3rem] bg-[#0b0e14]/20 p-10 md:p-20 text-center">
                          <p className="text-gray-700 text-lg font-black uppercase tracking-[0.6em] italic mb-6">No Tactical Data Detected</p>
                          <div className="flex gap-6 overflow-x-auto max-w-full pb-4">
                              {participants.map(p => (
                                  <div key={p.id} className="bg-[#0b0e14] border border-gray-800 px-6 py-3 rounded-xl text-[10px] font-black uppercase italic text-gray-500 shrink-0">{p.profiles?.username || "HUNTER DESCONOCIDO"}</div>
                              ))}
                          </div>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* SIDEBAR DE INFORMACIÓN RÁPIDA DE LA LANDING PAGE */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#121620] p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl">
                <h3 className="text-[11px] font-black uppercase text-purple-500 tracking-[0.5em] italic mb-8">Intelligence</h3>
                <div className="space-y-6">
                  {[
                    { label: "Server/Region", value: tournament.region || "Global" },
                    { label: "Map", value: tournament.map || "Standard" },
                    { label: "Format", value: tournament.series_format || "BO1" },
                    { label: "Check-in", value: tournament.check_in || "Disabled" }
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between border-b border-gray-800 pb-4">
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{item.label}</span>
                      <span className="text-[11px] font-black text-white uppercase italic text-right pl-4">{item.value}</span>
                    </div>
                  ))}
                </div>
                
                {tournament.discord_link && (
                  <div className="mt-10 p-6 bg-[#0b0e14] rounded-2xl border border-gray-800">
                    <p className="text-[9px] font-bold text-gray-500 uppercase mb-2 tracking-widest text-center">Support Contact</p>
                    <a 
                      href={tournament.discord_link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="block text-center text-purple-400 font-black uppercase text-[11px] hover:text-purple-300 transition-all truncate"
                    >
                      Join Official Discord
                    </a>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}