
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface TeamRegistrationFormProps {
  onAddTeam: (teamName: string, members?: string[]) => void;
}

const TeamRegistrationForm = ({ onAddTeam }: TeamRegistrationFormProps) => {
  const [teamName, setTeamName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const { toast } = useToast();

  const handleAddMember = () => {
    if (!memberName.trim()) return;
    
    setMembers([...members, memberName]);
    setMemberName('');
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName.trim()) {
      toast({
        title: "Ошибка",
        description: "Название команды обязательно.",
        variant: "destructive",
      });
      return;
    }
    
    onAddTeam(teamName, members);
    
    // Reset form
    setTeamName('');
    setMembers([]);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Регистрация команды</CardTitle>
        <CardDescription>
          Добавить команду в турнир
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamName">Название команды</Label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Введите название команды"
              required
            />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label>Участники команды (Необязательно)</Label>
            
            <div className="flex space-x-2">
              <Input
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="Введите имя участника"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddMember}
                disabled={!memberName.trim()}
              >
                Добавить
              </Button>
            </div>
            
            {members.length > 0 && (
              <div className="mt-2">
                <Label className="text-sm text-muted-foreground">Участники:</Label>
                <ul className="mt-1 space-y-1">
                  {members.map((member, index) => (
                    <li 
                      key={index} 
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                    >
                      <span>{member}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(index)}
                      >
                        ✕
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full"
            disabled={!teamName.trim()}
          >
            Зарегистрировать команду
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TeamRegistrationForm;
