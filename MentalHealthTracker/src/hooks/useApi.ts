import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiService, ApiError } from '../services/api';
import { 
  MOOD_LEVELS, 
  ACTIVITY_CATEGORIES, 
  GOAL_TYPES, 
  GOAL_STATUS 
} from '../config';

// Query Keys
export const queryKeys = {
  // User
  user: ['user'] as const,
  userProfile: ['user', 'profile'] as const,
  
  // Moods
  moods: ['moods'] as const,
  
  // Activities
  activities: ['activities'] as const,
  activitiesByCategory: (category: string) => ['activities', 'category', category] as const,
  
  // Goals
  goals: ['goals'] as const,
  goal: (id: string) => ['goal', id] as const,
  
  // Daily Entries
  dailyEntries: ['dailyEntries'] as const,
  todayEntry: ['dailyEntries', 'today'] as const,
  entryByDate: (date: string) => ['dailyEntries', 'date', date] as const,
  recentEntries: (days: number) => ['dailyEntries', 'recent', days] as const,
  
  // Mood Logs
  moodLogs: ['moodLogs'] as const,
  todayMoodLogs: ['moodLogs', 'today'] as const,
  moodLogsByDateRange: (startDate: string, endDate: string) => 
    ['moodLogs', 'dateRange', startDate, endDate] as const,
  
  // Suggestions
  suggestions: ['suggestions'] as const,
  unreadSuggestions: ['suggestions', 'unread'] as const,

  // Assessments
  assessments: ['assessments'] as const,
  assessmentResponses: ['assessmentResponses'] as const,
} as const;

// User Hooks
export const useUserProfile = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.userProfile,
    queryFn: () => apiService.getUserProfile(),
    enabled: apiService.isAuthenticated(),
    ...options,
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiService.updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userProfile });
    },
  });
};

// Mood Hooks
export const useMoods = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.moods,
    queryFn: () => apiService.getMoods(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Activity Hooks
export const useActivities = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.activities,
    queryFn: () => apiService.getActivities(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useActivitiesByCategory = (category: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.activitiesByCategory(category),
    queryFn: () => apiService.getActivitiesByCategory(category),
    enabled: !!category,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

// Goal Hooks
export const useGoals = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.goals,
    queryFn: () => apiService.getGoals(),
    enabled: apiService.isAuthenticated(),
    ...options,
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiService.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals });
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiService.updateGoal(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goal(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals });
    },
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals });
    },
  });
};

export const useUpdateGoalProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, currentValue }: { id: string; currentValue: number }) => 
      apiService.updateGoalProgress(id, currentValue),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goal(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals });
    },
  });
};

// Daily Entry Hooks
export const useDailyEntries = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.dailyEntries,
    queryFn: () => apiService.getDailyEntries(),
    enabled: apiService.isAuthenticated(),
    ...options,
  });
};

export const useTodayEntry = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.todayEntry,
    queryFn: () => apiService.getTodayEntry(),
    enabled: apiService.isAuthenticated(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    ...options,
  });
};

export const useEntryByDate = (date: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.entryByDate(date),
    queryFn: () => apiService.getEntryByDate(date),
    enabled: apiService.isAuthenticated() && !!date,
    ...options,
  });
};

export const useRecentEntries = (days: number = 7, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.recentEntries(days),
    queryFn: () => apiService.getRecentEntries(days),
    enabled: apiService.isAuthenticated(),
    ...options,
  });
};

export const useCreateDailyEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiService.createDailyEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dailyEntries });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayEntry });
      queryClient.invalidateQueries({ queryKey: queryKeys.recentEntries(7) });
    },
  });
};

export const useUpdateDailyEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiService.updateDailyEntry(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dailyEntries });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayEntry });
      queryClient.invalidateQueries({ queryKey: queryKeys.recentEntries(7) });
    },
  });
};

export const useDeleteDailyEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteDailyEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dailyEntries });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayEntry });
      queryClient.invalidateQueries({ queryKey: queryKeys.recentEntries(7) });
    },
  });
};

// Mood Log Hooks
export const useMoodLogs = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.moodLogs,
    queryFn: () => apiService.getMoodLogs(),
    enabled: apiService.isAuthenticated(),
    ...options,
  });
};

export const useTodayMoodLogs = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.todayMoodLogs,
    queryFn: () => apiService.getTodayMoodLogs(),
    enabled: apiService.isAuthenticated(),
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    ...options,
  });
};

export const useMoodLogsByDateRange = (startDate: string, endDate: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.moodLogsByDateRange(startDate, endDate),
    queryFn: () => apiService.getMoodLogsByDateRange(startDate, endDate),
    enabled: apiService.isAuthenticated() && !!startDate && !!endDate,
    ...options,
  });
};

export const useCreateMoodLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiService.createMoodLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.moodLogs });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayMoodLogs });
    },
  });
};

export const useUpdateMoodLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiService.updateMoodLog(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.moodLogs });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayMoodLogs });
    },
  });
};

export const useDeleteMoodLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteMoodLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.moodLogs });
      queryClient.invalidateQueries({ queryKey: queryKeys.todayMoodLogs });
    },
  });
};

// Suggestion Hooks
export const useSuggestions = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.suggestions,
    queryFn: () => apiService.getSuggestions(),
    enabled: apiService.isAuthenticated(),
    ...options,
  });
};

export const useUnreadSuggestions = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.unreadSuggestions,
    queryFn: () => apiService.getUnreadSuggestions(),
    enabled: apiService.isAuthenticated(),
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    ...options,
  });
};

export const useMarkSuggestionAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.markSuggestionAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suggestions });
      queryClient.invalidateQueries({ queryKey: queryKeys.unreadSuggestions });
    },
  });
};

// Assessment Hooks
export const useAssessments = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.assessments,
    queryFn: () => apiService.getAssessments(),
    staleTime: 24 * 60 * 60 * 1000,
    ...options,
  });
};

export const useAssessmentResponses = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: queryKeys.assessmentResponses,
    queryFn: () => apiService.getAssessmentResponses(),
    enabled: apiService.isAuthenticated(),
    ...options,
  });
};

export const useSubmitAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { questionnaire_id: number; answers: { question_id: number; value: number }[] }) =>
      apiService.submitAssessmentResponse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessmentResponses });
    },
  });
};

// Authentication Hooks
export const useGoogleAuth = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (idToken: string) => apiService.googleAuth(idToken),
    onSuccess: (data) => {
      // Invalidate all queries to refresh data for the new user
      queryClient.invalidateQueries();
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiService.logout(),
    onSuccess: () => {
      // Clear all queries when logging out
      queryClient.clear();
    },
  });
};

// Utility hook to check authentication status
export const useAuthStatus = () => {
  return {
    isAuthenticated: apiService.isAuthenticated(),
  };
};
