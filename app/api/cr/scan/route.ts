import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const CR_API_KEY = process.env.CR_API_KEY; 
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  console.log("--- INICIANDO ESCANEO DE CLASH ROYALE ---");
  
  if (!CR_API_KEY) {
    console.error("ERROR: Falta CR_API_KEY en las variables de entorno de Vercel.");
    return NextResponse.json({ error: "Falta la API Key de Clash Royale." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { player1_id, player2_id } = body;
    console.log(`Buscando duelo entre: ${player1_id} vs ${player2_id}`);

    // 1. Buscamos los Tags en Supabase
    const { data: profiles, error: dbError } = await supabase
      .from('profiles')
      .select('id, cr_tag')
      .in('id', [player1_id, player2_id]);

    if (dbError || !profiles || profiles.length !== 2) {
      console.error("ERROR SUPABASE:", dbError || "No se encontraron 2 perfiles.");
      return NextResponse.json({ error: "No se encontraron los perfiles o faltan datos." }, { status: 404 });
    }

    const p1 = profiles.find(p => p.id === player1_id);
    const p2 = profiles.find(p => p.id === player2_id);

    const cleanTag1 = p1.cr_tag.replace('#', '').toUpperCase();
    const cleanTag2 = p2.cr_tag.replace('#', '').toUpperCase();
    console.log(`Tags detectados: #${cleanTag1} y #${cleanTag2}`);

    // 2. Llamada al Proxy (RoyaleAPI)
    // Es vital usar el proxy porque las IPs de Vercel están baneadas por Supercell
    console.log("Llamando a RoyaleAPI Proxy...");
    const response = await fetch(`https://proxy.royaleapi.dev/v1/players/%23${cleanTag1}/battlelog`, {
        headers: { 
            'Authorization': `Bearer ${CR_API_KEY}`,
            'Accept': 'application/json'
        },
        cache: 'no-store'
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error(`ERROR DE SUPERCELL (${response.status}):`, errorData);
        return NextResponse.json({ error: `Supercell rechazó la llave (Status: ${response.status})` }, { status: response.status });
    }

    const battleLog = await response.json();
    let foundBattle = null;

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
        console.log("No se encontró batalla reciente entre estos jugadores.");
        return NextResponse.json({ error: "Batalla no encontrada en el historial." }, { status: 404 });
    }

    const p1Crowns = foundBattle.team[0].crowns;
    const p2Crowns = foundBattle.opponent[0].crowns;
    const winnerId = p1Crowns > p2Crowns ? player1_id : player2_id;

    console.log(`Victoria detectada: ${winnerId} (${p1Crowns}-${p2Crowns})`);

    return NextResponse.json({ 
        success: true, 
        winner_id: winnerId, 
        match_id: foundBattle.battleTime 
    });

  } catch (error: any) {
    console.error("FALLO CRÍTICO EN EL SERVIDOR:", error.message);
    return NextResponse.json({ error: "Fallo de Sistema: " + error.message }, { status: 500 });
  }
}