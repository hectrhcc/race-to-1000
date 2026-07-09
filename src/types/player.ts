export interface Player {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  club: string;
  clubBadge?: string;
  goals: number;
  image: string;
  updatedAt: string;
  position: string;
  age: number;
}

export interface HistoryEntry {
  date?: string;
  players?: Record<string, number> | null;
  scores?: Record<string, number> | null;
}

export interface PlayerWithRank extends Player {
  rank: number;
  goalsSinceLastMonth?: number;
}
