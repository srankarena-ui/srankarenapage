import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// CRÍTICO: Evita que Vercel guarde caché viejo
export const dynamic = 'force-dynamic'; 

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ puuid: string }> }
) {
  const { puuid } = await params;

  if (!RIOT_API_KEY) {
    return NextResponse.json({ error: "Falta la API Key de Riot" }, { status: 500 });
  }

  try {
    let region = "LAN";
    const { data: profile } = await supabase.from('profiles').select('lol_region').eq('riot_puuid', puuid).single();
    if (profile?.lol_region) region = profile.lol_region;

    const platformMap: { [key: string]: string } = { 'LAN': 'la1', 'LAS': 'la2', 'NA': 'na1', 'BR': 'br1', 'EUW': 'euw1', 'EUNE': 'eun1', 'KR': 'kr', 'JP': 'jp1' };
    const clusterMap: { [key: string]: string } = { 'LAN': 'americas', 'LAS': 'americas', 'NA': 'americas', 'BR': 'americas', 'EUW': 'europe', 'EUNE': 'europe', 'KR': 'asia', 'JP': 'asia' };

    const platform = platformMap[region] || 'la1';
    const cluster = clusterMap[region] || 'americas';

    // 1. Obtener Datos del Invocador y Nombre de Cuenta
    const [summRes, accountRes] = await Promise.all([
      fetch(`https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${RIOT_API_KEY}`, { cache: 'no-store' }),
      fetch(`https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}?api_key=${RIOT_API_KEY}`, { cache: 'no-store' })
    ]);

    const summData = summRes.ok ? await summRes.json() : {};
    const accountData = accountRes.ok ? await accountRes.json() : null;

    const enhancedSummoner = {
        ...summData,
        name: accountData?.gameName || summData.name || "Invocador",
        tagLine: accountData?.tagLine || region
    };

    // 2. Obtener Historial
    const matchesRes = await fetch(`https://${cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${RIOT_API_KEY}`, { cache: 'no-store' });
    const matchIds = matchesRes.ok ? await matchesRes.json() : [];

    const matchDetails = await Promise.all(
      (Array.isArray(matchIds) ? matchIds : []).map(async (id: string) => {
        const res = await fetch(`https://${cluster}.api.riotgames.com/lol/match/v5/matches/${id}?api_key=${RIOT_API_KEY}`, { cache: 'no-store' });
        return res.ok ? res.json() : null;
      })
    );
    const validMatches = matchDetails.filter(m => m !== null);

    // 3. OBTENER RANGO (LA SOLUCIÓN DEFINITIVA USANDO LA NUEVA RUTA BY-PUUID)
    const leagueUrl = `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}?api_key=${RIOT_API_KEY}`;
    const leagueRes = await fetch(leagueUrl, { cache: 'no-store' });
    
    let leagueData = [];
    let debugObj = { status: leagueRes.status.toString(), type: "by-puuid" };
    
    if (leagueRes.ok) {
        leagueData = await leagueRes.json();
    } else {
        debugObj.status += " " + await leagueRes.text();
    }

    // 4. Obtener Maestría
    const masteryRes = await fetch(`https://${platform}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=5&api_key=${RIOT_API_KEY}`, { cache: 'no-store' });
    const masteryData = masteryRes.ok ? await masteryRes.json() : [];

    return NextResponse.json({
      summoner: enhancedSummoner,
      rank: Array.isArray(leagueData) ? leagueData : [],
      mastery: Array.isArray(masteryData) ? masteryData : [],
      matches: validMatches,
      region: enhancedSummoner.tagLine,
      _debug: debugObj
    });

  } catch (error: any) {
    return NextResponse.json({ error: "Error interno del servidor", details: error.message }, { status: 500 });
  }
}