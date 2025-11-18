import { Platform } from 'react-native';

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
}

// Google OAuth configuration
// Using the same client ID for both platforms (web client ID works for Android)
// For iOS, you may need a separate iOS client ID from Google Console
const GOOGLE_CLIENT_ID_IOS = '995213787051-753lvtk01finhr7i9opjsj14bk4793fu.apps.googleusercontent.com'; // Using same for now
const GOOGLE_CLIENT_ID_ANDROID = '995213787051-753lvtk01finhr7i9opjsj14bk4793fu.apps.googleusercontent.com';

// Check if native module is available
let GoogleSignin: any = null;
let statusCodes: any = null;
let isNativeModuleAvailable = false;
let isConfigured = false;

try {
  const googleSigninModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSigninModule.GoogleSignin;
  statusCodes = googleSigninModule.statusCodes;
  isNativeModuleAvailable = true;
  
  // Initialize Google Sign-In only if module is available
  // This uses the native Google Sign-In SDK (no auth.expo.io dependency)
  GoogleSignin.configure({
    scopes: ['email', 'profile'],
    webClientId: GOOGLE_CLIENT_ID_ANDROID, // Required for getting idToken on Android (use web client ID)
    iosClientId: GOOGLE_CLIENT_ID_IOS, // iOS client ID (optional, can use web client ID)
    offlineAccess: true, // If you want to access Google API on behalf of the user
  });
  isConfigured = true;
  console.log('Google Sign-In native module configured successfully');
} catch (error) {
  console.log('Google Sign-In native module not available. This requires a development build.');
  console.log('Error:', error);
  isNativeModuleAvailable = false;
}

// Check if native module is available
export const isGoogleSignInAvailable = (): boolean => {
  return isNativeModuleAvailable;
};

// Direct sign-in function using native Google Sign-In SDK (no auth.expo.io)
export const signInWithGoogle = async (): Promise<{ idToken: string; user: GoogleUser } | null> => {
  if (!isNativeModuleAvailable || !GoogleSignin) {
    console.error('Google Sign-In: Native module not available. Please rebuild the app with a development build.');
    throw new Error('Google Sign-In requires a development build. Native module not found.');
  }

  if (!isConfigured) {
    console.error('Google Sign-In: Module not configured properly');
    throw new Error('Google Sign-In not configured. Please check your client IDs.');
  }

  try {
    // Check if device has Google Play Services (Android only)
    if (Platform.OS === 'android') {
      try {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      } catch (playServicesError: any) {
        console.error('Google Sign-In: Play Services error:', playServicesError);
        throw new Error('Google Play Services is required for Google Sign-In. Please install or update it.');
      }
    }

    // Check if user is already signed in
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (isSignedIn) {
      // Get current user info
      const currentUser = await GoogleSignin.getCurrentUser();
      if (currentUser && currentUser.idToken) {
        const user: GoogleUser = {
          id: currentUser.user.id || '',
          email: currentUser.user.email || '',
          name: currentUser.user.name || 'Google User',
          picture: currentUser.user.photo || undefined,
          verified_email: true,
        };
        return {
          idToken: currentUser.idToken,
          user,
        };
      }
    }

    // Sign in (opens native Google Sign-In UI)
    console.log('Google Sign-In: Starting native sign-in flow...');
    const userInfo = await GoogleSignin.signIn();
    
    if (!userInfo.data || !userInfo.data.idToken) {
      console.log('Google Sign-In: No idToken received');
      return null;
    }

    const user: GoogleUser = {
      id: userInfo.data.user.id || '',
      email: userInfo.data.user.email || '',
      name: userInfo.data.user.name || 'Google User',
      picture: userInfo.data.user.photo || undefined,
      verified_email: true,
    };

    console.log('Google Sign-In successful:', { email: user.email, name: user.name });

    return {
      idToken: userInfo.data.idToken,
      user,
    };
  } catch (error: any) {
    if (statusCodes && error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('Google Sign-In: User cancelled');
      return null;
    } else if (statusCodes && error.code === statusCodes.IN_PROGRESS) {
      console.log('Google Sign-In: Operation in progress');
      return null;
    } else if (statusCodes && error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.error('Google Sign-In: Play Services not available');
      throw new Error('Google Play Services is not available. Please install it from the Play Store.');
    } else {
      console.error('Google Sign-In error:', error);
      throw error;
    }
  }
};

// Wrapper function compatible with existing code
export const handleGoogleAuthNative = async (): Promise<{ idToken: string; user?: GoogleUser } | null> => {
  return await signInWithGoogle();
};

