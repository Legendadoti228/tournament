
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TournamentProvider } from "@/contexts/TournamentContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

import Index from "./pages/Index";
import CreateTournament from "./pages/CreateTournament";
import TournamentDetails from "./pages/TournamentDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <TournamentProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/create" element={<CreateTournament />} />
              <Route path="/tournament/:id" element={<TournamentDetails />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TournamentProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
