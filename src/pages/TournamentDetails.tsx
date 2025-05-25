
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useTournament } from '@/contexts/TournamentContext';
import TeamRegistrationForm from '@/components/TeamRegistrationForm';
import SingleElimination from '@/components/brackets/SingleElimination';
import DoubleElimination from '@/components/brackets/DoubleElimination';
import RoundRobin from '@/components/brackets/RoundRobin';
import Swiss from '@/components/brackets/Swiss';
import Certificate, { CertificateTemplate } from '@/components/Certificate';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { validateTournamentStart, getNextPowerOfTwo } from '@/utils/tournamentUtils';
import { Trophy, Medal, Award, FileText } from 'lucide-react';

const TournamentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    loadTournament, 
    currentTournament, 
    addTeamToTournament, 
    startCurrentTournament,
    updateMatchScore, 
    deleteTournament
  } = useTournament();
  
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate>('diploma');
  
  useEffect(() => {
    if (id && !isLoaded) {
      loadTournament(id);
      setIsLoaded(true);
    }
  }, [id, loadTournament, isLoaded]);
  
  useEffect(() => {
    return () => {
      setIsLoaded(false);
    };
  }, [id]);
  
  if (!currentTournament) {
    return (
      <Layout>
        <div className="text-center p-12">
          <h2 className="text-2xl font-semibold mb-4">Турнир не найден</h2>
          <p className="text-muted-foreground mb-6">
            Запрашиваемый турнир не существует или был удален.
          </p>
          <Button onClick={() => navigate('/')}>Вернуться на главную</Button>
        </div>
      </Layout>
    );
  }
  
  const renderBracket = () => {
    switch (currentTournament.type) {
      case 'single-elimination':
        return (
          <SingleElimination
            tournament={currentTournament}
            onUpdateScore={updateMatchScore}
          />
        );
      case 'double-elimination':
        return (
          <DoubleElimination
            tournament={currentTournament}
            onUpdateScore={updateMatchScore}
          />
        );
      case 'round-robin':
        return (
          <RoundRobin
            tournament={currentTournament}
            onUpdateScore={updateMatchScore}
          />
        );
      case 'swiss':
        return (
          <Swiss
            tournament={currentTournament}
            onUpdateScore={updateMatchScore}
          />
        );
      default:
        return <div>Неподдерживаемый тип турнира</div>;
    }
  };
  
  const getTournamentTypeLabel = (type: string) => {
    switch (type) {
      case 'single-elimination':
        return 'Олимпийская система';
      case 'double-elimination':
        return 'С подвалом';
      case 'round-robin':
        return 'Круговая система';
      case 'swiss':
        return 'Швейцарская система';
      default:
        return type;
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
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  const handleDeleteTournament = () => {
    deleteTournament(currentTournament.id);
    navigate('/');
  };
  
  const handleStartTournament = () => {
    startCurrentTournament();
    setShowStartDialog(false);
  };

  const validation = validateTournamentStart(currentTournament);
  const canStart = validation.valid;
  
  const requiredTeams = currentTournament.type === 'single-elimination' 
    ? getNextPowerOfTwo(currentTournament.teams.length || 1)
    : 2;
    
  // Get the top 3 teams for the results tab
  const getTopThreePlaces = () => {
    if (!currentTournament || currentTournament.status !== 'completed') {
      return { winner: null, second: null, third: null };
    }
    
    // First place is always the winner
    const winner = currentTournament.winnerId 
      ? currentTournament.teams.find(team => team.id === currentTournament.winnerId)
      : null;
      
    // For single-elimination, the second place is the loser of the final match
    let second = null;
    let third = null;
    
    if (currentTournament.type === 'single-elimination') {
      // Find the final match
      const rounds = Math.max(...currentTournament.matches
        .filter(m => m.bracket === 'winner')
        .map(m => m.round));
      
      const finalMatch = currentTournament.matches.find(
        m => m.bracket === 'winner' && m.round === rounds
      );
      
      // Second place is the loser of the final match
      if (finalMatch && finalMatch.loserId) {
        second = currentTournament.teams.find(team => team.id === finalMatch.loserId);
      }
      
      // Third place would be the winner of the 3rd place match or semifinal loser
      // For simplicity, we'll take the semifinal losers as 3rd places
      if (rounds > 1) {
        const semifinalMatches = currentTournament.matches.filter(
          m => m.bracket === 'winner' && m.round === rounds - 1
        );
        
        const semifinalLoser = semifinalMatches.find(m => m.loserId && m.loserId !== finalMatch?.team1Id && m.loserId !== finalMatch?.team2Id)?.loserId;
        
        if (semifinalLoser) {
          third = currentTournament.teams.find(team => team.id === semifinalLoser);
        }
      }
    } else if (currentTournament.type === 'double-elimination') {
      // For double elimination the second place is the loser of the final match
      const finalMatch = currentTournament.matches.find(m => m.bracket === 'final');
      if (finalMatch && finalMatch.loserId) {
        second = currentTournament.teams.find(team => team.id === finalMatch.loserId);
      }
      
      // Third place would be the last winner in the loser bracket before the final
      const loserBracketMatches = currentTournament.matches.filter(m => m.bracket === 'loser');
      const loserBracketRounds = Math.max(...loserBracketMatches.map(m => m.round));
      const lastLoserMatch = loserBracketMatches.find(m => m.round === loserBracketRounds);
      
      if (lastLoserMatch && lastLoserMatch.winnerId && lastLoserMatch.winnerId !== finalMatch?.team1Id && lastLoserMatch.winnerId !== finalMatch?.team2Id) {
        third = currentTournament.teams.find(team => team.id === lastLoserMatch.winnerId);
      }
    } else {
      // For round-robin and swiss, calculate based on points or wins
      // This is a simplified version; in a real app, you'd have more complex logic
      const teamScores = new Map();
      
      currentTournament.teams.forEach(team => {
        teamScores.set(team.id, { points: 0, team });
      });
      
      // Calculate points
      currentTournament.matches.forEach(match => {
        if (match.winnerId) {
          const winnerScore = teamScores.get(match.winnerId);
          if (winnerScore) {
            winnerScore.points += 3;
          }
        }
      });
      
      // Sort teams by points
      const sortedTeams = Array.from(teamScores.values())
        .sort((a, b) => b.points - a.points);
      
      // Get second and third place
      if (sortedTeams.length > 1) {
        second = sortedTeams[1].team;
      }
      
      if (sortedTeams.length > 2) {
        third = sortedTeams[2].team;
      }
    }
    
    return { winner, second, third };
  };
  
  const { winner, second, third } = getTopThreePlaces();

  const printAllCertificates = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{currentTournament.name}</h1>
            <Badge>
              {getTournamentTypeLabel(currentTournament.type)}
            </Badge>
            <Badge variant={currentTournament.status === 'registration' ? 'outline' : currentTournament.status === 'ongoing' ? 'secondary' : 'default'}>
              {getStatusLabel(currentTournament.status)}
            </Badge>
          </div>
          
          {currentTournament.description && (
            <p className="text-muted-foreground mt-1">{currentTournament.description}</p>
          )}
        </div>
        
        <div className="flex space-x-2">
          {currentTournament.status === 'registration' && canStart && (
            <Button onClick={() => setShowStartDialog(true)}>Начать турнир</Button>
          )}
          <Button variant="outline" onClick={() => setShowDeleteDialog(true)}>Удалить</Button>
        </div>
      </div>
      
      <Tabs defaultValue="bracket" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="bracket">Сетка</TabsTrigger>
          <TabsTrigger value="teams">Команды</TabsTrigger>
          {currentTournament.status === 'registration' && (
            <TabsTrigger value="register">Регистрация команды</TabsTrigger>
          )}
          {currentTournament.status === 'completed' && (
            <TabsTrigger value="results">Результаты</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="bracket">
          {currentTournament.status === 'registration' ? (
            <Card>
              <CardContent className="p-6 text-center">
                <h2 className="text-2xl font-semibold mb-2">Турнир не начат</h2>
                <p className="text-muted-foreground mb-6">
                  {currentTournament.type === 'single-elimination' 
                    ? `Для олимпийской системы требуется ${requiredTeams} команд. Сейчас зарегистрировано: ${currentTournament.teams.length}`
                    : `Зарегистрируйте как минимум 2 команды и начните турнир, чтобы увидеть сетку.`
                  }
                </p>
                <div className="flex justify-center space-x-3">
                  <Button 
                    disabled={!canStart}
                    onClick={() => setShowStartDialog(true)}
                  >
                    Начать турнир
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            renderBracket()
          )}
        </TabsContent>
        
        <TabsContent value="teams">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold mb-4">Команды</h2>
            
            {currentTournament.teams.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">Пока нет зарегистрированных команд.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {currentTournament.teams.map(team => (
                  <Card key={team.id}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg">{team.name}</h3>
                      {team.members && team.members.length > 0 && (
                        <div className="mt-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Участники:</h4>
                          <ul className="mt-1">
                            {team.members.map((member, index) => (
                              <li key={index} className="text-sm">{member}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        {currentTournament.status === 'registration' && (
          <TabsContent value="register">
            <div className="max-w-md mx-auto">
              <TeamRegistrationForm onAddTeam={addTeamToTournament} />
            </div>
          </TabsContent>
        )}
        
        {currentTournament.status === 'completed' && (
          <TabsContent value="results">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold mb-6 flex items-center justify-between">
                <span>Итоговые результаты</span>
                {(winner || second || third) && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Выбрать шаблон</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="space-y-4">
                        <h3 className="font-medium">Выберите тип грамоты</h3>
                        <Select 
                          value={selectedTemplate} 
                          onValueChange={(value) => setSelectedTemplate(value as CertificateTemplate)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Выберите шаблон" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="diploma">Диплом</SelectItem>
                            <SelectItem value="gratitude">Благодарность</SelectItem>
                            <SelectItem value="certificate">Сертификат</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="text-xs text-muted-foreground">
                          <p>Для добавления собственных фонов поместите изображения в папку:</p>
                          <code className="bg-muted p-1 rounded text-xs">/public/certificates/</code>
                          <p className="mt-1">Формат имен: diploma-bg.jpg, gratitude-bg.jpg, certificate-bg.jpg</p>
                          <p className="mt-1">Рекомендуемый размер: 210мм × 297мм (A4), 300 DPI</p>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </h2>
              
              <div className="flex flex-col gap-4">
                {/* Winner (First Place) */}
                {winner && (
                  <Card className="bg-amber-100 border-amber-300 dark:bg-amber-900/30 dark:border-amber-800">
                    <CardContent className="p-6 flex items-center">
                      <div className="flex-1 flex items-center gap-4">
                        <div className="rounded-full bg-amber-200 dark:bg-amber-800 p-3">
                          <Trophy className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">1 место</h3>
                          <p className="text-xl">{winner.name}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Certificate 
                          tournament={currentTournament}
                          team={winner}
                          place={1}
                          template={selectedTemplate}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Second Place */}
                {second && (
                  <Card className="bg-slate-100 border-slate-300 dark:bg-slate-800/30 dark:border-slate-700">
                    <CardContent className="p-6 flex items-center">
                      <div className="flex-1 flex items-center gap-4">
                        <div className="rounded-full bg-slate-200 dark:bg-slate-700 p-3">
                          <Medal className="h-8 w-8 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">2 место</h3>
                          <p className="text-lg">{second.name}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Certificate 
                          tournament={currentTournament}
                          team={second}
                          place={2}
                          template={selectedTemplate}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Third Place */}
                {third && (
                  <Card className="bg-orange-100 border-orange-300 dark:bg-orange-900/30 dark:border-orange-800">
                    <CardContent className="p-6 flex items-center">
                      <div className="flex-1 flex items-center gap-4">
                        <div className="rounded-full bg-orange-200 dark:bg-orange-800 p-3">
                          <Award className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">3 место</h3>
                          <p className="text-lg">{third.name}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Certificate 
                          tournament={currentTournament}
                          team={third}
                          place={3}
                          template={selectedTemplate}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {(!winner && !second && !third) && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">Невозможно определить призёров. Недостаточно данных.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
      
      <AlertDialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Начать турнир</AlertDialogTitle>
            <AlertDialogDescription>
              {!canStart && validation.message ? (
                validation.message
              ) : (
                "Вы уверены, что хотите начать турнир? Это заблокирует регистрацию команд и сгенерирует турнирную сетку."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartTournament} disabled={!canStart}>
              Начать турнир
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить турнир</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить этот турнир? Все данные будут утеряны.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTournament}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default TournamentDetails;
