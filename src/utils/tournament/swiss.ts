
import { Team, Match } from "../../types/tournament";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate matches for a Swiss tournament
 * @param teams - List of teams participating in the tournament
 * @param currentRound - The current round number (starting from 1)
 * @param previousMatches - Previous matches from earlier rounds
 * @returns Array of matches for the current round
 */
export function generateSwissMatches(
  teams: Team[], 
  currentRound: number = 1, 
  previousMatches: Match[] = []
): Match[] {
  if (teams.length < 2) return [];
  
  // Determine number of rounds based on team count
  // In Swiss system, optimal rounds is log2(N) - e.g., 8 teams = 3 rounds, 16 teams = 4 rounds
  const totalRounds = Math.ceil(Math.log2(teams.length));
  
  // For the first round, create random pairings
  if (currentRound === 1) {
    // Shuffle teams for first round
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    const matches: Match[] = [];
    
    // Pair teams and create matches
    for (let i = 0; i < shuffledTeams.length - 1; i += 2) {
      matches.push({
        id: uuidv4(),
        team1Id: shuffledTeams[i].id,
        team2Id: i + 1 < shuffledTeams.length ? shuffledTeams[i + 1].id : null,
        team1Score: null,
        team2Score: null,
        winnerId: null,
        loserId: null,
        nextMatchId: null,
        loserNextMatchId: null,
        round: currentRound,
        position: Math.floor(i / 2),
        bracket: 'winner' // Swiss uses only one bracket
      });
    }
    
    // If odd number of teams, the last team gets a bye
    if (shuffledTeams.length % 2 !== 0) {
      // In practice, we might want to mark this as a bye match
      // For now, we'll leave the last team out of matches
      console.log(`Team ${shuffledTeams[shuffledTeams.length - 1].name} gets a bye in round 1`);
    }
    
    return matches;
  } 
  // For subsequent rounds, pair based on standings
  else {
    // Calculate team standings based on previous matches
    const standings = calculateStandings(teams, previousMatches);
    
    // Sort teams by their score (descending)
    const sortedTeams = [...teams].sort((a, b) => {
      const aStanding = standings.find(s => s.teamId === a.id) || { wins: 0, losses: 0 };
      const bStanding = standings.find(s => s.teamId === b.id) || { wins: 0, losses: 0 };
      return bStanding.wins - aStanding.wins;
    });
    
    const matches: Match[] = [];
    const pairedTeams = new Set<string>();
    
    // Try to pair teams with similar scores who haven't played each other yet
    for (let i = 0; i < sortedTeams.length; i++) {
      if (pairedTeams.has(sortedTeams[i].id)) continue;
      
      // Find the next unpaired team with the closest score that hasn't played this team
      for (let j = i + 1; j < sortedTeams.length; j++) {
        if (pairedTeams.has(sortedTeams[j].id)) continue;
        
        // Check if these teams have already played each other
        const havePlayedBefore = previousMatches.some(match => 
          (match.team1Id === sortedTeams[i].id && match.team2Id === sortedTeams[j].id) ||
          (match.team1Id === sortedTeams[j].id && match.team2Id === sortedTeams[i].id)
        );
        
        if (!havePlayedBefore) {
          // Create a new match between these teams
          matches.push({
            id: uuidv4(),
            team1Id: sortedTeams[i].id,
            team2Id: sortedTeams[j].id,
            team1Score: null,
            team2Score: null,
            winnerId: null,
            loserId: null,
            nextMatchId: null,
            loserNextMatchId: null,
            round: currentRound,
            position: matches.length,
            bracket: 'winner'
          });
          
          // Mark these teams as paired
          pairedTeams.add(sortedTeams[i].id);
          pairedTeams.add(sortedTeams[j].id);
          break;
        }
      }
      
      // If we couldn't find a suitable opponent, this team gets a bye
      if (!pairedTeams.has(sortedTeams[i].id)) {
        console.log(`Team ${sortedTeams[i].name} gets a bye in round ${currentRound}`);
        pairedTeams.add(sortedTeams[i].id);
      }
    }
    
    return matches;
  }
}

// Calculate team standings based on previous matches
function calculateStandings(teams: Team[], matches: Match[]) {
  return teams.map(team => {
    let wins = 0;
    let losses = 0;
    
    matches.forEach(match => {
      if (match.winnerId === team.id) wins++;
      if (match.loserId === team.id) losses++;
    });
    
    return {
      teamId: team.id,
      wins,
      losses
    };
  });
}

// Generate the next round of Swiss matches
export function generateNextSwissRound(
  teams: Team[], 
  previousMatches: Match[], 
  currentRound: number
): Match[] {
  return generateSwissMatches(teams, currentRound, previousMatches);
}

// Determine if the Swiss tournament is complete
export function isSwissTournamentComplete(
  totalRounds: number, 
  currentRound: number, 
  allMatchesComplete: boolean
): boolean {
  return currentRound >= totalRounds && allMatchesComplete;
}
