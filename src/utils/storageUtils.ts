
import { Tournament } from "../types/tournament";

// File-based storage constants
const STORAGE_PATH = "/app/data/"; // Path where data will be stored on the server
const TOURNAMENTS_FILE = "tournaments.json"; // File name for tournaments data

// Helper function to read tournaments from the server
async function readTournamentsFromServer(): Promise<Tournament[]> {
  try {
    const response = await fetch(`${STORAGE_PATH}${TOURNAMENTS_FILE}`);
    if (!response.ok) {
      console.warn("Could not read tournaments from server, using empty array");
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Error reading tournaments:", error);
    return [];
  }
}

// Helper function to write tournaments to the server
async function writeTournamentsToServer(tournaments: Tournament[]): Promise<boolean> {
  try {
    const response = await fetch(`${STORAGE_PATH}${TOURNAMENTS_FILE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tournaments),
    });
    return response.ok;
  } catch (error) {
    console.error("Error writing tournaments:", error);
    return false;
  }
}

// Fallback to localStorage if server storage is unavailable
function saveToLocalStorage(tournaments: Tournament[]): void {
  localStorage.setItem("tournaments", JSON.stringify(tournaments));
}

function getFromLocalStorage(): Tournament[] {
  const tournamentsJSON = localStorage.getItem("tournaments");
  return tournamentsJSON ? JSON.parse(tournamentsJSON) : [];
}

// Main API functions
export async function saveTournament(tournament: Tournament): Promise<void> {
  let tournaments = await getAllTournaments();
  const index = tournaments.findIndex(t => t.id === tournament.id);
  
  if (index !== -1) {
    tournaments[index] = tournament;
  } else {
    tournaments.push(tournament);
  }
  
  const success = await writeTournamentsToServer(tournaments);
  if (!success) {
    // Fallback to localStorage if server storage fails
    saveToLocalStorage(tournaments);
  }
}

export async function getTournament(id: string): Promise<Tournament | null> {
  const tournaments = await getAllTournaments();
  return tournaments.find(tournament => tournament.id === id) || null;
}

export async function getAllTournaments(): Promise<Tournament[]> {
  // Try to get from server first
  const serverTournaments = await readTournamentsFromServer();
  if (serverTournaments.length > 0) {
    return serverTournaments;
  }
  
  // Fallback to localStorage
  return getFromLocalStorage();
}

export async function deleteTournament(id: string): Promise<void> {
  const tournaments = await getAllTournaments();
  const filteredTournaments = tournaments.filter(tournament => tournament.id !== id);
  
  const success = await writeTournamentsToServer(filteredTournaments);
  if (!success) {
    // Fallback to localStorage if server storage fails
    saveToLocalStorage(filteredTournaments);
  }
}
