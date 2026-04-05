import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const RIOT_API_KEY = process.env.RIOT_API_KEY;

// Inicialización ultra-segura de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ puuid: string }> }
) {
  const { puuid } = await params;

  // 1. Validar API Key antes de empezar
  if (!RIOT_API_KEY) {
    console.error("CRITICAL: RIOT_API_KEY is not defined in .env.local");
    return NextResponse.json({ error: "Configuración del servidor incompleta (API Key)" }, { status: 500 });
  }

  try {
    // 2. Obtener Región del perfil
    let region = "LAN";
    const { data: profile, error: dbError } = await supabase
      .from('profiles')
      .select('lol_region')
      .eq('riot_puuid', puuid)
      .single();
    
    if (profile?.lol_region) region = profile.lol_region;

    const platformMap: { [key: string]: string } = {
      'LAN': 'la1', 'LAS': 'la2', 'NA': 'na1', 'BR': 'br1', 'EUW': 'euw1', 'EUNE': 'eun1', 'KR': 'kr', 'JP': 'jp1'
    };
    const clusterMap: { [key: string]: string } = {
      'LAN': 'americas', 'LAS': 'americas', 'NA': 'americas', 'BR': 'americas',
      'EUW': 'europe', 'EUNE': 'europe', 'KR': 'asia', 'JP': 'asia'
    };

    const platform = platformMap[region] || 'la1';
    const cluster = clusterMap[region] || 'americas';

    // 3. Obtener datos del Invocador
    const summonerUrl = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${RIOT_API_KEY}`;
    const summRes = await fetch(summonerUrl);
    
    if (!summRes.ok) {
      const errorText = await summRes.text();
      console.error("Riot Summoner Error:", errorText);
      return NextResponse.json({ error: `Riot dice: ${summRes.status}` }, { status: summRes.status });
    }
    const summData = await summRes.json();

    // 4. Llamadas de Datos Extendidos (Maestría, Rango, Historial)
    // Usamos Promise.allSettled para que si una falla, las demás sigan
    const [leagueRes, masteryRes, matchesRes] = await Promise.all([
      fetch(`https://${platform}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summData.id}?api_key=${RIOT_API_KEY}`),
      fetch(`https://${platform}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=5&api_key=${RIOT_API_KEY}`),
      fetch(`https://${cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${RIOT_API_KEY}`)
    ]);

    const leagueData = leagueRes.ok ? await leagueRes.json() : [];
    const masteryData = masteryRes.ok ? await masteryRes.json() : [];
    const matchIds = matchesRes.ok ? await matchesRes.json() : [];

    // 5. Detalle de partidas
    const matchDetails = await Promise.all(
      (Array.isArray(matchIds) ? matchIds : []).map(async (id: string) => {
        const res = await fetch(`https://${cluster}.api.riotgames.com/lol/match/v5/matches/${id}?api_key=${RIOT_API_KEY}`);
        return res.ok ? res.json() : null;
      })
    );

    // 6. RESPUESTA SIEMPRE EN JSON
    return NextResponse.json({
      summoner: summData,
      rank: Array.isArray(leagueData) ? leagueData : [],
      mastery: Array.isArray(masteryData) ? masteryData : [],
      matches: matchDetails.filter(m => m !== null),
      region
    });

  } catch (error: any) {
    console.error("API ROUTE FATAL ERROR:", error.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}