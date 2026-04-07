import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const CR_API_KEY = process.env.CR_API_KEY; 
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: Request) {
  try {
    const { matchId, player1_id, player2_id } = await request.json();

    // 1. Obtener datos del match y perfiles
    const { data: matchData } = await supabase.from('tournament_matches').select('created_at, updated_at').eq('id', matchId).single();
    const { data: profiles } = await supabase.from('profiles').select('id, cr_tag').in('id', [player1_id, player2_id]);

    const p1 = profiles?.find(p => p.id === player1_id);
    const p2 = profiles?.find(p => p.id === player2_id);
    const matchStartTime = new Date(matchData.updated_at || matchData.created_at).getTime();

    const cleanTag1 = p1.cr_tag.replace('#', '').toUpperCase();
    const cleanTag2 = p2.cr_tag.replace('#', '').toUpperCase();

    // 2. Llamada a Supercell
    const response = await fetch(`https://proxy.royaleapi.dev/v1/players/%23${cleanTag1}/battlelog`, {
        headers: { 'Authorization': `Bearer ${CR_API_KEY}` },
        cache: 'no-store'
    });

    const battleLog = await response.json();
    
    // 3. Filtrar por batallas NUEVAS (después de la creación del match)
    const validBattles = battleLog.filter((battle: any) => {
        const battleTime = parseCRTime(battle.battleTime);
        const isAgainstOpponent = battle.opponent?.[0]?.tag?.replace('#','') === cleanTag2;
        return isAgainstOpponent && battle.type === 'friendly' && battleTime > matchStartTime;
    });

    if (validBattles.length === 0) {
        return NextResponse.json({ error: "No se han detectado batallas nuevas todavía." }, { status: 404 });
    }

    // Tomamos la más reciente de las válidas
    const latestBattle = validBattles[0];
    const winnerId = latestBattle.team[0].crowns > latestBattle.opponent[0].crowns ? player1_id : player2_id;

    return NextResponse.json({ 
        success: true, 
        winner_id: winnerId,
        battleTime: latestBattle.battleTime,
        crowns: `${latestBattle.team[0].crowns}-${latestBattle.opponent[0].crowns}`
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Función para convertir el formato de tiempo raro de Supercell (ISO8601 comprimido) a Timestamp
function parseCRTime(crTime: string) {
    const y = crTime.substring(0, 4);
    const m = crTime.substring(4, 6);
    const d = crTime.substring(6, 8);
    const th = crTime.substring(9, 11);
    const tm = crTime.substring(11, 13);
    const ts = crTime.substring(13, 15);
    return new Date(`${y}-${m}-${d}T${th}:${tm}:${ts}Z`).getTime();
}