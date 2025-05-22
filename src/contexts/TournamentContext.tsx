
import React, { createContext, useContext, ReactNode } from 'react';
import { Tournament, TournamentType } from '../types/tournament';
import { useTournamentState } from '@/hooks/useTournamentState';

interface TournamentContextValue {
  tournaments: Tournament[];
  currentTournament: Tournament | null;
  isLoading: boolean;
  createTournament: (name: string, description: string, type: TournamentType) => Promise<Tournament>;
  loadTournament: (id: string) => Promise<void>;
  addTeamToTournament: (teamName: string, members?: string[]) => Promise<void>;
  updateMatchScore: (matchId: string, team1Score: number, team2Score: number) => Promise<void>;
  startCurrentTournament: () => Promise<void>;
  deleteTournament: (id: string) => Promise<void>;
}

const TournamentContext = createContext<TournamentContextValue | undefined>(undefined);

export function TournamentProvider({ children }: { children: ReactNode }) {
  const tournamentState = useTournamentState();

  return (
    <TournamentContext.Provider value={tournamentState}>
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
}
