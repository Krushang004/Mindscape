export interface Entry {
  id: string;
  date: string;
  emoji: string;
  mood: string;
  summary: string;
  journal: string;
  suggestions: string[];
}

export interface MoodSuggestion {
  mood: string;
  suggestions: string[];
} 