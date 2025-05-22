import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
const Header = () => {
  const {
    theme,
    toggleTheme
  } = useTheme();
  return <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Менеджер турниров МОУ Раменская СОШ №9</Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Button variant="secondary" asChild>
                <Link to="/">Главная</Link>
              </Button>
            </li>
            <li>
              <Button variant="outline" size="icon" onClick={toggleTheme}>
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <span className="sr-only">Переключить тему</span>
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </header>;
};
export default Header;