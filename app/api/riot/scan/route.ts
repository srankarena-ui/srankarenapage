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
      return NextResponse.json({ error: "Perfiles no encontrados." }, { status: 404 });
    }

    const p1 = profiles.find(p => p.id === player1_id);
    const p2 = profiles.find(p => p.id === player2_id);
    const cluster = 'americas';

    let matchData = null;
    let foundId = providedMatchId || null;

    // MODO FRANCOTIRADOR: Si nos dan el ID, vamos directo a él
    if (providedMatchId) {
      const res = await fetch(`https://${cluster}.api.riotgames.com/lol/match/v5/matches/${providedMatchId}?api_key=${RIOT_API_KEY}`, { cache: 'no-store' });
      if (!res.ok) return NextResponse.json({ error: "El Match ID proporcionado no existe en Riot." }, { status: 404 });
      matchData = await res.json();
    } else {
      // MODO RADAR: Buscamos en el historial
      const histRes = await fetch(`https://${cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/${p1?.riot_puuid}/ids?start=0&count=15&api_key=${RIOT_API_KEY}`, { cache: 'no-store' });
      const matchIds = await histRes.json();

      for (const id of matchIds) {
        const mRes = await fetch(`https://${cluster}.api.riotgames.com/lol/match/v5/matches/${id}?api_key=${RIOT_API_KEY}`, { cache: 'no-store' });
        const data = await mRes.json();
        if (data.metadata.participants.includes(p1?.riot_puuid) && data.metadata.participants.includes(p2?.riot_puuid)) {
          foundId = id;
          matchData = data;
          break;
        }
      }
    }

    if (!matchData) return NextResponse.json({ error: "No se detectó el duelo entre estos jugadores." }, { status: 404 });

    const p1Stats = matchData.info.participants.find((p: any) => p.puuid === p1?.riot_puuid);
    const p2Stats = matchData.info.participants.find((p: any) => p.puuid === p2?.riot_puuid);

    const p1CS = (p1Stats?.totalMinionsKilled || 0) + (p1Stats?.neutralMinionsKilled || 0);
    const p2CS = (p2Stats?.totalMinionsKilled || 0) + (p2Stats?.neutralMinionsKilled || 0);

    const p1Wins = p1Stats?.firstBloodKill || p1Stats?.kills >= 1 || p1CS >= 100 || p1Stats?.turretsKilled >= 1;
    const p2Wins = p2Stats?.firstBloodKill || p2Stats?.kills >= 1 || p2CS >= 100 || p2Stats?.turretsKilled >= 1;

    if (!p1Wins && !p2Wins) return NextResponse.json({ error: "Partida sin objetivos cumplidos (Remake)." }, { status: 400 });

    return NextResponse.json({ success: true, winner_id: p1Wins ? player1_id : player2_id, match_id: foundId });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}