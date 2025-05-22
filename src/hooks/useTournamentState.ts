import { useState, useEffect, useCallback } from 'react';
import { Tournament, TournamentType, Team } from '../types/tournament';
import { 
  createNewTournament, 
  addTeam, 
  startTournament, 
  updateMatchScore as updateTournamentMatchScore,
  validateTournamentStart,
  determineTournamentWinner
} from '../utils/tournamentUtils';
import { 
  saveTournament, 
  getTournament, 
  getAllTournaments, 
  deleteTournament as deleteStoredTournament
} from '../utils/storageUtils';
import { useToast } from '@/hooks/use-toast';

export function useTournamentState() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load tournaments on component mount
  useEffect(() => {
    const fetchTournaments = async () => {
      setIsLoading(true);
      try {
        const loadedTournaments = await getAllTournaments();
        setTournaments(loadedTournaments);
      } catch (error) {
        console.error("Error loading tournaments:", error);
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить турниры с сервера",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournaments();
  }, [toast]);

  const createTournament = useCallback(async (name: string, description: string, type: TournamentType) => {
    const newTournament = createNewTournament(name, description, type as any);
    
    try {
      await saveTournament(newTournament);
      setCurrentTournament(newTournament);
      setTournaments(prev => [...prev, newTournament]);
      
      toast({
        title: "Турнир создан",
        description: `Турнир "${name}" успешно создан.`,
      });
      
      return newTournament;
    } catch (error) {
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить новый турнир",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const loadTournament = useCallback(async (id: string) => {
    try {
      const tournament = await getTournament(id);
      if (tournament) {
        setCurrentTournament(tournament);
      } else {
        toast({
          title: "Турнир не найден",
          description: "Запрошенный турнир не найден.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить данные турнира",
        variant: "destructive",
      });
    }
  }, [toast]);

  const addTeamToTournament = useCallback(async (teamName: string, members?: string[]) => {
    if (!currentTournament) {
      toast({
        title: "Ошибка",
        description: "Нет активного турнира.",
        variant: "destructive",
      });
      return;
    }

    if (currentTournament.status !== 'registration') {
      toast({
        title: "Невозможно добавить команду",
        description: "Команды можно добавлять только на этапе регистрации.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedTournament = addTeam(currentTournament, teamName, members);
      await saveTournament(updatedTournament);
      
      setCurrentTournament(updatedTournament);
      setTournaments(prev => 
        prev.map(t => t.id === updatedTournament.id ? updatedTournament : t)
      );
      
      toast({
        title: "Команда добавлена",
        description: `Команда "${teamName}" добавлена в турнир.`,
      });
    } catch (error) {
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить новую команду",
        variant: "destructive",
      });
    }
  }, [currentTournament, toast]);

  const updateMatchScore = useCallback(async (matchId: string, team1Score: number, team2Score: number) => {
    if (!currentTournament) {
      toast({
        title: "Ошибка",
        description: "Нет активного турнира.",
        variant: "destructive",
      });
      return;
    }

    if (currentTournament.status !== 'ongoing') {
      toast({
        title: "Невозможно обновить счёт",
        description: "Счёт можно обновлять только во время проведения турнира.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedTournament = updateTournamentMatchScore(
        currentTournament, 
        matchId, 
        team1Score, 
        team2Score
      );
      
      await saveTournament(updatedTournament);
      
      setCurrentTournament(updatedTournament);
      setTournaments(prev => 
        prev.map(t => t.id === updatedTournament.id ? updatedTournament : t)
      );
      
      // Check if tournament is completed
      if (updatedTournament.status === 'completed' && currentTournament.status === 'ongoing') {
        const winnerTeam = updatedTournament.teams.find(team => team.id === updatedTournament.winnerId);
        
        toast({
          title: "Турнир завершен",
          description: winnerTeam 
            ? `Победитель турнира: ${winnerTeam.name}` 
            : "Все матчи турнира сыграны.",
        });
        return;
      }
      
      // Special message for Swiss tournament advancing to next round
      if (
        currentTournament.type === 'swiss' && 
        updatedTournament.currentRound && 
        currentTournament.currentRound && 
        updatedTournament.currentRound > currentTournament.currentRound
      ) {
        toast({
          title: "Раунд завершен",
          description: `Начат раунд ${updatedTournament.currentRound}`,
        });
      } else {
        toast({
          title: "Матч обновлён",
          description: "Счёт матча успешно обновлён.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Ошибка обновления матча",
        description: error.message || "Произошла ошибка при обновлении матча.",
        variant: "destructive",
      });
    }
  }, [currentTournament, toast]);

  const startCurrentTournament = useCallback(async () => {
    if (!currentTournament) {
      toast({
        title: "Ошибка",
        description: "Нет активного турнира.",
        variant: "destructive",
      });
      return;
    }

    if (currentTournament.status !== 'registration') {
      toast({
        title: "Невозможно начать турнир",
        description: "Турнир уже начался или завершён.",
        variant: "destructive",
      });
      return;
    }

    const validation = validateTournamentStart(currentTournament);
    if (!validation.valid) {
      toast({
        title: "Недостаточно команд",
        description: validation.message || "Не удается начать турнир с текущим количеством команд.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedTournament = startTournament(currentTournament);
      await saveTournament(updatedTournament);
      
      setCurrentTournament(updatedTournament);
      setTournaments(prev => 
        prev.map(t => t.id === updatedTournament.id ? updatedTournament : t)
      );
      
      toast({
        title: "Турнир начат",
        description: "Турнир успешно начат.",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка запуска турнира",
        description: error.message || "Произошла ошибка при запуске турнира.",
        variant: "destructive",
      });
    }
  }, [currentTournament, toast]);

  const deleteTournament = useCallback(async (id: string) => {
    try {
      await deleteStoredTournament(id);
      
      if (currentTournament?.id === id) {
        setCurrentTournament(null);
      }
      
      setTournaments(prev => prev.filter(t => t.id !== id));
      
      toast({
        title: "Турнир удалён",
        description: "Турнир успешно удалён.",
      });
    } catch (error) {
      toast({
        title: "Ошибка удаления",
        description: "Не удалось удалить турнир",
        variant: "destructive",
      });
    }
  }, [currentTournament, toast]);

  return {
    tournaments,
    currentTournament,
    isLoading,
    createTournament,
    loadTournament,
    addTeamToTournament,
    updateMatchScore,
    startCurrentTournament,
    deleteTournament,
  };
}
