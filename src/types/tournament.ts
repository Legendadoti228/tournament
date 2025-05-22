
export type TournamentType = 'single-elimination' | 'double-elimination' | 'round-robin' | 'swiss';

export interface Team {
  id: string;
  name: string;
  members?: string[];
}

export interface Match {
  id: string;
  team1Id: string | null;
  team2Id: string | null;
  team1Score: number | null;
  team2Score: number | null;
  winnerId: string | null;
  loserId: string | null;
  nextMatchId: string | null;
  loserNextMatchId: string | null;
  round: number;
  position: number;
  bracket: 'winner' | 'loser' | 'final';
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  type: TournamentType;
  createdAt: string;
  teams: Team[];
  matches: Match[];
  status: 'registration' | 'ongoing' | 'completed';
  currentRound?: number; // Added for Swiss system to track rounds
  totalRounds?: number;  // Added for Swiss system to define total rounds
  winnerId?: string;     // Added to store the tournament winner
}
