import React, { useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';
import { API_BASE, OAUTH_REDIRECT_BASE } from '../config';

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
}

// Ensure auth session completes on Android when returning to the app
WebBrowser.maybeCompleteAuthSession();

// Real Google OAuth configuration
const GOOGLE_CLIENT_ID = '166015770712-3023heohgikc908m6l6n73fkbo5a1bbj.apps.googleusercontent.com';

// Get redirect URI - uses dedicated OAuth base if provided
const getRedirectUri = (): string => {
  const base = (OAUTH_REDIRECT_BASE && OAUTH_REDIRECT_BASE.trim().length > 0)
    ? OAUTH_REDIRECT_BASE
    : API_BASE;

  if (!base.startsWith('https://')) {
    console.warn('Google OAuth: Redirect base should be HTTPS. Current value:', base);
  }

  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const redirectUri = `${normalizedBase}/auth/google/callback`;
  console.log('Google OAuth: Using backend redirect URI:', redirectUri);
  return redirectUri;
};

// Real Google OAuth implementation - uses custom URL scheme instead of auth.expo.io
export const useGoogleAuth = () => {
  const [isInitializing, setIsInitializing] = useState(false);

  // Use custom URL scheme instead of deprecated Expo auth proxy
  const redirectUri = getRedirectUri();
  
  console.log('Google OAuth: Using redirect URI:', redirectUri);
  console.log('✅ Using custom URL scheme (no auth.expo.io dependency)');

  // Google OAuth endpoints
  const authorizationEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

  // Custom OAuth handler that bypasses useAuthRequest to avoid PKCE
  const handleAuth = async () => {
    try {
      console.log('Google OAuth: Starting authentication...');
      console.log('Google OAuth: Redirect URI:', redirectUri);

      // Use authorization code flow (no PKCE needed since backend has client secret)
      // Construct OAuth URL
      const authUrl = `${authorizationEndpoint}?` +
        `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('openid profile email')}&` +
        `prompt=select_account`;

      console.log('Google OAuth: Auth URL constructed');
      console.log('⚠️ IMPORTANT: Make sure this EXACT redirect URI is in Google Console:');
      console.log('   Redirect URI:', redirectUri);
      console.log('   Copy this URL and add it to Google Console → Credentials → Your OAuth Client → Authorized redirect URIs');

      // Use WebBrowser.openBrowserAsync and handle deep link separately
      // The backend will redirect to mentalhealthtracker://auth which we'll catch via Linking
      console.log('Google OAuth: Opening browser...');
      
      // Set up deep link listener before opening browser
      const deepLinkPromise = new Promise<string>((resolve, reject) => {
        let subscription: { remove: () => void } | null = null;
        let timeout: NodeJS.Timeout | null = null;
        
        // Set timeout (5 minutes)
        timeout = setTimeout(() => {
          if (subscription) {
            subscription.remove();
          }
          reject(new Error('OAuth timeout: No response received'));
        }, 5 * 60 * 1000);
        
        const listener = (event: { url: string }) => {
          console.log('Google OAuth: Deep link received:', event.url);
          if (event.url.startsWith('mentalhealthtracker://auth')) {
            if (timeout) clearTimeout(timeout);
            if (subscription) {
              subscription.remove();
            }
            resolve(event.url);
          }
        };
        
        subscription = Linking.addEventListener('url', listener);
      });
      
      // Open browser
      const browserResult = await WebBrowser.openBrowserAsync(authUrl);
      console.log('Google OAuth: Browser opened, result:', browserResult);
      
      // Wait for deep link
      let redirectUrl: string;
      try {
        redirectUrl = await deepLinkPromise;
        console.log('Google OAuth: Deep link received, processing...');
      } catch (error) {
        console.error('Google OAuth: Error waiting for deep link:', error);
        // Check if browser was dismissed
        if (browserResult.type === 'cancel' || browserResult.type === 'dismiss') {
          return { type: 'cancel' as const };
        }
        return { type: 'error' as const, error: error instanceof Error ? error.message : 'OAuth timeout' };
      }
      
      // Parse the redirect URL - tokens are in the fragment (#)
      let accessToken: string | null = null;
      let idToken: string | null = null;
      
      try {
        const url = new URL(redirectUrl);
        
        // Check if tokens are in the fragment (from backend redirect)
        if (url.hash) {
          const fragment = url.hash.substring(1); // Remove the '#'
          const fragmentParams = new URLSearchParams(fragment);
          
          const error = fragmentParams.get('error');
          if (error) {
            const errorDescription = fragmentParams.get('error_description') || error;
            console.error('Google OAuth: Error from redirect:', errorDescription);
            return { type: 'error' as const, error: errorDescription };
          }
          
          accessToken = fragmentParams.get('access_token');
          idToken = fragmentParams.get('id_token');
        } else if (url.search) {
          // Fallback: check query params
          const searchParams = new URLSearchParams(url.search);
          const error = searchParams.get('error');
          if (error) {
            const errorDescription = searchParams.get('error_description') || error;
            console.error('Google OAuth: Error from redirect:', errorDescription);
            return { type: 'error' as const, error: errorDescription };
          }
          accessToken = searchParams.get('access_token');
          idToken = searchParams.get('id_token');
        }
        
        if (!idToken) {
          console.error('Google OAuth: No ID token received');
          return { type: 'error' as const, error: 'No ID token received from OAuth flow' };
        }

        if (!accessToken) {
          console.log('Google OAuth: No access token received, fetching user info with ID token');
        }

        // Get user info using the access token (or ID token if access token not available)
        let user: GoogleUser | undefined;
        try {
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              'Authorization': `Bearer ${accessToken || idToken}`,
            },
          });

          if (!userInfoResponse.ok) {
            const errorText = await userInfoResponse.text();
            console.log('Google OAuth: User info fetch failed:', userInfoResponse.status, errorText);
            throw new Error(`Failed to fetch user info: ${userInfoResponse.status}`);
          }

          const userInfo = await userInfoResponse.json();
          console.log('Google OAuth: User info received:', { 
            id: userInfo.id, 
            email: userInfo.email, 
            name: userInfo.name 
          });

          user = {
            id: userInfo.id || 'google_user_' + Math.random().toString(36).substring(2, 15),
            email: userInfo.email || 'unknown@example.com',
            name: userInfo.name || 'Google User',
            picture: userInfo.picture || 'https://via.placeholder.com/150/4285F4/ffffff?text=G',
            verified_email: userInfo.verified_email || false,
          };
        } catch (userInfoError) {
          console.error('Google OAuth: Error fetching user info, continuing with ID token only:', userInfoError);
        }

        return {
          type: 'success' as const,
          params: {
            id_token: idToken,
            user,
            access_token: accessToken || '',
            expires_in: 3600,
          },
        };
      } catch (urlError) {
        console.error('Google OAuth: Error parsing redirect URL:', urlError);
        return { type: 'error' as const, error: 'Failed to parse OAuth response' };
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      return { 
        type: 'error' as const, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    }
  };

  // Return a compatible structure - provide empty objects to avoid property access errors
  return {
    request: {} as any, // Empty object to avoid property access errors
    response: null, // Not using useAuthRequest, so no response object
    promptAsync: handleAuth,
    isInitializing,
    redirectUri, // Expose redirectUri so it can be logged/displayed
  };
};

// Professional email validation
export const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Professional Google Sign-In handler
// This function wraps the OAuth flow and extracts the necessary tokens and user info
export const handleGoogleAuthWithFallback = async (
  request: any, // Not used but kept for backward compatibility
  promptAsync: () => Promise<any>
): Promise<{ idToken: string; user?: GoogleUser } | null> => {
  try {
    console.log('Starting professional Google Sign-In...');

    const result = await promptAsync();
    console.log('Google OAuth result:', result?.type);

    if (!result) {
      console.log('Google OAuth: No result received');
      return null;
    }

    if (result.type === 'cancel') {
      console.log('Google OAuth: User cancelled authentication');
      return null;
    }

    if (result.type === 'error') {
      const errorMsg = result.error || 'Authentication failed';
      console.error('Google OAuth error:', errorMsg);
      // Return null for OAuth errors (calling code can check error message if needed)
      // The screens will show appropriate error messages
      return null;
    }

    if (result.type !== 'success') {
      console.log('Google OAuth: Unexpected result type:', result.type);
      return null;
    }

    // Extract tokens and user info from successful result
    const params = result.params || {};
    const idToken = params.id_token as string;
    const user = params.user as GoogleUser | undefined;

    if (!idToken) {
      console.log('Google OAuth: No id_token returned');
      return null;
    }

    console.log('Google OAuth successful, token received');
    return { idToken, user };
  } catch (error) {
    console.error('Google Sign-In error:', error);
    // Return null for caught errors - the screens have try-catch blocks to handle them
    return null;
  }
};

// Keep the old function for compatibility
export const handleGoogleAuth = async (
  request: any,
  promptAsync: any
): Promise<{ idToken: string } | null> => {
  const result = await handleGoogleAuthWithFallback(request, promptAsync);
  return result ? { idToken: result.idToken } : null;
};
