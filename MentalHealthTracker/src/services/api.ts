import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE, FULL_API_BASE, API_ENDPOINTS, STORAGE_KEYS } from '../config';

// Types for API responses
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// API Error class
export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// API Service class
class ApiService {
  private api: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await this.logout();
        }
        return Promise.reject(error);
      }
    );

    // Initialize auth token
    this.initializeAuth();
  }

  // Initialize authentication
  private async initializeAuth() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        this.authToken = token;
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    }
  }

  // Set authentication token
  public async setAuthToken(token: string) {
    this.authToken = token;
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  // Clear authentication
  public async logout() {
    this.authToken = null;
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return !!this.authToken;
  }

  // Generic GET request
  private async get<T>(endpoint: string, params?: any): Promise<T> {
    try {
      const response = await this.api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generic POST request
  private async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await this.api.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generic PUT request
  private async put<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await this.api.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generic DELETE request
  private async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await this.api.delete(endpoint);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  private handleError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.detail || 'Server error';
      return new ApiError(message, error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      return new ApiError('No response from server', 0);
    } else {
      // Something else happened
      return new ApiError(error.message || 'Unknown error', 0);
    }
  }

  // Authentication methods
  public async googleAuth(idToken: string) {
    const response = await this.post<{ token: string; user: any }>(
      API_ENDPOINTS.GOOGLE_AUTH,
      { idToken }
    );
    
    if (response.token) {
      await this.setAuthToken(response.token);
    }
    
    return response;
  }

  // User methods
  public async getUserProfile() {
    return this.get(API_ENDPOINTS.USER_PROFILE);
  }

  public async updateUserProfile(data: any) {
    return this.put(API_ENDPOINTS.UPDATE_PROFILE, data);
  }

  // Mood methods
  public async getMoods() {
    return this.get<PaginatedResponse<any>>(API_ENDPOINTS.MOODS);
  }

  // Activity methods
  public async getActivities() {
    return this.get<PaginatedResponse<any>>(API_ENDPOINTS.ACTIVITIES);
  }

  public async getActivitiesByCategory(category: string) {
    return this.get(API_ENDPOINTS.ACTIVITIES_BY_CATEGORY, { category });
  }

  // Goal methods
  public async getGoals() {
    return this.get<PaginatedResponse<any>>(API_ENDPOINTS.GOALS);
  }

  public async createGoal(data: any) {
    return this.post(API_ENDPOINTS.GOALS, data);
  }

  public async updateGoal(id: string, data: any) {
    return this.put(`${API_ENDPOINTS.GOALS}/${id}`, data);
  }

  public async deleteGoal(id: string) {
    return this.delete(`${API_ENDPOINTS.GOALS}/${id}`);
  }

  public async updateGoalProgress(id: string, currentValue: number) {
    return this.post(API_ENDPOINTS.GOAL_PROGRESS(id), { current_value: currentValue });
  }

  // Daily Entry methods
  public async getDailyEntries() {
    return this.get<PaginatedResponse<any>>(API_ENDPOINTS.DAILY_ENTRIES);
  }

  public async getTodayEntry() {
    return this.get(API_ENDPOINTS.TODAY_ENTRY);
  }

  public async getEntryByDate(date: string) {
    return this.get(API_ENDPOINTS.ENTRY_BY_DATE, { date });
  }

  public async getRecentEntries(days: number = 7) {
    return this.get(API_ENDPOINTS.RECENT_ENTRIES, { days });
  }

  public async createDailyEntry(data: any) {
    return this.post(API_ENDPOINTS.DAILY_ENTRIES, data);
  }

  public async updateDailyEntry(id: string, data: any) {
    return this.put(`${API_ENDPOINTS.DAILY_ENTRIES}/${id}`, data);
  }

  public async deleteDailyEntry(id: string) {
    return this.delete(`${API_ENDPOINTS.DAILY_ENTRIES}/${id}`);
  }

  // Mood Log methods
  public async getMoodLogs() {
    return this.get<PaginatedResponse<any>>(API_ENDPOINTS.MOOD_LOGS);
  }

  public async getTodayMoodLogs() {
    return this.get(API_ENDPOINTS.TODAY_MOOD_LOGS);
  }

  public async getMoodLogsByDateRange(startDate: string, endDate: string) {
    return this.get(API_ENDPOINTS.MOOD_LOGS_BY_DATE_RANGE, { start_date: startDate, end_date: endDate });
  }

  public async createMoodLog(data: any) {
    return this.post(API_ENDPOINTS.MOOD_LOGS, data);
  }

  public async updateMoodLog(id: string, data: any) {
    return this.put(`${API_ENDPOINTS.MOOD_LOGS}/${id}`, data);
  }

  public async deleteMoodLog(id: string) {
    return this.delete(`${API_ENDPOINTS.MOOD_LOGS}/${id}`);
  }

  // Suggestion methods
  public async getSuggestions() {
    return this.get<PaginatedResponse<any>>(API_ENDPOINTS.SUGGESTIONS);
  }

  public async getUnreadSuggestions() {
    return this.get(API_ENDPOINTS.UNREAD_SUGGESTIONS);
  }

  public async markSuggestionAsRead(id: string) {
    return this.post(API_ENDPOINTS.MARK_SUGGESTION_READ(id));
  }

  // Assessment methods
  public async getAssessments() {
    return this.get<PaginatedResponse<any>>(API_ENDPOINTS.ASSESSMENTS);
  }

  public async getAssessmentResponses() {
    return this.get<PaginatedResponse<any>>(API_ENDPOINTS.ASSESSMENT_RESPONSES);
  }

  public async submitAssessmentResponse(data: { questionnaire_id: number; answers: { question_id: number; value: number }[] }) {
    return this.post(API_ENDPOINTS.ASSESSMENT_RESPONSES, data);
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
