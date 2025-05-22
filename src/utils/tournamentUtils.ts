import { Tournament, TournamentType } from "../types/tournament";
import { generateSingleEliminationMatches } from "./tournament/singleElimination";
import { generateDoubleEliminationMatches } from "./tournament/doubleElimination";
import { generateRoundRobinMatches } from "./tournament/roundRobin";
import { generateSwissMatches } from "./tournament/swiss";
import { 
  getTeamName, 
  createNewTournament, 
  addTeam, 
  updateMatch, 
  getNextPowerOfTwo 
} from "./tournament/commonUtils";

// Generate tournament matches based on the tournament type
export function generateTournamentMatches(tournament: Tournament) {
  console.log(`Generating matches for ${tournament.type} tournament with ${tournament.teams.length} teams`);
  
  switch(tournament.type) {
    case 'single-elimination':
      return generateSingleEliminationMatches(tournament.teams);
    case 'double-elimination':
      return generateDoubleEliminationMatches(tournament.teams);
    case 'round-robin':
      return generateRoundRobinMatches(tournament.teams);
    case 'swiss':
      // For Swiss system, we set up the first round
      const totalRounds = Math.ceil(Math.log2(tournament.teams.length));
      tournament.totalRounds = totalRounds; 
      tournament.currentRound = 1;
      return generateSwissMatches(tournament.teams, 1);
    default:
      return [];
  }
}

// Validate tournament can be started with the current teams
export function validateTournamentStart(tournament: Tournament): { valid: boolean; message?: string } {
  if (tournament.teams.length < 2) {
    return { valid: false, message: "Для начала турнира требуется минимум 2 команды." };
  }
  
  // For single-elimination, we need a power of two number of teams
  if (tournament.type === 'single-elimination') {
    const nextPowerOfTwo = getNextPowerOfTwo(tournament.teams.length);
    if (tournament.teams.length !== nextPowerOfTwo) {
      return { 
        valid: false, 
        message: `Для олимпийской системы требуется ${nextPowerOfTwo} команд. Добавьте еще ${nextPowerOfTwo - tournament.teams.length} команд.` 
      };
    }
  }
  
  return { valid: true };
}

// Start a tournament - generate matches based on registered teams
export function startTournament(tournament: Tournament): Tournament {
  const updatedTournament = { ...tournament };
  
  // Validate tournament can be started
  const validation = validateTournamentStart(tournament);
  if (!validation.valid) {
    throw new Error(validation.message);
  }
  
  updatedTournament.matches = generateTournamentMatches(updatedTournament);
  updatedTournament.status = 'ongoing';
  
  console.log(`Tournament started with ${updatedTournament.matches.length} matches`);
  
  return updatedTournament;
}

// Determine the winner of a tournament
export function determineTournamentWinner(tournament: Tournament): string | null {
  if (tournament.status !== 'completed') {
    return null;
  }

  switch (tournament.type) {
    case 'single-elimination':
      // For single-elimination, find the final match (highest round in winner bracket)
      const finalRound = Math.max(...tournament.matches
        .filter(m => m.bracket === 'winner')
        .map(m => m.round));
      const finalMatch = tournament.matches.find(
        match => match.bracket === 'winner' && match.round === finalRound
      );
      return finalMatch?.winnerId || null;
      
    case 'double-elimination':
      // For double-elimination, the winner is the winner of the final match
      const finalMatch2 = tournament.matches.find(
        match => match.bracket === 'final'
      );
      return finalMatch2?.winnerId || null;
      
    case 'round-robin':
      // For round-robin, calculate points and find the team with most points
      const teamPoints = new Map<string, number>();
      
      tournament.teams.forEach(team => {
        teamPoints.set(team.id, 0);
      });
      
      tournament.matches.forEach(match => {
        if (match.winnerId && match.team1Score !== null && match.team2Score !== null) {
          if (match.team1Score === match.team2Score) {
            // Draw - 1 point for each team
            if (match.team1Id) teamPoints.set(match.team1Id, (teamPoints.get(match.team1Id) || 0) + 1);
            if (match.team2Id) teamPoints.set(match.team2Id, (teamPoints.get(match.team2Id) || 0) + 1);
          } else {
            // Win - 3 points
            teamPoints.set(match.winnerId, (teamPoints.get(match.winnerId) || 0) + 3);
          }
        }
      });
      
      let maxPoints = -1;
      let winnerId: string | null = null;
      
      teamPoints.forEach((points, teamId) => {
        if (points > maxPoints) {
          maxPoints = points;
          winnerId = teamId;
        }
      });
      
      return winnerId;
      
    case 'swiss':
      // For Swiss, similar to round-robin but check based on wins
      const teamWins = new Map<string, number>();
      
      tournament.teams.forEach(team => {
        teamWins.set(team.id, 0);
      });
      
      tournament.matches.forEach(match => {
        if (match.winnerId) {
          teamWins.set(match.winnerId, (teamWins.get(match.winnerId) || 0) + 1);
        }
      });
      
      let maxWins = -1;
      let swissWinnerId: string | null = null;
      
      teamWins.forEach((wins, teamId) => {
        if (wins > maxWins) {
          maxWins = wins;
          swissWinnerId = teamId;
        }
      });
      
      return swissWinnerId;
      
    default:
      return null;
  }
}

// Handle completion of a round in Swiss tournament and generate next round
export function advanceSwissTournament(tournament: Tournament): Tournament {
  // Only relevant for Swiss tournaments
  if (tournament.type !== 'swiss' || !tournament.currentRound) {
    return tournament;
  }

  const updatedTournament = { ...tournament };
  const currentRound = updatedTournament.currentRound || 1;
  const totalRounds = updatedTournament.totalRounds || Math.ceil(Math.log2(updatedTournament.teams.length));
  
  // Check if all matches in the current round are complete
  const currentRoundMatches = updatedTournament.matches.filter(match => match.round === currentRound);
  const allMatchesComplete = currentRoundMatches.every(match => match.winnerId !== null);
  
  // If not all matches are complete, don't advance
  if (!allMatchesComplete) {
    return updatedTournament;
  }
  
  // If we've reached the final round, mark the tournament as completed
  if (currentRound >= totalRounds) {
    updatedTournament.status = 'completed';
    
    // Determine the tournament winner
    updatedTournament.winnerId = determineTournamentWinner(updatedTournament);
    
    return updatedTournament;
  }
  
  // Generate matches for the next round
  const nextRound = currentRound + 1;
  const nextRoundMatches = generateSwissMatches(
    updatedTournament.teams, 
    nextRound, 
    updatedTournament.matches
  );
  
  updatedTournament.matches = [...updatedTournament.matches, ...nextRoundMatches];
  updatedTournament.currentRound = nextRound;
  
  return updatedTournament;
}

// Update match score with special handling for Swiss tournaments
export function updateMatchScore(
  tournament: Tournament, 
  matchId: string, 
  team1Score: number, 
  team2Score: number
): Tournament {
  let updatedTournament = updateMatch(tournament, matchId, team1Score, team2Score);
  
  // For Swiss tournaments, check if we need to advance to the next round
  if (tournament.type === 'swiss') {
    updatedTournament = advanceSwissTournament(updatedTournament);
  }
  
  // Check if this match completion has finished the tournament
  const remainingMatches = updatedTournament.matches.filter(
    m => m.team1Id && m.team2Id && m.winnerId === null
  );
  
  // If all matches are complete and tournament is not already completed
  if (remainingMatches.length === 0 && updatedTournament.status !== 'completed') {
    updatedTournament.status = 'completed';
    updatedTournament.winnerId = determineTournamentWinner(updatedTournament);
  }
  
  return updatedTournament;
}

// Re-export utility functions from separate modules
export {
  getTeamName,
  createNewTournament,
  addTeam,
  updateMatch,
  getNextPowerOfTwo,
  generateSingleEliminationMatches,
  generateDoubleEliminationMatches,
  generateRoundRobinMatches,
  generateSwissMatches
};
