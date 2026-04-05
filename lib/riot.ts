"use server";

export async function verifyRiotAccount(gameName: string, tagLine: string, region: string) {
  const apiKey = process.env.RIOT_API_KEY;
  
  // Riot usa "regiones de ruteo". Para América (LAN, LAS, NA, BR) es 'americas'
  // Para Europa (EUW, EUNE) es 'europe'
  const routingRegion = ["LAN", "LAS", "NA", "BR"].includes(region.toUpperCase()) 
    ? "americas" 
    : "europe";

  try {
    const url = `https://${routingRegion}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${apiKey}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      return { 
        success: false, 
        message: response.status === 404 ? "Account not found in Riot servers" : "Riot API Error" 
      };
    }

    const data = await response.json();
    
    // Si llegamos aquí, el usuario existe y Riot nos devuelve su PUUID
    return { 
      success: true, 
      puuid: data.puuid, 
      gameName: data.gameName, 
      tagLine: data.tagLine 
    };
  } catch (error) {
    return { success: false, message: "Connection error with Riot" };
  }
}