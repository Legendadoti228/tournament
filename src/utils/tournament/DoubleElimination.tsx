
import React from 'react';
import { Tournament, Match } from '@/types/tournament';
import MatchCard from './MatchCard';

interface DoubleEliminationProps {
  tournament: Tournament;
  onUpdateScore: (matchId: string, team1Score: number, team2Score: number) => void;
}

const DoubleElimination = ({ tournament, onUpdateScore }: DoubleEliminationProps) => {
  // Get maximum rounds for winner's bracket
  const winnerRounds = tournament.matches
    .filter(match => match.bracket === 'winner')
    .reduce((maxRound, match) => Math.max(maxRound, match.round), 0);
    
  // Get maximum rounds for loser's bracket
  const loserRounds = tournament.matches
    .filter(match => match.bracket === 'loser')
    .reduce((maxRound, match) => Math.max(maxRound, match.round), 0);
    
  // Find the final match
  const finalMatch = tournament.matches.find(match => match.bracket === 'final');
    
  // Organize winner's bracket matches by round
  const winnerMatchesByRound = Array.from({ length: winnerRounds }, (_, i) => {
    const roundNumber = i + 1;
    return tournament.matches
      .filter(match => match.round === roundNumber && match.bracket === 'winner')
      .sort((a, b) => a.position - b.position);
  });
  
  // Organize loser's bracket matches by round
  const loserMatchesByRound = Array.from({ length: loserRounds }, (_, i) => {
    const roundNumber = i + 1;
    return tournament.matches
      .filter(match => match.round === roundNumber && match.bracket === 'loser')
      .sort((a, b) => a.position - b.position);
  });
  
  // Helper function to calculate bracket height
  const getBracketHeight = (matches: Match[], round: number, isWinner: boolean) => {
    if (isWinner) {
      // For winner bracket, height increases with round number
      const teamCount = Math.pow(2, winnerRounds - round + 1);
      return Math.max(teamCount * 60, 120);
    } else {
      // For loser bracket, each round has its own height depending on match count
      return Math.max(matches.length * 100, 120);
    }
  };

  const getRoundTitle = (roundIndex: number, bracket: string) => {
    if (bracket === 'winner') {
      return roundIndex + 1 === winnerRounds ? 'Финал победителей' : `Раунд ${roundIndex + 1}`;
    } else {
      // Loser bracket round naming is more complex
      if ((roundIndex + 1) % 2 === 1) {
        // Odd rounds - losers from winner bracket enter
        return `Раунд ${Math.ceil((roundIndex + 1) / 2)} (приход из верхней)`;
      } else {
        // Even rounds - consolidation rounds
        return `Раунд ${Math.floor((roundIndex + 1) / 2)} (консолидация)`;
      }
    }
  };

  return (
    <div className="bracket">
      <h2 className="text-2xl font-bold mb-4">Сетка с двойным выбыванием</h2>
      
      {/* Winner's Bracket */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Сетка победителей</h3>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {winnerMatchesByRound.map((roundMatches, roundIndex) => (
            <div 
              key={`winner-round-${roundIndex + 1}`} 
              className="bracket-round min-w-[220px]"
              style={{ 
                height: `${getBracketHeight(roundMatches, roundIndex + 1, true)}px` 
              }}
            >
              <h4 className="font-semibold text-center mb-2 text-sm">
                {getRoundTitle(roundIndex, 'winner')}
              </h4>
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
      
      {/* Loser's Bracket */}
      {loserRounds > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Сетка проигравших</h3>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {loserMatchesByRound.map((roundMatches, roundIndex) => (
              <div 
                key={`loser-round-${roundIndex + 1}`} 
                className="bracket-round min-w-[220px]"
                style={{ 
                  height: `${getBracketHeight(roundMatches, roundIndex + 1, false)}px` 
                }}
              >
                <h4 className="font-semibold text-center mb-2 text-sm">
                  {getRoundTitle(roundIndex, 'loser')}
                </h4>
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
      )}
      
      {/* Grand Final */}
      {finalMatch && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Гранд-финал</h3>
          <div className="flex justify-center">
            <div style={{ width: '250px' }}>
              <MatchCard
                match={finalMatch}
                teams={tournament.teams}
                onUpdateScore={onUpdateScore}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoubleElimination;
