import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Inicializamos el cliente dentro de la función para evitar errores en el build
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const riotApiKey = process.env.RIOT_API_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { userId, puuid, region } = await request.json();

  try {
    const { data: profile } = await supabase.from('profiles').select('riot_linked_at').eq('id', userId).single();
    const cluster = region === 'EUW' ? 'europe' : 'americas';
    
    const matchesRes = await fetch(`https://${cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${riotApiKey}`);
    const matchIds = await matchesRes.json();

    let processedCount = 0;

    for (const mId of matchIds) {
      const mRes = await fetch(`https://${cluster}.api.riotgames.com/lol/match/v5/matches/${mId}?api_key=${riotApiKey}`);
      const mData = await mRes.json();

      if (!mData.info) continue;

      const gameEndTime = mData.info.gameEndTimestamp;
      const linkedAtTime = new Date(profile.riot_linked_at).getTime();

      if (gameEndTime > linkedAtTime) {
        const p = mData.info.participants.find((part: any) => part.puuid === puuid);
        if (p) {
          await supabase.rpc('sync_match_stats', {
            p_user_id: userId,
            p_match_id: mId,
            p_kills: p.kills,
            p_double_kills: p.doubleKills,
            p_triple_kills: p.tripleKills,
            p_quadra_kills: p.quadraKills,
            p_penta_kills: p.pentaKills,
            p_first_bloods: p.firstBloodKill ? 1 : 0,
            p_max_crit: p.largestCriticalStrike,
            p_dmg_champs: p.totalDamageDealtToChampions,
            p_dmg_structs: p.damageDealtToTurrets,
            p_dmg_objs: p.damageDealtToObjectives,
            p_nashors: p.baronKills,
            p_heralds: p.firstTowerKill ? 1 : 0,
            p_voidgrubs: p.challenges?.hordeKills || 0,
            p_elders: p.challenges?.elderDragonKillsWithOpposingSoul || 0,
            p_infernal: p.challenges?.infernalDragonKills || 0,
            p_mountain: p.challenges?.mountainDragonKills || 0,
            p_cloud: p.challenges?.cloudDragonKills || 0,
            p_ocean: p.challenges?.oceanDragonKills || 0,
            p_hextech: p.challenges?.hextechDragonKills || 0,
            p_chemtech: p.challenges?.chemtechDragonKills || 0,
            p_flash: p.summoner1Id === 4 ? p.summoner1Casts : (p.summoner2Id === 4 ? p.summoner2Casts : 0),
            p_ignite: p.summoner1Id === 14 ? p.summoner1Casts : (p.summoner2Id === 14 ? p.summoner2Casts : 0),
            p_smite: p.summoner1Id === 11 ? p.summoner1Casts : (p.summoner2Id === 11 ? p.summoner2Casts : 0),
            p_ping_missing: p.enemyMissingPings || 0,
            p_ping_omw: p.onMyWayPings || 0,
            p_ping_danger: p.dangerPings || 0,
            p_wards_placed: p.wardsPlaced,
            p_wards_killed: p.wardsKilled,
            p_pinks: p.detectorWardsPlaced,
            p_heal_allies: p.totalHealsOnTeammates,
            p_shield_allies: p.totalDamageShieldedOnTeammates,
            p_cc_time: p.totalTimeCCDealt
          });
          processedCount++;
        }
      }
    }

    return NextResponse.json({ success: true, new_matches: processedCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}