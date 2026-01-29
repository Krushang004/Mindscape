import { 
  signInWithCredential, 
  GoogleAuthProvider, 
  User,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';
import { OAUTH_REDIRECT_BASE } from '../config';

// Complete auth session on Android
WebBrowser.maybeCompleteAuthSession();

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// Convert Firebase User to our format
export const convertFirebaseUser = (user: User): FirebaseUser => {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
  };
};

// Google OAuth Client ID from Firebase Console
// Firebase Console > Authentication > Sign-in method > Google > Web SDK configuration
// IMPORTANT: Use the Web Client ID (not Android/iOS client ID)
const GOOGLE_CLIENT_ID = '166015770712-3023heohgikc908m6l6n73fkbo5a1bbj.apps.googleusercontent.com';

/**
 * Get HTTPS redirect URI for Google OAuth
 * This must be an HTTPS URL that can be added to Google Console
 */
const getRedirectUri = (): string => {
  // Use OAUTH_REDIRECT_BASE from config, or fallback to API_BASE
  const base = OAUTH_REDIRECT_BASE || 'http://127.0.0.1:8000';
  
  // Ensure it's HTTPS for production (required by Google)
  if (!base.startsWith('https://')) {
    console.warn('⚠️ Firebase Auth: Redirect base should be HTTPS for Google OAuth. Current value:', base);
    console.warn('⚠️ Use Vercel or another HTTPS service for OAuth redirect');
  }

  // Normalize base URL (remove trailing slash)
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  
  // Construct redirect URI pointing to backend callback endpoint
  const redirectUri = `${normalizedBase}/auth/google/callback`;
  
  console.log('Firebase Auth: Using HTTPS redirect URI:', redirectUri);
  console.log('⚠️ IMPORTANT: Add this EXACT URL to Google Console → Credentials → Authorized redirect URIs');
  
  return redirectUri;
};

/**
 * Create a hook for Google Auth (to be used in components)
 * This returns a promptAsync function that handles the OAuth flow
 * The flow: App → Google → Backend → App (with tokens in deep link)
 */
export const useGoogleAuth = () => {
  const promptAsync = async () => {
    try {
      console.log('Firebase Auth: Starting Google sign-in...');

      // Get HTTPS redirect URI
      const redirectUri = getRedirectUri();

      // Construct Google OAuth URL with authorization code flow
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('openid profile email')}&` +
        `prompt=select_account`;

      console.log('Firebase Auth: Opening Google OAuth in browser...');
      console.log('Firebase Auth: Backend will handle callback and redirect to app');

      // Set up deep link listener as fallback (in case WebBrowser doesn't catch it)
      let deepLinkResolved = false;
      let deepLinkUrl: string | null = null;
      
      const linkingSubscription = Linking.addEventListener('url', (event) => {
        if (event.url.startsWith('mentalhealthtracker://auth')) {
          console.log('Firebase Auth: Deep link caught via Linking API:', event.url);
          deepLinkUrl = event.url;
          deepLinkResolved = true;
          // Close the browser if it's still open
          WebBrowser.dismissBrowser();
        }
      });

      // Also check for initial URL (in case app was opened via deep link)
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl && initialUrl.startsWith('mentalhealthtracker://auth')) {
          console.log('Firebase Auth: App opened via deep link:', initialUrl);
          deepLinkUrl = initialUrl;
          deepLinkResolved = true;
        }
      } catch (e) {
        // Ignore errors
      }

      // Open browser for OAuth with proper redirect scheme
      let result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        'mentalhealthtracker://auth'
      );

      console.log('Firebase Auth: Browser session result:', result.type);

      // Remove the linking listener
      linkingSubscription.remove();

      // If we got the deep link via Linking API, use that instead
      if (deepLinkResolved && deepLinkUrl) {
        console.log('Firebase Auth: Using deep link from Linking API');
        result = {
          type: 'success' as const,
          url: deepLinkUrl
        };
      }

      if (result.type === 'success' && result.url) {
        // Parse the deep link URL from backend
        const url = new URL(result.url);
        
        // Handle auth-success?token=<firebaseCustomToken> format
        if (url.host === 'auth-success' || url.pathname === '/auth-success') {
          const token = url.searchParams.get('token');
          if (token) {
            console.log('Firebase Auth: Received Firebase custom token from auth-success deep link');
            return {
              type: 'success' as const,
              params: { firebase_custom_token: token }
            };
          }
          const error = url.searchParams.get('error');
          if (error) {
            console.error('Firebase Auth: OAuth error from auth-success:', error);
            return { type: 'error' as const, error };
          }
        }
        
        // Check for tokens in fragment (backend redirects with #access_token=...&id_token=...)
        if (url.hash) {
          const fragment = url.hash.substring(1);
          const params = new URLSearchParams(fragment);
          
          const error = params.get('error');
          if (error) {
            const errorDescription = params.get('error_description') || error;
            console.error('Firebase Auth: OAuth error:', errorDescription);
            return { type: 'error' as const, error: errorDescription };
          }

          // Support both flows:
          // - id_token: Google ID token (exchange into Firebase credential)
          // - firebase_custom_token (or firebaseCustomToken): Firebase custom token (sign in directly)
          const firebaseCustomToken =
            params.get('firebase_custom_token') ||
            params.get('firebaseCustomToken');

          const idToken = params.get('id_token');
          if (!idToken && !firebaseCustomToken) {
            console.error('Firebase Auth: No usable token in redirect');
            return { type: 'error' as const, error: 'No token received' };
          }

          return {
            type: 'success' as const,
            params: { id_token: idToken, firebase_custom_token: firebaseCustomToken }
          };
        } else if (url.search) {
          // Fallback: check query params
          const params = new URLSearchParams(url.search);
          const error = params.get('error');
          if (error) {
            return { type: 'error' as const, error };
          }
          const firebaseCustomToken =
            params.get('firebase_custom_token') ||
            params.get('firebaseCustomToken') ||
            params.get('token'); // Support token param from auth-success
          const idToken = params.get('id_token');
          if (idToken || firebaseCustomToken) {
            return {
              type: 'success' as const,
              params: { id_token: idToken, firebase_custom_token: firebaseCustomToken }
            };
          }
        }

        return { type: 'error' as const, error: 'No tokens received from OAuth flow' };
      }

      return { type: 'cancel' as const };
    } catch (error: any) {
      console.error('Firebase Auth: OAuth flow error:', error);
      return { type: 'error' as const, error: error.message || 'OAuth flow failed' };
    }
  };

  // Return mock request/response objects for compatibility with existing code
  return [
    null, // request
    null, // response
    promptAsync
  ] as [any, any, typeof promptAsync];
};

/**
 * Sign in with Google using Firebase
 * This works in Expo Go and development builds
 * @param promptAsync - Function from useGoogleAuth hook
 */
export const signInWithGoogle = async (
  promptAsync: () => Promise<any>
): Promise<{ idToken: string; user: FirebaseUser } | null> => {
  try {
    console.log('Firebase Auth: Starting Google sign-in...');

    // Prompt for Google authentication
    const result = await promptAsync();
    
    if (result.type !== 'success') {
      console.log('Firebase Auth: User cancelled Google sign-in');
      return null;
    }

    const { id_token, firebase_custom_token } = result.params;
    
    if (!id_token && !firebase_custom_token) {
      console.error('Firebase Auth: No usable token received from OAuth flow');
      return null;
    }

    let userCredential;
    if (firebase_custom_token) {
      // Backend provided Firebase custom token (preferred when available)
      userCredential = await signInWithCustomToken(auth, firebase_custom_token);
    } else {
    // Create Firebase credential from Google ID token
    const credential = GoogleAuthProvider.credential(id_token);
      userCredential = await signInWithCredential(auth, credential);
    }
    const user = userCredential.user;

    // Get the Firebase ID token (this is what we send to backend)
    const firebaseIdToken = await user.getIdToken();

    console.log('Firebase Auth: Google sign-in successful', {
      email: user.email,
      uid: user.uid,
    });

    return {
      idToken: firebaseIdToken,
      user: convertFirebaseUser(user),
    };
  } catch (error: any) {
    console.error('Firebase Auth: Google sign-in error:', error);
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

/**
 * Get current Firebase user
 */
export const getCurrentUser = (): FirebaseUser | null => {
  const user = auth.currentUser;
  return user ? convertFirebaseUser(user) : null;
};

/**
 * Get current Firebase ID token
 */
export const getCurrentIdToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('Firebase Auth: Error getting ID token:', error);
    return null;
  }
};

/**
 * Sign out from Firebase
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    console.log('Firebase Auth: Signed out successfully');
  } catch (error) {
    console.error('Firebase Auth: Sign out error:', error);
    throw error;
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user ? convertFirebaseUser(user) : null);
  });
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return auth.currentUser !== null;
};

