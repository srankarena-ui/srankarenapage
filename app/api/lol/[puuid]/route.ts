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

  if (!RIOT_API_KEY) {
    return NextResponse.json({ error: "Configuración del servidor incompleta (API Key)" }, { status: 500 });
  }

  try {
    let region = "LAN";
    const { data: profile } = await supabase
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

    // 1. Obtener Datos del Invocador y Nombre de Cuenta (Riot ID) en paralelo
    const [summRes, accountRes] = await Promise.all([
      fetch(`https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${RIOT_API_KEY}`),
      fetch(`https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}?api_key=${RIOT_API_KEY}`)
    ]);

    if (!summRes.ok) {
      return NextResponse.json({ error: `Riot dice: ${summRes.status}` }, { status: summRes.status });
    }
    
    const summData = await summRes.json();
    const accountData = accountRes.ok ? await accountRes.json() : null;

    // Reconstruimos el invocador con su Riot ID real
    const enhancedSummoner = {
        ...summData,
        name: accountData?.gameName || summData.name || "Invocador",
        tagLine: accountData?.tagLine || region
    };

    // 2. Obtener Historial y Maestría
    const [masteryRes, matchesRes] = await Promise.all([
      fetch(`https://${platform}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=5&api_key=${RIOT_API_KEY}`),
      fetch(`https://${cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${RIOT_API_KEY}`)
    ]);

    const masteryData = masteryRes.ok ? await masteryRes.json() : [];
    const matchIds = matchesRes.ok ? await matchesRes.json() : [];

    // 3. Detalle de partidas
    const matchDetails = await Promise.all(
      (Array.isArray(matchIds) ? matchIds : []).map(async (id: string) => {
        const res = await fetch(`https://${cluster}.api.riotgames.com/lol/match/v5/matches/${id}?api_key=${RIOT_API_KEY}`);
        return res.ok ? res.json() : null;
      })
    );
    const validMatches = matchDetails.filter(m => m !== null);

    // 4. EL TRUCO: Extraemos el ID faltante de Riot desde la última partida jugada
    let realSummonerId = summData.id;
    if (!realSummonerId && validMatches.length > 0) {
        const p = validMatches[0].info.participants.find((part: any) => part.puuid === puuid);
        if (p && p.summonerId) realSummonerId = p.summonerId;
    }

    // 5. Obtener el Rango con el ID extraído
    let leagueData = [];
    if (realSummonerId) {
        const leagueRes = await fetch(`https://${platform}.api.riotgames.com/lol/league/v4/entries/by-summoner/${realSummonerId}?api_key=${RIOT_API_KEY}`);
        if (leagueRes.ok) leagueData = await leagueRes.json();
    } else {
        // Fallback por si acaso
        const leagueRes = await fetch(`https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}?api_key=${RIOT_API_KEY}`);
        if (leagueRes.ok) leagueData = await leagueRes.json();
    }

    return NextResponse.json({
      summoner: enhancedSummoner,
      rank: Array.isArray(leagueData) ? leagueData : [],
      mastery: Array.isArray(masteryData) ? masteryData : [],
      matches: validMatches,
      region: enhancedSummoner.tagLine // Usamos el Tag real (ej: LAN o TRICK)
    });

  } catch (error: any) {
    console.error("API ROUTE FATAL ERROR:", error.message);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}