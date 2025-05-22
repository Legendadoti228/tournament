
import { Match, Team, Tournament } from "../../types/tournament";
import { v4 as uuidv4 } from "uuid";

// Helper function to get next power of 2
export function getNextPowerOfTwo(n: number): number {
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

// Get team name by id
export function getTeamName(teamId: string | null, teams: Team[]): string {
  if (!teamId) return 'TBD';
  const team = teams.find(team => team.id === teamId);
  return team ? team.name : 'Неизвестная команда';
}

// Generate a new tournament
export function createNewTournament(
  name: string, 
  description: string, 
  type: "single-elimination" | "double-elimination" | "round-robin"
): Tournament {
  return {
    id: uuidv4(),
    name,
    description,
    type,
    createdAt: new Date().toISOString(),
    teams: [],
    matches: [],
    status: 'registration',
  };
}

// Add a team to a tournament
export function addTeam(tournament: Tournament, teamName: string, members?: string[]): Tournament {
  const updatedTournament = { ...tournament };
  const newTeam: Team = {
    id: uuidv4(),
    name: teamName,
    members: members || []
  };
  
  updatedTournament.teams = [...updatedTournament.teams, newTeam];
  return updatedTournament;
}

// Update a match with scores and propagate winners/losers to next matches
export function updateMatch(
  tournament: Tournament,
  matchId: string,
  team1Score: number,
  team2Score: number
): Tournament {
  const updatedTournament = { ...tournament };
  const matchIndex = updatedTournament.matches.findIndex(m => m.id === matchId);
  
  if (matchIndex === -1) return tournament;
  
  const match = { ...updatedTournament.matches[matchIndex] };
  match.team1Score = team1Score;
  match.team2Score = team2Score;
  
  // Determine winner and loser
  if (team1Score > team2Score) {
    match.winnerId = match.team1Id;
    match.loserId = match.team2Id;
  } else if (team2Score > team1Score) {
    match.winnerId = match.team2Id;
    match.loserId = match.team1Id;
  } else {
    // It's a tie, don't update winner/loser
    match.winnerId = null;
    match.loserId = null;
  }
  
  updatedTournament.matches[matchIndex] = match;
  
  // Propagate winner to next match if it exists
  if (match.nextMatchId && match.winnerId) {
    const nextMatch = updatedTournament.matches.find(m => m.id === match.nextMatchId);
    if (nextMatch) {
      const nextMatchIndex = updatedTournament.matches.indexOf(nextMatch);
      const updatedNextMatch = { ...nextMatch };
      
      // Determine which slot to fill in the next match
      if (updatedNextMatch.team1Id === null) {
        updatedNextMatch.team1Id = match.winnerId;
      } else {
        updatedNextMatch.team2Id = match.winnerId;
      }
      
      updatedTournament.matches[nextMatchIndex] = updatedNextMatch;
    }
  }
  
  // Propagate loser to loser's bracket if applicable
  if (match.loserNextMatchId && match.loserId) {
    const loserNextMatch = updatedTournament.matches.find(m => m.id === match.loserNextMatchId);
    if (loserNextMatch) {
      const loserNextMatchIndex = updatedTournament.matches.indexOf(loserNextMatch);
      const updatedLoserNextMatch = { ...loserNextMatch };
      
      // Determine which slot to fill in the loser's next match
      if (updatedLoserNextMatch.team1Id === null) {
        updatedLoserNextMatch.team1Id = match.loserId;
      } else {
        updatedLoserNextMatch.team2Id = match.loserId;
      }
      
      updatedTournament.matches[loserNextMatchIndex] = updatedLoserNextMatch;
    }
  }
  
  return updatedTournament;
}
