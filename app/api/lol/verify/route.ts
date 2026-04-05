import { NextResponse } from 'next/server';

const RIOT_API_KEY = process.env.RIOT_API_KEY;

export async function POST(request: Request) {
  const { gameName, tagline, region } = await request.json();

  if (!RIOT_API_KEY) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });

  // Mapeo de Región a Cluster de Riot (Account-V1)
  const clusterMap: { [key: string]: string } = {
    'LAN': 'americas', 'LAS': 'americas', 'NA': 'americas', 'BR': 'americas',
    'EUW': 'europe', 'EUNE': 'europe', 'KR': 'asia', 'JP': 'asia'
  };

  const cluster = clusterMap[region] || 'americas';

  try {
    const res = await fetch(
      `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagline}?api_key=${RIOT_API_KEY}`
    );

    if (!res.ok) {
      return NextResponse.json({ error: "No se encontró el Riot ID. Verifica nombre y tag." }, { status: 404 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Error de red con Riot" }, { status: 500 });
  }
}