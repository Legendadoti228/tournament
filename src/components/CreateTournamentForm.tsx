
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournament } from '@/contexts/TournamentContext';
import { TournamentType } from '@/types/tournament';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

const CreateTournamentForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TournamentType>('single-elimination');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createTournament } = useTournament();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const newTournament = await createTournament(name, description, type);
      navigate(`/tournament/${newTournament.id}`);
    } catch (error) {
      console.error('Failed to create tournament:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Создать новый турнир</CardTitle>
        <CardDescription>
          Заполните детали для создания вашего турнира
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название турнира</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название турнира"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Введите описание турнира"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Тип турнира</Label>
            <RadioGroup 
              value={type} 
              onValueChange={(value) => setType(value as TournamentType)}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="single" value="single-elimination" />
                <Label htmlFor="single">Олимпийская система</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="double" value="double-elimination" />
                <Label htmlFor="double">С подвалом</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="round-robin" value="round-robin" />
                <Label htmlFor="round-robin">Круговая система</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="swiss" value="swiss" />
                <Label htmlFor="swiss">Швейцарская система</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full"
            disabled={!name.trim() || isSubmitting}
          >
            {isSubmitting ? 'Создание...' : 'Создать турнир'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreateTournamentForm;
