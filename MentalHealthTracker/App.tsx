import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/utils/database';
import { ThemeProvider } from './src/context/ThemeContext';
import AppLockScreen from './src/components/AppLockScreen';
import { isAppLockEnabled, shouldLockApp } from './src/utils/appLock';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [appLockEnabled, setAppLockEnabled] = useState(false);

  // Create React Query client
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
      },
    },
  });

  useEffect(() => {
    initializeApp();
    checkAppLock();
    
    // Listen for app state changes
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkAppLock();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const checkAppLock = async () => {
    try {
      const enabled = await isAppLockEnabled();
      setAppLockEnabled(enabled);
      if (enabled) {
        const shouldLock = await shouldLockApp();
        setIsLocked(shouldLock);
      } else {
        setIsLocked(false);
      }
    } catch (error) {
      console.error('Error checking app lock:', error);
      setIsLocked(false);
    }
  };

  const handleUnlock = () => {
    setIsLocked(false);
  };

  const initializeApp = async () => {
    try {
      console.log('Starting app initialization...');
      await initDatabase();
      console.log('Database initialized successfully');
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to initialize app:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to initialize the app: ${errorMessage}`);
      Alert.alert('Initialization Error', `Failed to initialize the app: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Initializing Mental Health Tracker...</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  // Show app lock screen if locked
  if (isLocked && appLockEnabled) {
    return (
      <ThemeProvider>
        <AppLockScreen onUnlock={handleUnlock} />
        <StatusBar style="light" />
      </ThemeProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppNavigator />
        <StatusBar style="light" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
});
