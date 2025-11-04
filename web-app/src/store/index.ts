import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MoodEntry, User, UserSettings, Goal, Activity, DashboardData, MonthlyStats } from '../types';

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  
  // Data
  entries: MoodEntry[];
  goals: Goal[];
  activities: Activity[];
  settings: UserSettings;
  
  // Computed getters
  get moodEntries(): MoodEntry[];
  
  // UI State
  isLoading: boolean;
  theme: 'light' | 'dark' | 'auto';
  sidebarOpen: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  addEntry: (entry: MoodEntry) => void;
  updateEntry: (id: string, updates: Partial<MoodEntry>) => void;
  deleteEntry: (id: string) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addActivity: (activity: Activity) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  
  // Computed
  getDashboardData: () => DashboardData;
  getMonthlyStats: (month: string) => MonthlyStats;
  getEntriesByDate: (date: string) => MoodEntry[];
  getCurrentStreak: () => number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      entries: [],
      goals: [],
      activities: [],
      settings: {
        id: '1',
        name: 'User',
        reminderTime: '20:00',
        reminderEnabled: true,
        theme: 'auto',
        notificationsEnabled: true,
        dataExportEnabled: true,
        privacyMode: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      isLoading: false,
      theme: 'auto',
      sidebarOpen: false,

      // Actions
      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      
      addEntry: (entry) => set((state) => ({
        entries: [...state.entries, entry]
      })),
      
      updateEntry: (id, updates) => set((state) => ({
        entries: state.entries.map(entry =>
          entry.id === id ? { ...entry, ...updates, updatedAt: new Date().toISOString() } : entry
        )
      })),
      
      deleteEntry: (id) => set((state) => ({
        entries: state.entries.filter(entry => entry.id !== id)
      })),
      
      addGoal: (goal) => set((state) => ({
        goals: [...state.goals, goal]
      })),
      
      updateGoal: (id, updates) => set((state) => ({
        goals: state.goals.map(goal =>
          goal.id === id ? { ...goal, ...updates, updatedAt: new Date().toISOString() } : goal
        )
      })),
      
      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter(goal => goal.id !== id)
      })),
      
      addActivity: (activity) => set((state) => ({
        activities: [...state.activities, activity]
      })),
      
      updateActivity: (id, updates) => set((state) => ({
        activities: state.activities.map(activity =>
          activity.id === id ? { ...activity, ...updates } : activity
        )
      })),
      
      deleteActivity: (id) => set((state) => ({
        activities: state.activities.filter(activity => activity.id !== id)
      })),
      
      updateSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings, updatedAt: new Date().toISOString() }
      })),
      
      setTheme: (theme) => set({ theme }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setLoading: (loading) => set({ isLoading: loading }),

      // Computed getters
      get moodEntries() {
        return get().entries;
      },

      // Computed
      getDashboardData: () => {
        const state = get();
        const entries = state.entries;
        const totalEntries = entries.length;
        const averageMood = totalEntries > 0 
          ? entries.reduce((sum, entry) => sum + entry.moodLevel, 0) / totalEntries 
          : 0;
        
        // Get recent entries (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentEntries = entries.filter(entry => 
          new Date(entry.date) >= sevenDaysAgo
        ).slice(-5);

        // Weekly mood data
        const weeklyMoodData = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const dayEntries = entries.filter(entry => entry.date === dateStr);
          const avgMood = dayEntries.length > 0 
            ? dayEntries.reduce((sum, entry) => sum + entry.moodLevel, 0) / dayEntries.length 
            : 0;
          return { date: dateStr, mood: avgMood };
        }).reverse();

        // Mood distribution
        const moodCounts: { [key: string]: number } = {};
        entries.forEach(entry => {
          moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
        });
        const moodDistribution = Object.entries(moodCounts).map(([mood, count]) => ({
          mood,
          count
        }));

        return {
          currentStreak: state.getCurrentStreak(),
          totalEntries,
          averageMood: Math.round(averageMood * 10) / 10,
          weeklyMoodData,
          monthlyMoodData: weeklyMoodData, // Simplified for now
          recentEntries,
          moodDistribution,
        };
      },

      getMonthlyStats: (month) => {
        const state = get();
        const monthEntries = state.entries.filter(entry => 
          entry.date.startsWith(month)
        );
        
        const totalEntries = monthEntries.length;
        const averageMood = totalEntries > 0 
          ? monthEntries.reduce((sum, entry) => sum + entry.moodLevel, 0) / totalEntries 
          : 0;
        
        const moodCounts: { [key: string]: number } = {};
        monthEntries.forEach(entry => {
          moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
        });

        const allActivities = monthEntries.flatMap(entry => entry.activities);
        const activityCounts: { [key: string]: number } = {};
        allActivities.forEach(activity => {
          activityCounts[activity] = (activityCounts[activity] || 0) + 1;
        });
        const topActivities = Object.entries(activityCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }));

        // Calculate insights
        const insights = [];
        if (averageMood >= 7) {
          insights.push('You had a very positive month! Keep up the great work.');
        } else if (averageMood >= 5) {
          insights.push('Your mood was generally stable this month.');
        } else {
          insights.push('This month was challenging. Remember, it\'s okay to seek support.');
        }

        if (totalEntries >= 20) {
          insights.push('Great consistency in tracking your mood!');
        } else if (totalEntries >= 10) {
          insights.push('Good tracking habits. Try to log more frequently for better insights.');
        } else {
          insights.push('Consider tracking more frequently to get better insights.');
        }

        // Find best and worst days
        const sortedEntries = monthEntries.sort((a, b) => b.moodLevel - a.moodLevel);
        const bestDay = sortedEntries.length > 0 ? sortedEntries[0] : null;
        const worstDay = sortedEntries.length > 0 ? sortedEntries[sortedEntries.length - 1] : null;

        return {
          month,
          totalEntries,
          averageMood: Math.round(averageMood * 10) / 10,
          moodDistribution: moodCounts,
          topActivities,
          insights,
          bestDay,
          worstDay,
        };
      },

      getEntriesByDate: (date) => {
        const state = get();
        return state.entries.filter(entry => entry.date === date);
      },

      getCurrentStreak: () => {
        const state = get();
        const entries = state.entries;
        if (entries.length === 0) return 0;

        const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const today = new Date().toISOString().split('T')[0];
        let streak = 0;
        let currentDate = new Date(today);

        for (let i = 0; i < 365; i++) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const hasEntry = entries.some(entry => entry.date === dateStr);
          
          if (hasEntry) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else {
            break;
          }
        }

        return streak;
      },
    }),
    {
      name: 'mental-health-tracker-storage',
      partialize: (state) => ({
        entries: state.entries,
        goals: state.goals,
        activities: state.activities,
        settings: state.settings,
        theme: state.theme,
      }),
    }
  )
); 