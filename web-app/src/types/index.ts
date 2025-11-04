export interface MoodEntry {
  id: string;
  date: string;
  emoji: string;
  mood: string;
  moodLevel: number; // 1-10 scale
  summary: string;
  journal: string;
  activities: string[];
  sleepHours?: number;
  exerciseMinutes?: number;
  waterIntake?: number;
  stressLevel?: number; // 1-10 scale
  energyLevel?: number; // 1-10 scale
  createdAt: string;
  updatedAt: string;
}

export interface MoodSuggestion {
  mood: string;
  suggestions: string[];
  activities: string[];
  affirmations: string[];
}

export interface MonthlyStats {
  month: string;
  totalEntries: number;
  averageMood: number;
  moodDistribution: { [key: string]: number };
  topActivities: { name: string; count: number }[];
  insights: string[];
  bestDay?: MoodEntry | null;
  worstDay?: MoodEntry | null;
}

export interface DashboardData {
  currentStreak: number;
  totalEntries: number;
  averageMood: number;
  weeklyMoodData: { date: string; mood: number }[];
  monthlyMoodData: { date: string; mood: number }[];
  recentEntries: MoodEntry[];
  moodDistribution: { mood: string; count: number }[];
}

export interface Activity {
  id: string;
  name: string;
  category: 'exercise' | 'mindfulness' | 'social' | 'creative' | 'self-care';
  description: string;
  duration: number; // in minutes
  moodBoost: number; // 1-10 scale
  icon?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: string;
  category?: string;
  priority?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'achievement' | 'suggestion';
  scheduledTime: string;
  read: boolean;
  createdAt: string;
}

export interface UserSettings {
  id: string;
  name: string;
  email?: string;
  reminderTime: string; // HH:MM format
  reminderEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  notificationsEnabled: boolean;
  dataExportEnabled: boolean;
  privacyMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MoodEmoji {
  emoji: string;
  mood: string;
  color: string;
  description: string;
  moodLevel: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: string;
    strokeWidth?: number;
  }[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ExportData {
  entries: MoodEntry[];
  stats: MonthlyStats[];
  settings: UserSettings;
  exportDate: string;
  version: string;
} 