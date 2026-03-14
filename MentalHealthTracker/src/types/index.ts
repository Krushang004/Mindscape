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
  totalEntries: number;
  averageMood: number;
  mostFrequentMood: string;
  moodDistribution: { [key: string]: number };
  topActivities: string[];
  averageSleep: number;
  averageExercise: number;
  averageWater: number;
  averageStress: number;
  averageEnergy: number;
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
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: string;
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
  password?: string;
  reminderTime: string; // HH:MM format
  reminderEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  notificationsEnabled: boolean;
  dataExportEnabled: boolean;
  privacyMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Theme = 'light' | 'dark' | 'auto';

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

export interface Nominee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  relationship: string; // e.g., "Spouse", "Parent", "Friend", "Therapist"
  stressThreshold: number; // 1-10 scale - when to notify
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NomineeAlert {
  id: string;
  nomineeId: string;
  userId: string;
  stressLevel: number;
  date: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ExportData {
  entries: MoodEntry[];
  stats: MonthlyStats[];
  settings: UserSettings;
  exportDate: string;
  version: string;
}

// New Feature Types

export interface MeditationSession {
  id: string;
  name: string;
  duration: number; // in minutes
  type: 'breathing' | 'mindfulness' | 'guided' | 'body_scan' | 'loving_kindness';
  description: string;
  audioUrl?: string;
  instructions: string[];
  moodBefore?: number; // 1-10 scale
  moodAfter?: number; // 1-10 scale
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: 'wellness' | 'productivity' | 'social' | 'learning' | 'fitness' | 'mindfulness';
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number; // e.g., 1 for daily, 3 for weekly
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  isActive: boolean;
  reminderTime?: string; // HH:MM format
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  notes?: string;
  mood?: number; // 1-10 scale
  createdAt: string;
}

export interface Insight {
  id: string;
  type: 'mood_pattern' | 'habit_correlation' | 'activity_impact' | 'sleep_mood' | 'stress_trend';
  title: string;
  description: string;
  data: any; // Flexible data structure for different insight types
  confidence: number; // 0-1 scale
  actionable: boolean;
  recommendations: string[];
  createdAt: string;
}

export interface AnalyticsData {
  moodTrends: {
    period: string;
    averageMood: number;
    moodVariance: number;
    trend: 'improving' | 'declining' | 'stable';
  }[];
  habitPerformance: {
    habitId: string;
    habitName: string;
    completionRate: number;
    averageStreak: number;
    moodImpact: number;
  }[];
  activityCorrelations: {
    activity: string;
    moodImprovement: number;
    frequency: number;
    recommendation: string;
  }[];
  sleepMoodCorrelation: {
    sleepHours: number;
    averageMood: number;
    dataPoints: number;
  }[];
  stressPatterns: {
    dayOfWeek: string;
    averageStress: number;
    frequency: number;
  }[];
} 