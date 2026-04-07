import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const CR_API_KEY = process.env.CR_API_KEY; 
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  if (!CR_API_KEY) {
    return NextResponse.json({ error: "Falta la API Key de Clash Royale en Vercel." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { player1_id, player2_id } = body;

    // 1. Buscamos los Tags en Supabase
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, cr_tag')
      .in('id', [player1_id, player2_id]);

    if (!profiles || profiles.length !== 2) {
      return NextResponse.json({ error: "No se encontraron los perfiles de los combatientes." }, { status: 404 });
    }

    const p1 = profiles.find(p => p.id === player1_id);
    const p2 = profiles.find(p => p.id === player2_id);

    if (!p1?.cr_tag || !p2?.cr_tag) {
        return NextResponse.json({ error: "Uno de los Hunters no tiene su Tag vinculado." }, { status: 400 });
    }

    // Limpiamos los tags para la URL
    const cleanTag1 = p1.cr_tag.replace('#', '').toUpperCase();
    const cleanTag2 = p2.cr_tag.replace('#', '').toUpperCase();

    // 2. Llamamos al Battlelog usando el Proxy para evitar bloqueos de IP
    const response = await fetch(`https://proxy.royaleapi.dev/v1/players/%23${cleanTag1}/battlelog`, {
        headers: { 
            'Authorization': `Bearer ${CR_API_KEY}`,
            'Accept': 'application/json'
        },
        cache: 'no-store'
    });

    if (!response.ok) {
        return NextResponse.json({ error: `Supercell Uplink Fallido (Status: ${response.status})` }, { status: 500 });
    }

    const battleLog = await response.json();
    let foundBattle = null;

    // 3. Buscamos duelo amistoso contra el oponente
    for (const battle of battleLog) {
        if (battle.type === 'friendly' && battle.opponent && battle.opponent.length > 0) {
            const opponentTag = battle.opponent[0].tag.replace('#', '');
            if (opponentTag === cleanTag2) {
                foundBattle = battle;
                break;
            }
        }
    }

    if (!foundBattle) {
        return NextResponse.json({ error: "No se detectó batalla amistosa reciente entre estos Tags." }, { status: 404 });
    }

    // 4. Determinar Ganador por Coronas
    const p1Crowns = foundBattle.team[0].crowns;
    const p2Crowns = foundBattle.opponent[0].crowns;

    if (p1Crowns === p2Crowns) {
        return NextResponse.json({ error: `Empate detectado (${p1Crowns}-${p2Crowns}). Repitan el duelo.` }, { status: 400 });
    }

    const winnerId = p1Crowns > p2Crowns ? player1_id : player2_id;

    return NextResponse.json({ 
        success: true, 
        winner_id: winnerId, 
        match_id: foundBattle.battleTime 
    });

  } catch (error: any) {
    return NextResponse.json({ error: "Fallo de Sistema: " + error.message }, { status: 500 });
  }
}