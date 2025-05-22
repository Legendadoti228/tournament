
import React from 'react';
import { Link } from 'react-router-dom';
import { Tournament } from '@/types/tournament';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TournamentCardProps {
  tournament: Tournament;
  onDelete: (id: string) => void;
}

const TournamentCard = ({ tournament, onDelete }: TournamentCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTournamentTypeLabel = (type: string) => {
    switch (type) {
      case 'single-elimination':
        return 'Олимпийская система';
      case 'double-elimination':
        return 'С подвалом';
      case 'round-robin':
        return 'Круговая система';
      default:
        return type;
    }
  };
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'registration':
        return 'outline';
      case 'ongoing':
        return 'secondary';
      case 'completed':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'registration':
        return 'Регистрация';
      case 'ongoing':
        return 'В процессе';
      case 'completed':
        return 'Завершен';
      default:
        return status;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{tournament.name}</CardTitle>
            <CardDescription>
              Создан {formatDate(tournament.createdAt)}
            </CardDescription>
          </div>
          <Badge variant={getStatusBadgeVariant(tournament.status)}>
            {getStatusLabel(tournament.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <span className="text-sm text-muted-foreground">Тип:</span>
            <span className="ml-2">{getTournamentTypeLabel(tournament.type)}</span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Команд:</span>
            <span className="ml-2">{tournament.teams.length}</span>
          </div>
          {tournament.description && (
            <p className="text-sm mt-2">{tournament.description}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onDelete(tournament.id)}
        >
          Удалить
        </Button>
        <Button asChild>
          <Link to={`/tournament/${tournament.id}`}>
            Просмотр турнира
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TournamentCard;
