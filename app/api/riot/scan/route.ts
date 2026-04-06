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
      return NextResponse.json({ error: "Faltan datos de los jugadores o del bracket." }, { status: 400 });
    }

    // 1. Obtener los PUUIDs de ambos jugadores desde Supabase
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, riot_puuid, lol_region')
      .in('id', [player1_id, player2_id]);

    if (profileError || !profiles || profiles.length !== 2) {
      return NextResponse.json({ error: "No se encontraron los perfiles de LoL de ambos jugadores." }, { status: 404 });
    }

    const p1 = profiles.find(p => p.id === player1_id);
    const p2 = profiles.find(p => p.id === player2_id);

    if (!p1?.riot_puuid || !p2?.riot_puuid) {
      return NextResponse.json({ error: "Uno de los jugadores no tiene su cuenta de LoL vinculada." }, { status: 400 });
    }

    // 2. Determinar Cluster de Riot
    const clusterMap: { [key: string]: string } = {
      'LAN': 'americas', 'LAS': 'americas', 'NA': 'americas', 'BR': 'americas',
      'EUW': 'europe', 'EUNE': 'europe', 'KR': 'asia', 'JP': 'asia'
    };
    const cluster = clusterMap[p1.lol_region || 'LAN'] || 'americas';

    // 3. Buscar las últimas partidas del Jugador 1
    const histRes = await fetch(`https://${cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/${p1.riot_puuid}/ids?start=0&count=15&api_key=${RIOT_API_KEY}`, { cache: 'no-store' });
    if (!histRes.ok) throw new Error("Error al consultar el historial de Riot.");
    const matchIds = await histRes.json();

    // 4. Buscar la partida Custom que coincida con ambos PUUIDs
    let matchData = null;
    let foundId = null;

    for (const id of matchIds) {
      const matchRes = await fetch(`https://${cluster}.api.riotgames.com/lol/match/v5/matches/${id}?api_key=${RIOT_API_KEY}`, { cache: 'no-store' });
      if (!matchRes.ok) continue;
      
      const data = await matchRes.json();
      
      // Filtro: Partida personalizada
      if (data.info.gameType !== "CUSTOM_GAME") continue;

      const participantPuuids = data.metadata.participants;
      
      if (participantPuuids.includes(p1.riot_puuid) && participantPuuids.includes(p2.riot_puuid)) {
        foundId = id;
        matchData = data;
        break; 
      }
    }

    if (!matchData) {
      return NextResponse.json({ error: "No se encontró partida 1v1 reciente entre estos jugadores." }, { status: 404 });
    }

    // 5. Lógica de victoria (1 Kill, 100 CS o 1 Torre)
    const p1Stats = matchData.info.participants.find((p: any) => p.puuid === p1.riot_puuid);
    const p2Stats = matchData.info.participants.find((p: any) => p.puuid === p2.riot_puuid);

    const p1CS = p1Stats.totalMinionsKilled + (p1Stats.neutralMinionsKilled || 0);
    const p2CS = p2Stats.totalMinionsKilled + (p2Stats.neutralMinionsKilled || 0);

    const p1Wins = p1Stats.firstBloodKill || p1Stats.kills >= 1 || p1CS >= 100 || p1Stats.turretsKilled >= 1;
    const p2Wins = p2Stats.firstBloodKill || p2Stats.kills >= 1 || p2CS >= 100 || p2Stats.turretsKilled >= 1;

    if (!p1Wins && !p2Wins) {
      return NextResponse.json({ error: "Partida en curso o empate técnico (ningún objetivo cumplido)." }, { status: 400 });
    }

    const finalWinnerId = p1Wins ? player1_id : player2_id;

    return NextResponse.json({
      success: true,
      winner_id: finalWinnerId,
      match_id: foundId
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}