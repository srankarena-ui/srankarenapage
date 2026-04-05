export interface UserProfile {
  id: string;
  username: string;
  rank: string;
  role: 'admin' | 'organizador' | 'usuario';
  experience?: number;
  is_dummy?: boolean;
  riot_puuid?: string | null;
  riot_gamename?: string | null;
  riot_tagline?: string | null;
  lol_region?: string | null;
}

export interface Tournament {
  id: string;
  title: string;
  mode: '1v1' | '2v2';
  status: 'inscripciones' | 'en_curso' | 'finalizado';
  reward_points: number;
  created_by: string;
  created_at: string;
  game: string;
  start_date: string | null;
  start_time: string | null;
  contact_method: string;
  contact_url: string | null;
  contact_details: string | null;
  critical_rules: string | null;
  rules: string | null;
  prizes: string | null;
  schedule: string | null;
  game_region: string;
  game_map: string;
  game_type: string;
  tournament_codes: boolean;
  registration_open: boolean;
  check_in_enabled: boolean;
  score_reporting: string;
  require_screenshots: boolean;
  // Configuración de escala y formato
  max_participants: number;
  tournament_format: 'Single Elimination' | 'Double Elimination' | 'Two-Stage';
  stage_one_type: 'Groups' | 'Swiss';
  stage_two_format: 'Single Elimination' | 'Double Elimination';
  groups_count: number;
  total_advancing: number;
}

export interface TournamentMatch {
  id: string;
  tournament_id: string;
  round_number: number;
  match_number: number;
  player1_id: string | null;
  player2_id: string | null;
  winner_id: string | null;
  status: 'pendiente' | 'completado';
}