import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  if (!RIOT_API_KEY) {
    return NextResponse.json({ error: "Falta la API Key de Riot en el servidor." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { matchId, player1_id, player2_id } = body;

    if (!matchId || !player1_id || !player2_id) {
      return NextResponse.json({ error: "Faltan datos del bracket." }, { status: 400 });
    }

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, riot_puuid, lol_region')
      .in('id', [player1_id, player2_id]);

    if (profileError || !profiles || profiles.length !== 2) {
      return NextResponse.json({ error: "No se encontraron los perfiles en la BD." }, { status: 404 });
    }

    const p1 = profiles.find(p => p.id === player1_id);
    const p2 = profiles.find(p => p.id === player2_id);

    if (!p1?.riot_puuid || !p2?.riot_puuid) {
      return NextResponse.json({ error: "Un Hunter no tiene PUUID." }, { status: 400 });
    }

    const cluster = 'americas'; // LAN, LAS, NA y BR comparten este cluster para el historial
    
    // Traemos 20 partidas por si acaso
    const histRes = await fetch(`https://${cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/${p1.riot_puuid}/ids?start=0&count=20&api_key=${RIOT_API_KEY}`, { cache: 'no-store' });
    if (!histRes.ok) throw new Error(`Riot API Error: ${histRes.status}`);
    const matchIds = await histRes.json();

    if (matchIds.length === 0) {
      return NextResponse.json({ error: "Riot dice que el historial de este jugador está completamente vacío." }, { status: 404 });
    }

    let matchData = null;
    let foundId = null;
    let debugInfo: string[] = []; // Array para guardar qué pasó con cada partida

    for (const id of matchIds) {
      const matchRes = await fetch(`https://${cluster}.api.riotgames.com/lol/match/v5/matches/${id}?api_key=${RIOT_API_KEY}`, { cache: 'no-store' });
      if (!matchRes.ok) continue;
      
      const data = await matchRes.json();
      const gameType = data.info.gameType; // Ej: CUSTOM_GAME, MATCHED_GAME
      const participantPuuids = data.metadata.participants;
      
      const p1InGame = participantPuuids.includes(p1.riot_puuid);
      const p2InGame = participantPuuids.includes(p2.riot_puuid);

      // Agregamos info al debug
      debugInfo.push(`ID: ${id} | Tipo: ${gameType} | Ambos Jugadores: ${p1InGame && p2InGame ? 'SÍ' : 'NO'}`);

      // Ahora NO saltaremos si no es custom, simplemente buscaremos si los dos jugadores coinciden
      if (p1InGame && p2InGame) {
        foundId = id;
        matchData = data;
        break; 
      }
    }

    if (!matchData) {
      return NextResponse.json({ 
        error: "Riot no encontró ninguna partida (Custom o Normal) donde estos dos PUUIDs coincidan recientemente.",
        debug_log: debugInfo.slice(0, 5) // Mostramos las últimas 5 partidas analizadas
      }, { status: 404 });
    }

    // Validación de Objetivos
    const p1Stats = matchData.info.participants.find((p: any) => p.puuid === p1.riot_puuid);
    const p2Stats = matchData.info.participants.find((p: any) => p.puuid === p2.riot_puuid);

    const p1CS = p1Stats.totalMinionsKilled + (p1Stats.neutralMinionsKilled || 0);
    const p2CS = p2Stats.totalMinionsKilled + (p2Stats.neutralMinionsKilled || 0);

    const p1Wins = p1Stats.firstBloodKill || p1Stats.kills >= 1 || p1CS >= 100 || p1Stats.turretsKilled >= 1;
    const p2Wins = p2Stats.firstBloodKill || p2Stats.kills >= 1 || p2CS >= 100 || p2Stats.turretsKilled >= 1;

    if (!p1Wins && !p2Wins) {
      return NextResponse.json({ 
        error: `Encontramos la partida (${foundId}) pero fue un Remake/Empate técnico.\nP1: ${p1Stats.kills} Kills, ${p1CS} CS.\nP2: ${p2Stats.kills} Kills, ${p2CS} CS.` 
      }, { status: 400 });
    }

    const finalWinnerId = p1Wins ? player1_id : player2_id;

    return NextResponse.json({ success: true, winner_id: finalWinnerId, match_id: foundId });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}