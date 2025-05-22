
import React, { useState } from 'react';
import { Match, Team } from '@/types/tournament';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Check, X, Edit } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  teams: Team[];
  onUpdateScore: (matchId: string, team1Score: number, team2Score: number) => void;
}

const MatchCard = ({ match, teams, onUpdateScore }: MatchCardProps) => {
  const [team1Score, setTeam1Score] = useState<number | string>(match.team1Score !== null ? match.team1Score : '');
  const [team2Score, setTeam2Score] = useState<number | string>(match.team2Score !== null ? match.team2Score : '');
  const [isEditing, setIsEditing] = useState(false);

  const getTeamName = (teamId: string | null): string => {
    if (!teamId) return 'TBD';
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown';
  };
  
  const team1Name = getTeamName(match.team1Id);
  const team2Name = getTeamName(match.team2Id);
  
  const handleScoreSubmit = () => {
    const score1 = typeof team1Score === 'string' ? parseInt(team1Score) || 0 : team1Score;
    const score2 = typeof team2Score === 'string' ? parseInt(team2Score) || 0 : team2Score;
    
    onUpdateScore(match.id, score1, score2);
    setIsEditing(false);
  };

  const isWinner = (teamId: string | null) => {
    return match.winnerId === teamId && match.winnerId !== null;
  };

  return (
    <Card className="mb-2 overflow-hidden border shadow-sm w-full">
      <CardContent className="p-0">
        <div className={`bracket-team p-2 flex items-center justify-between ${isWinner(match.team1Id) ? 'bg-primary/10' : ''}`}>
          <div className="team-name text-sm truncate max-w-[70%]" title={team1Name}>
            {team1Name}
          </div>
          {isEditing ? (
            <Input
              type="number"
              min="0"
              className="score-input w-12 h-8 text-xs px-1"
              value={team1Score}
              onChange={(e) => setTeam1Score(e.target.value)}
              autoFocus
            />
          ) : (
            <div className="team-score text-xs min-w-8 text-center">{match.team1Score !== null ? match.team1Score : '-'}</div>
          )}
        </div>
        <div className={`bracket-team p-2 flex items-center justify-between ${isWinner(match.team2Id) ? 'bg-primary/10' : ''}`}>
          <div className="team-name text-sm truncate max-w-[70%]" title={team2Name}>
            {team2Name}
          </div>
          {isEditing ? (
            <Input
              type="number"
              min="0"
              className="score-input w-12 h-8 text-xs px-1"
              value={team2Score}
              onChange={(e) => setTeam2Score(e.target.value)}
            />
          ) : (
            <div className="team-score text-xs min-w-8 text-center">{match.team2Score !== null ? match.team2Score : '-'}</div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-1 flex justify-end bg-muted/40">
        {isEditing ? (
          <div className="flex space-x-1">
            <Button 
              size="icon"
              variant="outline" 
              onClick={() => setIsEditing(false)}
              title="Отменить"
              className="h-7 w-7"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
            <Button 
              size="icon"
              onClick={handleScoreSubmit}
              title="Сохранить"
              className="h-7 w-7"
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setIsEditing(true)}
            className="whitespace-nowrap flex items-center py-1 h-7 text-xs"
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            {match.team1Score !== null || match.team2Score !== null ? 'Изм.' : 'Счёт'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default MatchCard;
