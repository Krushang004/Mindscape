import React, { useState, useEffect } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { saveUserSettings, getUserSettings, createUser, validateUserCredentials, getUserByEmail } from '../utils/database';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import DailyEntryScreen from '../screens/DailyEntryScreen';
import HistoryScreen from '../screens/HistoryScreen';
import MonthlyReviewScreen from '../screens/MonthlyReviewScreen';
import SuggestionsScreen from '../screens/SuggestionsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import GoalScreen from '../screens/GoalScreen';
import ActivityScreen from '../screens/ActivityScreen';
import NomineesScreen from '../screens/NomineesScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import MeditationScreen from '../screens/MeditationScreen';
import HabitTrackerScreen from '../screens/HabitTrackerScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import AssessmentsScreen from '../screens/AssessmentsScreen';
import { AuthState, LoginCredentials, SignupCredentials, Theme } from '../types';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

async function ensureNotificationPermissions() {
  try {
    if (Platform.OS === 'android') {
      const settings = await Notifications.getPermissionsAsync();
      if (settings.status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    }
  } catch (e) {
    console.log('Notification permission error:', e);
  }
}

const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="DashboardMain"
      component={DashboardScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="DailyEntry"
      component={DailyEntryScreen}
      options={{ title: 'Daily Entry', headerShown: false }}
    />
    <Stack.Screen
      name="Goals"
      component={GoalScreen}
      options={{ title: 'Goals & Achievements' }}
    />
    <Stack.Screen
      name="Activities"
      component={ActivityScreen}
      options={{ title: 'Activities' }}
    />
    <Stack.Screen
      name="Meditation"
      component={MeditationScreen}
      options={{ title: 'Meditation & Breathing' }}
    />
    <Stack.Screen
      name="HabitTracker"
      component={HabitTrackerScreen}
      options={{ title: 'Habit Tracker' }}
    />
    <Stack.Screen
      name="Analytics"
      component={AnalyticsScreen}
      options={{ title: 'Analytics & Insights' }}
    />
    <Stack.Screen
      name="Assessments"
      component={AssessmentsScreen}
      options={{ title: 'Assessments' }}
    />
    <Stack.Screen
      name="Trusted Contacts"
      component={NomineesScreen}
      options={{ title: 'Trusted Contacts' }}
    />
  </Stack.Navigator>
);

const HistoryStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="HistoryMain"
      component={HistoryScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="MonthlyReview"
      component={MonthlyReviewScreen}
      options={{ title: 'Monthly Review' }}
    />
    <Stack.Screen
      name="EntryDetail"
      component={HistoryScreen}
      options={{ title: 'Entry Details' }}
    />
  </Stack.Navigator>
);

const MainTabs = ({ onLogout }: { onLogout: () => void }) => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Add Entry') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Suggestions') {
            iconName = focused ? 'bulb' : 'bulb-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 10,
          paddingTop: 5,
          height: 70,
          // Fix for Expo Go overlapping
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          title: 'Dashboard',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryStack}
        options={{
          title: 'History',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Add Entry"
        component={DailyEntryScreen}
        options={{
          title: 'Add Entry',
        }}
      />
      <Tab.Screen
        name="Suggestions"
        component={SuggestionsScreen}
        options={{
          title: 'Mood Boosters',
        }}
      />
      <Tab.Screen
        name="Settings"
        options={{
          title: 'Settings',
        }}
      >
        {(props) => <SettingsScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { colors } = useTheme();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const navigationTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  useEffect(() => {
    ensureNotificationPermissions();
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedAuth = await AsyncStorage.getItem('is_authenticated');
      const storedUser = await AsyncStorage.getItem('user_auth');
      const storedToken = await AsyncStorage.getItem('auth_token');

      if (storedAuth === 'true' && storedUser) {
        try {
          const user = JSON.parse(storedUser);
          console.log('Found stored authentication, auto-login:', user.email);
          
          // Initialize API service with stored token if available
          if (storedToken) {
            try {
              const { apiService } = await import('../services/api');
              await apiService.setAuthToken(storedToken);
              console.log('AppNavigator: API service token initialized from storage');
            } catch (apiError) {
              console.warn('AppNavigator: Failed to initialize API service token:', apiError);
            }
          }
          
          const userSettings = await getUserSettings();
          if (userSettings && userSettings.email === user.email) {
            const updatedUser = {
              ...user,
              name: userSettings.name,
              email: userSettings.email,
            };
            try {
              await AsyncStorage.setItem('user_auth', JSON.stringify(updatedUser));
              await AsyncStorage.setItem('is_authenticated', 'true');
            } catch (storageError) {
              console.warn('Failed to store auth state:', storageError);
            }
            console.log('AppNavigator: Restoring auth state - user:', updatedUser.email);
            setAuthState({ user: updatedUser, isAuthenticated: true, isLoading: false });
            return;
          }
        } catch (parseError) {
          console.log('Failed to parse stored user data:', parseError);
        }
      }
      console.log('AppNavigator: No valid auth state found, user not authenticated');
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    }
  };

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      console.log('Login attempt with:', credentials.email);

      let { isValid, user: userData } = await validateUserCredentials(credentials.email, credentials.password);

      // Handle Google OAuth login - auto-create user if doesn't exist
      if (!isValid && (credentials.password.startsWith('google_oauth_') || credentials.password === 'google_idtoken_verified')) {
        console.log('No existing account for Google login. Auto-creating user...');
        
        // Try to get user name from temporary Google auth data
        let userName = 'Google User';
        try {
          const googleUserTemp = await AsyncStorage.getItem('google_user_temp');
          if (googleUserTemp) {
            const parsed = JSON.parse(googleUserTemp);
            userName = parsed.name || 'Google User';
            console.log('Using Google user name from temp storage:', userName);
          }
        } catch (e) {
          console.log('Could not get Google user name from temp storage, using default');
        }
        
        const newUser = await createUser(userName, credentials.email, credentials.password);
        const retry = await validateUserCredentials(credentials.email, credentials.password);
        isValid = retry.isValid;
        userData = retry.user;
        console.log('Google user created successfully:', userData?.email);
        
        // Clean up temporary Google user data
        try {
          await AsyncStorage.removeItem('google_user_temp');
        } catch (e) {
          // Ignore cleanup errors
        }
      }

      if (!isValid || !userData) {
        throw new Error('Invalid email or password');
      }

      // Try to get Google user name if this is a Google login
      let googleUserName = null;
      try {
        const googleUserTemp = await AsyncStorage.getItem('google_user_temp');
        if (googleUserTemp) {
          const parsed = JSON.parse(googleUserTemp);
          googleUserName = parsed.name;
        }
      } catch (e) {
        // Ignore errors
      }

      // Use getUserByEmail instead of getUserSettings since user isn't in AsyncStorage yet
      let userSettings = await getUserByEmail(credentials.email);
      console.log('Current user settings:', userSettings);
      console.log('User data from auth:', userData);

      if (!userSettings) {
        // Use Google user name if available, otherwise use userData.name
        const userName = googleUserName || userData.name;
        userSettings = {
          id: userData.id,
          name: userName,
          email: userData.email,
          password: credentials.password, // Preserve the password (google_idtoken_verified)
          reminderTime: '20:00',
          reminderEnabled: true,
          theme: 'light' as Theme,
          notificationsEnabled: true,
          dataExportEnabled: true,
          privacyMode: false,
          createdAt: userData.createdAt,
          updatedAt: new Date().toISOString(),
        };
        await saveUserSettings(userSettings);
      } else {
        // Update name with Google name if available
        if (googleUserName) {
          userSettings.name = googleUserName;
        } else {
          userSettings.name = userData.name;
        }
        userSettings.email = userData.email;
        // Preserve the password (important for Google login)
        if (!userSettings.password) {
          userSettings.password = credentials.password;
        }
        userSettings.updatedAt = new Date().toISOString();
        await saveUserSettings(userSettings);
      }

      // Use Google user name if available for the user object
      const userName = googleUserName || userData.name;
      const user = {
        id: userData.id,
        email: userData.email || '',
        name: userName,
        createdAt: userData.createdAt,
        lastLoginAt: new Date().toISOString(),
      };

      try {
        await AsyncStorage.setItem('user_auth', JSON.stringify(user));
        await AsyncStorage.setItem('is_authenticated', 'true');
        console.log('AppNavigator: Auth state stored in AsyncStorage');
        
        // Also ensure API service has the token if it exists
        try {
          const authToken = await AsyncStorage.getItem('auth_token');
          if (authToken) {
            const { apiService } = await import('../services/api');
            await apiService.setAuthToken(authToken);
            console.log('AppNavigator: API service token initialized');
          }
        } catch (apiError) {
          console.warn('AppNavigator: Failed to initialize API service token:', apiError);
        }
      } catch (storageError) {
        console.warn('Failed to store auth state:', storageError);
      }

      console.log('Login successful, setting auth state. User will be redirected to dashboard.');
      console.log('AppNavigator: Setting auth state - user:', user.email, 'isAuthenticated: true');
      
      // Set auth state - this will trigger navigation update
      setAuthState({ user, isAuthenticated: true, isLoading: false });
      
      // Double-check that state was set correctly
      setTimeout(() => {
        console.log('AppNavigator: Verifying auth state after login...');
        AsyncStorage.getItem('is_authenticated').then((auth) => {
          console.log('AppNavigator: is_authenticated in storage:', auth);
        });
        AsyncStorage.getItem('user_auth').then((userData) => {
          console.log('AppNavigator: user_auth in storage:', userData ? 'exists' : 'missing');
        });
      }, 100);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleSignup = async (credentials: SignupCredentials) => {
    try {
      console.log('Signup attempt with:', credentials.email);

      // Check if user already exists
      const existingUser = await getUserByEmail(credentials.email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      try {
        await AsyncStorage.removeItem('user_auth');
        await AsyncStorage.removeItem('is_authenticated');
      } catch (storageError) {
        console.warn('Failed to clear old auth state:', storageError);
      }

      await createUser(credentials.name, credentials.email, credentials.password);
      const userData = await validateUserCredentials(credentials.email, credentials.password);

      if (!userData.isValid || !userData.user) {
        throw new Error('Failed to create user account');
      }

      const userSettings = {
        id: userData.user.id,
        name: credentials.name,
        email: credentials.email,
        reminderTime: '20:00',
        reminderEnabled: true,
        theme: 'light' as Theme,
        notificationsEnabled: true,
        dataExportEnabled: true,
        privacyMode: false,
        createdAt: userData.user.createdAt,
        updatedAt: new Date().toISOString(),
      };
      await saveUserSettings(userSettings);

      const user = {
        id: userData.user.id,
        email: credentials.email,
        name: credentials.name,
        createdAt: userData.user.createdAt,
        lastLoginAt: new Date().toISOString(),
      };

      try {
        await AsyncStorage.setItem('user_auth', JSON.stringify(user));
        await AsyncStorage.setItem('is_authenticated', 'true');
      } catch (storageError) {
        console.warn('Failed to store auth state:', storageError);
      }

      setAuthState({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user_auth');
      await AsyncStorage.removeItem('is_authenticated');
    } catch (storageError) {
      console.warn('Failed to clear auth state:', storageError);
    }

    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  };

  if (authState.isLoading) {
    return null;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}>
        {authState.isAuthenticated ? (
          <Stack.Screen name="MainApp">
            {(props) => <MainTabs {...props} onLogout={handleLogout} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
            <Stack.Screen name="Signup">
              {(props) => <SignupScreen {...props} onSignup={handleSignup} />}
            </Stack.Screen>
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;