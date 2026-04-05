export const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'penta_kills',
    title: 'Aniquilador Supremo',
    description: 'Pentakills acumuladas en la Arena.',
    stat_key: 'penta_kills_total',
    tiers: { bronze: 1, silver: 5, gold: 10, platinum: 25, s_rank: 50 }
  },
  {
    id: 'wards_placed',
    title: 'Iluminado',
    description: 'Wards colocados para dar visión al equipo.',
    stat_key: 'wards_placed_total',
    tiers: { bronze: 100, silver: 500, gold: 1500, platinum: 5000, s_rank: 10000 }
  },
  {
    id: 'missing_pings',
    title: 'Teórico del Caos',
    description: 'Uso del ping de "Enemigo desaparecido" (?).',
    stat_key: 'ping_missing_count',
    tiers: { bronze: 50, silver: 250, gold: 1000, platinum: 2500, s_rank: 5000 }
  },
  {
    id: 'tournament_wins',
    title: 'Leyenda de la Arena',
    description: 'Torneos oficiales ganados.',
    stat_key: 'tournament_wins',
    tiers: { bronze: 1, silver: 3, gold: 5, platinum: 10, s_rank: 20 }
  },
  {
    id: 'dragon_last_hits',
    title: 'Cazador de Dragones',
    description: 'Asesinatos de dragones elementales.',
    stat_key: 'dragon_souls_total',
    tiers: { bronze: 10, silver: 50, gold: 100, platinum: 250, s_rank: 500 }
  }
];

export const getTier = (value: number, tiers: any) => {
  if (value >= tiers.s_rank) return 's_rank';
  if (value >= tiers.platinum) return 'platinum';
  if (value >= tiers.gold) return 'gold';
  if (value >= tiers.silver) return 'silver';
  if (value >= tiers.bronze) return 'bronze';
  return 'locked';
};

export const getTierColor = (tier: string) => {
  switch (tier) {
    case 'bronze': return 'text-[#CD7F32] border-[#CD7F32]/30 bg-[#CD7F32]/5';
    case 'silver': return 'text-[#C0C0C0] border-[#C0C0C0]/30 bg-[#C0C0C0]/5';
    case 'gold': return 'text-[#FFD700] border-[#FFD700]/30 bg-[#FFD700]/5 shadow-[0_0_15px_rgba(255,215,0,0.1)]';
    case 'platinum': return 'text-[#00E5FF] border-[#00E5FF]/30 bg-[#00E5FF]/5 shadow-[0_0_20px_rgba(0,229,255,0.1)]';
    case 's_rank': return 'text-[#A855F7] border-[#A855F7]/50 bg-[#A855F7]/10 shadow-[0_0_30px_rgba(168,85,247,0.3)] animate-pulse';
    default: return 'text-gray-700 border-gray-800 bg-transparent opacity-40';
  }
};