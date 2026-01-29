import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, AppState, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/utils/database';
import { ThemeProvider } from './src/context/ThemeContext';
import AppLockScreen from './src/components/AppLockScreen';
import { isAppLockEnabled, shouldLockApp } from './src/utils/appLock';
import { auth } from './src/config/firebase';
import { signInWithCustomToken } from 'firebase/auth';

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
    
    // Set up deep link listener after app is initialized
    let linkingSubscription: { remove: () => void } | null = null;
    let timeoutId: NodeJS.Timeout;
    
    timeoutId = setTimeout(() => {
      try {
        linkingSubscription = Linking.addEventListener('url', (event) => {
          if (!isLoading) {
            handleDeepLink(event);
          }
        });

        // Handle deep link when app is opened from a closed state
        Linking.getInitialURL()
          .then((url) => {
            if (url && !isLoading) {
              handleDeepLink({ url });
            }
          })
          .catch((err) => {
            console.warn('App: Error getting initial URL:', err);
          });
      } catch (error) {
        console.error('App: Error setting up deep link listener:', error);
      }
    }, 1000);
    
    // Listen for app state changes
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkAppLock();
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.remove();
      if (linkingSubscription) {
        try {
          linkingSubscription.remove();
        } catch (err) {
          console.warn('App: Error removing linking subscription:', err);
        }
      }
    };
  }, [isLoading]);


  /**
   * Handles OAuth callback deep links
   * Signs in with Firebase custom token and navigates to dashboard
   */
  const handleDeepLink = async ({ url }: { url: string }) => {
    try {
      // Only handle auth-success deep links
      if (!url || !url.startsWith('mentalhealthtracker://auth-success')) {
        return;
      }

      console.log('App: Received OAuth deep link:', url);

      // Parse the URL to extract the token
      // Use a safer URL parsing method for custom schemes
      let token: string | null = null;
      let error: string | null = null;

      try {
        // Try standard URL parsing first
        const parsedUrl = new URL(url);
        token = parsedUrl.searchParams.get('token');
        error = parsedUrl.searchParams.get('error');
      } catch (urlError) {
        // Fallback: manual parsing for custom schemes
        const match = url.match(/[?&]token=([^&]+)/);
        if (match) {
          token = decodeURIComponent(match[1]);
        }
        const errorMatch = url.match(/[?&]error=([^&]+)/);
        if (errorMatch) {
          error = decodeURIComponent(errorMatch[1]);
        }
      }

      if (error) {
        console.error('App: OAuth error in deep link:', error);
        Alert.alert('Authentication Error', decodeURIComponent(error));
        return;
      }

      if (!token) {
        console.error('App: No token found in deep link');
        return;
      }

      // Sign in with Firebase custom token
      console.log('App: Signing in with Firebase custom token...');
      const userCredential = await signInWithCustomToken(auth, token);
      const user = userCredential.user;

      console.log('App: Firebase sign-in successful:', user.email);

      // The AppNavigator will automatically detect the auth state change
      // and navigate to the dashboard via onAuthStateChanged listener
      // No manual navigation needed here

    } catch (error: any) {
      console.error('App: Error handling deep link:', error);
      // Only show alert if app is fully loaded (not during initialization)
      if (!isLoading) {
        Alert.alert(
          'Authentication Failed',
          error.message || 'Failed to complete authentication. Please try again.'
        );
      }
    }
  };

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
