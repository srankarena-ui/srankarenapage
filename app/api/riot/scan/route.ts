import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  if (!RIOT_API_KEY) {
    return NextResponse.json({ error: "Falta la API Key de Riot." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { matchId, player1_id, player2_id, providedMatchId } = body;

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, riot_puuid, lol_region')
      .in('id', [player1_id, player2_id]);

    if (!profiles || profiles.length !== 2) {
      return NextResponse.json({ error: "Perfiles no encontrados en la base de datos." }, { status: 404 });
    }

    const p1 = profiles.find(p => p.id === player1_id);
    const p2 = profiles.find(p => p.id === player2_id);

    const clusterMap: Record<string, string> = {
      'LAN': 'americas', 'LAS': 'americas', 'NA': 'americas', 'BR': 'americas',
      'EUW': 'europe', 'EUNE': 'europe', 'KR': 'asia', 'JP': 'asia'
    };
    const cluster = clusterMap[p1?.lol_region || 'LAN'] || 'americas';

    // Mapeo de prefijos de Riot (Platform IDs)
    const platformMap: Record<string, string> = {
      'LAN': 'LA1', 'LAS': 'LA2', 'NA': 'NA1', 'BR': 'BR1',
      'EUW': 'EUW1', 'EUNE': 'EUN1', 'KR': 'KR', 'JP': 'JP1'
    };
    const platformPrefix = platformMap[p1?.lol_region || 'LAN'] || 'LA1';

    let matchData = null;
    let foundId = null;

    // 🎯 MODO FRANCOTIRADOR BLINDADO CONTRA NÚMEROS CRUDOS
    if (providedMatchId) {
      let cleanId = providedMatchId.trim();

      // Si el usuario solo puso los números (ej: 1708151630), le agregamos automáticamente el prefijo (ej: LA1_1708151630)
      if (!cleanId.includes('_')) {
         cleanId = `${platformPrefix}_${cleanId}`;
      }

      foundId = cleanId;
      
      const res = await fetch(`https://${cluster}.api.riotgames.com/lol/match/v5/matches/${cleanId}?api_key=${RIOT_API_KEY}`, { cache: 'no-store' });
      
      if (!res.ok) {
        return NextResponse.json({ error: `Riot no reconoce el Match ID: '${cleanId}'.\nCódigo de error de Riot: ${res.status}` }, { status: 404 });
      }
      
      matchData = await res.json();

      // VERIFICACIÓN DE IDENTIDAD EXTREMA
      const participantsPuuids = matchData.metadata.participants;
      if (!participantsPuuids.includes(p1?.riot_puuid) || !participantsPuuids.includes(p2?.riot_puuid)) {
         return NextResponse.json({ 
            error: `La partida ${cleanId} existe y fue descargada con éxito, pero los PUUIDs de los jugadores no coinciden.\n\n` +
                   `Jugador 1 registrado: ${p1?.riot_puuid?.substring(0, 10)}...\n` +
                   `Jugador 2 registrado: ${p2?.riot_puuid?.substring(0, 10)}...\n` +
                   `Riot dice que jugaron: ${participantsPuuids[0]?.substring(0, 10)}... y ${participantsPuuids[1]?.substring(0, 10)}...\n\n` +
                   `¿Están usando cuentas smurfs no vinculadas a la web?` 
         }, { status: 400 });
      }

    } else {
      // MODO RADAR AUTOMÁTICO
      const histRes = await fetch(`https://${cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/${p1?.riot_puuid}/ids?start=0&count=15&api_key=${RIOT_API_KEY}`, { cache: 'no-store' });
      if (!histRes.ok) return NextResponse.json({ error: `Error conectando con el historial de Riot (Status: ${histRes.status}).` }, { status: 500 });
      const matchIds = await histRes.json();

      for (const id of matchIds) {
        const mRes = await fetch(`https://${cluster}.api.riotgames.com/lol/match/v5/matches/${id}?api_key=${RIOT_API_KEY}`, { cache: 'no-store' });
        const data = await mRes.json();
        if (data?.metadata?.participants?.includes(p1?.riot_puuid) && data?.metadata?.participants?.includes(p2?.riot_puuid)) {
          foundId = id;
          matchData = data;
          break;
        }
      }
    }

    if (!matchData) return NextResponse.json({ error: "No se detectó el duelo entre estos jugadores en el historial reciente." }, { status: 404 });

    const p1Stats = matchData.info.participants.find((p: any) => p.puuid === p1?.riot_puuid);
    const p2Stats = matchData.info.participants.find((p: any) => p.puuid === p2?.riot_puuid);

    const p1CS = (p1Stats?.totalMinionsKilled || 0) + (p1Stats?.neutralMinionsKilled || 0);
    const p2CS = (p2Stats?.totalMinionsKilled || 0) + (p2Stats?.neutralMinionsKilled || 0);

    // LOGICA DE VICTORIA
    const p1Wins = p1Stats?.firstBloodKill || p1Stats?.kills >= 1 || p1CS >= 100 || p1Stats?.turretsKilled >= 1;
    const p2Wins = p2Stats?.firstBloodKill || p2Stats?.kills >= 1 || p2CS >= 100 || p2Stats?.turretsKilled >= 1;

    if (!p1Wins && !p2Wins) return NextResponse.json({ error: "Encontramos la partida, pero nadie cumplió los objetivos (0 Kills, <100 CS, 0 Torres). Es un Remake." }, { status: 400 });

    return NextResponse.json({ success: true, winner_id: p1Wins ? player1_id : player2_id, match_id: foundId });

  } catch (error: any) {
    return NextResponse.json({ error: "Error Interno: " + error.message }, { status: 500 });
  }
}