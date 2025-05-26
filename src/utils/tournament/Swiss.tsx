
import React from 'react';
import { Tournament, Match } from '@/types/tournament';
import MatchCard from './MatchCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getTeamName } from '@/utils/tournament/commonUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SwissProps {
  tournament: Tournament;
  onUpdateScore: (matchId: string, team1Score: number, team2Score: number) => Promise<void>;
}

const Swiss: React.FC<SwissProps> = ({ tournament, onUpdateScore }) => {
  const { matches, teams, currentRound = 1, totalRounds = 0 } = tournament;
  
  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round]) acc[match.round] = [];
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);
  
  // Sort standings based on wins and losses
  const getStandings = () => {
    const standings = teams.map(team => {
      let wins = 0, losses = 0;
      
      matches.forEach(match => {
        if (match.winnerId === team.id) wins++;
        if (match.loserId === team.id) losses++;
      });
      
      return { team, wins, losses };
    });
    
    // Sort by wins (descending), then by losses (ascending)
    return standings.sort((a, b) => 
      b.wins - a.wins || a.losses - b.losses
    );
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Швейцарская система</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-sm">
            <p>Текущий раунд: {currentRound} из {totalRounds}</p>
            <p>Количество команд: {teams.length}</p>
          </div>
          
          <Tabs defaultValue={currentRound.toString()} className="w-full">
            <TabsList className="mb-4 overflow-auto">
              {Object.keys(matchesByRound).map(round => (
                <TabsTrigger key={round} value={round}>
                  Раунд {round}
                </TabsTrigger>
              ))}
              <TabsTrigger value="standings">Турнирная таблица</TabsTrigger>
            </TabsList>
            
            {Object.entries(matchesByRound).map(([round, roundMatches]) => (
              <TabsContent key={round} value={round} className="space-y-4">
                <h3 className="text-lg font-medium">Раунд {round}</h3>
                {roundMatches.length > 0 ? (
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {roundMatches.map(match => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        teams={teams}
                        onUpdateScore={onUpdateScore}
                      />
                    ))}
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <AlertDescription>В этом раунде нет матчей.</AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            ))}
            
            <TabsContent value="standings" className="space-y-4">
              <h3 className="text-lg font-medium">Турнирная таблица</h3>
              <div className="relative rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">Место</th>
                      <th className="py-3 px-4 text-left font-medium">Команда</th>
                      <th className="py-3 px-4 text-center font-medium">Победы</th>
                      <th className="py-3 px-4 text-center font-medium">Поражения</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getStandings().map((standing, index) => (
                      <tr key={standing.team.id} className={index % 2 ? 'bg-muted/50' : ''}>
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4">{standing.team.name}</td>
                        <td className="py-3 px-4 text-center">{standing.wins}</td>
                        <td className="py-3 px-4 text-center">{standing.losses}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Swiss;
