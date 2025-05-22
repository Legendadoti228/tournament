
import React from 'react';
import { Tournament, Match } from '@/types/tournament';
import { getTeamName } from '@/utils/tournamentUtils';
import MatchCard from './MatchCard';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface SingleEliminationProps {
  tournament: Tournament;
  onUpdateScore: (matchId: string, team1Score: number, team2Score: number) => void;
}

const SingleElimination = ({ tournament, onUpdateScore }: SingleEliminationProps) => {
  const rounds = tournament.matches
    .filter(match => match.bracket === 'winner')
    .reduce((maxRound, match) => Math.max(maxRound, match.round), 0);
    
  // Organize matches by round
  const matchesByRound = Array.from({ length: rounds }, (_, i) => {
    const roundNumber = i + 1;
    return tournament.matches
      .filter(match => match.round === roundNumber && match.bracket === 'winner')
      .sort((a, b) => a.position - b.position);
  });

  return (
    <div className="bracket">
      <h2 className="text-2xl font-bold mb-4">Олимпийская система</h2>
      
      <div className="flex gap-4 overflow-x-auto pb-4">
        {matchesByRound.map((roundMatches, roundIndex) => (
          <div 
            key={`round-${roundIndex + 1}`} 
            className="bracket-round min-w-[200px]"
            style={{ 
              height: `${Math.max(Math.pow(2, rounds - roundIndex - 1) * 100, 150)}px` 
            }}
          >
            <h3 className="font-semibold text-center mb-2 text-sm">
              {roundIndex + 1 === rounds ? 'Финал' : `Раунд ${roundIndex + 1}`}
            </h3>
            <div className="flex flex-col justify-around h-full">
              {roundMatches.map((match) => (
                <div key={match.id} className="px-1">
                  <MatchCard
                    match={match}
                    teams={tournament.teams}
                    onUpdateScore={onUpdateScore}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SingleElimination;
