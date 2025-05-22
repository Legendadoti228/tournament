
import { Match, Team } from "../../types/tournament";
import { v4 as uuidv4 } from "uuid";
import { getNextPowerOfTwo } from "./commonUtils";

// Generate matches for a single elimination tournament
export function generateSingleEliminationMatches(teams: Team[]): Match[] {
  if (teams.length < 2) return [];
  
  // Pad the number of teams to the next power of 2
  const targetTeamCount = getNextPowerOfTwo(teams.length);
  const matches: Match[] = [];
  const rounds = Math.log2(targetTeamCount);
  
  // Generate matches by round
  for (let round = 1; round <= rounds; round++) {
    const matchesInRound = targetTeamCount / Math.pow(2, round);
    
    for (let pos = 0; pos < matchesInRound; pos++) {
      const matchId = uuidv4();
      
      // For first round, assign actual teams
      let team1Id = null;
      let team2Id = null;
      
      if (round === 1) {
        const team1Index = pos * 2;
        const team2Index = pos * 2 + 1;
        
        if (team1Index < teams.length) {
          team1Id = teams[team1Index].id;
        }
        
        if (team2Index < teams.length) {
          team2Id = teams[team2Index].id;
        }
      }
      
      matches.push({
        id: matchId,
        team1Id,
        team2Id,
        team1Score: null,
        team2Score: null,
        winnerId: null,
        loserId: null,
        nextMatchId: null,
        loserNextMatchId: null,
        round,
        position: pos,
        bracket: 'winner',
      });
    }
  }
  
  // Link matches between rounds
  for (let round = 1; round < rounds; round++) {
    const currentRoundMatches = matches.filter(match => match.round === round);
    const nextRoundMatches = matches.filter(match => match.round === round + 1);
    
    for (let i = 0; i < currentRoundMatches.length; i++) {
      const nextMatchIndex = Math.floor(i / 2);
      if (nextRoundMatches[nextMatchIndex]) {
        currentRoundMatches[i].nextMatchId = nextRoundMatches[nextMatchIndex].id;
      }
    }
  }
  
  return matches;
}
