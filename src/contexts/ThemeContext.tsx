
import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Try to get theme from localStorage
    const savedTheme = localStorage.getItem("theme") as Theme;
    
    // Check for system preference if no saved theme
    if (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    
    return savedTheme || "light";
  });

  // Apply theme class to html element
  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    
    // Save theme preference to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
};
