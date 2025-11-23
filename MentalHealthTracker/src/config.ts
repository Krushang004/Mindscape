// API Configuration
// Backend base URL - must be HTTPS for API requests. Replace with your deployed backend URL.
// IMPORTANT: Update this to your actual Django backend URL before building the APK!
// Examples:
//   Local dev (same network): 'http://192.168.0.106:8000'
//   ngrok tunnel: 'https://your-ngrok-url.ngrok-free.app'
//   Production: 'https://your-production-domain.com'
export const API_BASE = 'http://127.0.0.1:8000/auth/google/callback'; // ⚠️ UPDATE THIS TO YOUR DJANGO BACKEND URL!
// Separate base for Google OAuth redirect handler
// This should point to where your /auth/google/callback endpoint is hosted
// If using Django backend, set this to the same as API_BASE (but must be HTTPS for production)
// If using a separate OAuth proxy (like Vercel), set it to that URL
export const OAUTH_REDIRECT_BASE = 'http://127.0.0.1:8000/auth/google/callback'; // ⚠️ MUST MATCH WHERE /auth/google/callback IS HOSTED!
export const API_VERSION = '/api';
export const FULL_API_BASE = `${API_BASE}${API_VERSION}`;

// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = 'your-google-client-id-here'; // Set this in your .env

// App Configuration
export const APP_NAME = 'Mental Health Tracker';
export const APP_VERSION = '1.0.0';

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  THEME: 'theme',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  GOOGLE_AUTH: '/auth/google',
  
  // Users
  USERS: '/users',
  USER_PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/update_profile',
  REQUEST_PASSWORD_RESET_OTP: '/users/request_password_reset_otp',
  VERIFY_PASSWORD_RESET_OTP: '/users/verify_password_reset_otp',
  RESET_PASSWORD: '/users/reset_password',
  
  // Moods
  MOODS: '/moods',
  
  // Activities
  ACTIVITIES: '/activities',
  ACTIVITIES_BY_CATEGORY: '/activities/by_category',
  
  // Goals
  GOALS: '/goals',
  GOAL_PROGRESS: (id: string) => `/goals/${id}/update_progress`,
  
  // Daily Entries
  DAILY_ENTRIES: '/daily-entries',
  TODAY_ENTRY: '/daily-entries/today',
  ENTRY_BY_DATE: '/daily-entries/by_date',
  RECENT_ENTRIES: '/daily-entries/recent',
  
  // Mood Logs
  MOOD_LOGS: '/mood-logs',
  TODAY_MOOD_LOGS: '/mood-logs/today',
  MOOD_LOGS_BY_DATE_RANGE: '/mood-logs/by_date_range',
  
  // Suggestions
  SUGGESTIONS: '/suggestions',
  MARK_SUGGESTION_READ: (id: string) => `/suggestions/${id}/mark_as_read`,
  UNREAD_SUGGESTIONS: '/suggestions/unread',

  // Assessments
  ASSESSMENTS: '/assessments',
  ASSESSMENT_RESPONSES: '/assessment-responses',
} as const;

// Mood Configuration
export const MOOD_LEVELS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  NEUTRAL: 'neutral',
  BAD: 'bad',
  TERRIBLE: 'terrible',
} as const;

// Activity Categories
export const ACTIVITY_CATEGORIES = {
  EXERCISE: 'exercise',
  SOCIAL: 'social',
  CREATIVE: 'creative',
  LEARNING: 'learning',
  RELAXATION: 'relaxation',
  WORK: 'work',
  OTHER: 'other',
} as const;

// Goal Types
export const GOAL_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  LONG_TERM: 'long_term',
} as const;

// Goal Status
export const GOAL_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
} as const;

