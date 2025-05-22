
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useTournament } from '@/contexts/TournamentContext';
import TournamentCard from '@/components/TournamentCard';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const Index = () => {
  const { tournaments, deleteTournament } = useTournament();
  const [tournamentToDelete, setTournamentToDelete] = React.useState<string | null>(null);
  
  const handleDeleteConfirm = () => {
    if (tournamentToDelete) {
      deleteTournament(tournamentToDelete);
      setTournamentToDelete(null);
    }
  };
  
  const openDeleteDialog = (id: string) => {
    setTournamentToDelete(id);
  };

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Менеджер турниров</h1>
          <Button asChild size="lg">
            <Link to="/create">Создать новый турнир</Link>
          </Button>
        </div>
        
        <p className="text-muted-foreground text-lg mb-6">
          Создавайте и управляйте турнирами с разными системами - Олимпийская, С подвалом и Круговая.
        </p>
      </div>
      
      {tournaments.length === 0 ? (
        <div className="text-center p-12 bg-muted/30 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Турниров пока нет</h2>
          <p className="text-muted-foreground mb-6">
            Создайте свой первый турнир, чтобы начать!
          </p>
          <Button asChild size="lg">
            <Link to="/create">Создать турнир</Link>
          </Button>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-semibold mb-4">Ваши турниры</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map(tournament => (
              <TournamentCard 
                key={tournament.id} 
                tournament={tournament} 
                onDelete={openDeleteDialog} 
              />
            ))}
          </div>
        </>
      )}
      
      <AlertDialog open={!!tournamentToDelete} onOpenChange={(open) => !open && setTournamentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить турнир</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить этот турнир? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Index;
