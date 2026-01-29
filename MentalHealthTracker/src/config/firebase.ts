import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration (Expo-safe)
// IMPORTANT: Use Web/Browser API key, not Android key!
//
// To get the correct API key:
// 1. Go to: https://console.firebase.google.com/
// 2. Select project: mental-health-tracker-82394
// 3. Click: Project Settings (gear icon) → General tab
// 4. Scroll to: "Your apps" section
// 5. Find: Web app (icon: </>) - NOT Android app!
// 6. Copy: The API Key from the Web app config
// 7. Paste it below replacing "YOUR_WEB_API_KEY_HERE"
//
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyDIXqheUfH6HeCeMBBg1giJroJDinhOFXg", // Web app API key from Firebase Console
  authDomain: "mental-health-tracker-82394.firebaseapp.com",
  projectId: "mental-health-tracker-82394",
  storageBucket: "mental-health-tracker-82394.firebasestorage.app",
  messagingSenderId: "131901715436",
  appId: "1:131901715436:web:0b4d32521181cd675a86c9",
  // measurementId is for Analytics (web-only, not needed for React Native)
  // measurementId: "G-6PYL1RLX5B"
};

// Prevent re-initialization crashes
// getAnalytics() is web-only and will crash in React Native/Expo - DO NOT USE
let app;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
  } else {
    app = getApps()[0];
    console.log('✅ Using existing Firebase app');
  }
} catch (error: any) {
  console.error('❌ Firebase initialization error:', error.message);
  if (error.message?.includes('api-key')) {
    console.error('❌ API Key Error!');
    console.error('   Make sure you\'re using the WEB app API key from Firebase Console');
    console.error('   Project: mental-health-tracker-82394');
    console.error('   Go to: Firebase Console → Project Settings → General → Web app');
  }
  throw error;
}


export const auth = getAuth(app);

// Google Auth Provider (used in firebaseAuth.ts)
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export default app;

