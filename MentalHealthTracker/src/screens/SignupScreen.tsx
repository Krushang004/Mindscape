import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { handleGoogleAuthNative, isGoogleSignInAvailable } from '../utils/googleAuthNative';
import { useGoogleAuth, handleGoogleAuthWithFallback } from '../utils/googleAuth';
import { API_BASE } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SignupCredentials } from '../types';

interface SignupScreenProps {
  navigation: any;
  onSignup: (credentials: SignupCredentials) => Promise<void>;
}

export default function SignupScreen({ navigation, onSignup }: SignupScreenProps) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleSignInAvailable, setGoogleSignInAvailable] = useState(false);
  const googleAuth = useGoogleAuth();

  useEffect(() => {
    setGoogleSignInAvailable(isGoogleSignInAvailable());
  }, []);

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address (e.g., user@gmail.com)');
      return false;
    }
    
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      console.log('SignupScreen: Attempting signup with email:', email);
      setLoading(true);
      await onSignup({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });
      console.log('SignupScreen: Signup successful');
    } catch (error: any) {
      console.error('SignupScreen: Signup error:', error);
      
      // Check if the error is about user already existing
      if (error.message && error.message.includes('already exists')) {
        Alert.alert(
          'Account Already Exists',
          'An account with this email already exists. Please try logging in instead.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Go to Login', 
              onPress: () => navigation.navigate('Login') 
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      console.log('SignupScreen: Starting Google signup...');

      let result: { idToken: string; user?: any } | null = null;

      // Try native Google Sign-In first (if available)
      if (isGoogleSignInAvailable()) {
        console.log('SignupScreen: Attempting native Google Sign-In...');
        try {
          result = await handleGoogleAuthNative();
        } catch (nativeError: any) {
          console.log('SignupScreen: Native sign-in failed, falling back to OAuth web flow:', nativeError.message);
          // Fall through to OAuth web flow
        }
      }

      // Fallback to OAuth web flow if native is not available or failed
      if (!result || !result.idToken) {
        console.log('SignupScreen: Using OAuth web flow fallback...');
        try {
          result = await handleGoogleAuthWithFallback(googleAuth.request, googleAuth.promptAsync);
        } catch (oauthError: any) {
          console.error('SignupScreen: OAuth web flow failed:', oauthError);
          if (oauthError.message && !oauthError.message.includes('cancelled')) {
            Alert.alert('Google Sign-up Failed', oauthError.message || 'Failed to sign up with Google. Please try again.');
          }
          return;
        }
      }

      if (!result || !result.idToken) {
        console.log('SignupScreen: Google signup cancelled by user or no token received');
        // User cancelled, don't show error
        return;
      }

      console.log('SignupScreen: Google OAuth successful, sending to backend...');

      // Send idToken to backend for verification and user creation
      try {
        const response = await fetch(`${API_BASE}/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken: result.idToken,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Google authentication failed');
        }

        console.log('SignupScreen: Backend Google auth successful');

        // Store token and user data
        if (data.token) {
          await AsyncStorage.setItem('auth_token', data.token);
        }

        // Store user data temporarily for signup handler
        if (data.user) {
          await AsyncStorage.setItem('google_user_temp', JSON.stringify(data.user));
        }

        // Use the signup handler with Google credentials
        // The backend already created the user, so this will just handle local storage
        await onSignup({
          name: data.user?.name || result.user?.name || 'Google User',
          email: data.user?.email || result.user?.email || '',
          password: 'google_idtoken_verified',
          confirmPassword: 'google_idtoken_verified',
        });

        console.log('SignupScreen: Google signup successful, redirecting to dashboard...');

      } catch (apiError: any) {
        console.error('SignupScreen: Backend Google auth failed:', apiError);
        Alert.alert(
          'Authentication Failed',
          apiError.message || 'Failed to authenticate with Google. Please try again.'
        );
      }
      
    } catch (error: any) {
      console.error('SignupScreen: Google signup error:', error);
      if (error.message && !error.message.includes('cancelled')) {
        Alert.alert(
          'Google Sign-up Failed', 
          error.message || 'Failed to sign up with Google. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🧠</Text>
            <Text style={styles.appName}>Mental Health Tracker</Text>
            <Text style={styles.tagline}>Start your mental health journey today</Text>
          </View>
        </LinearGradient>

        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Join us to track and improve your mental health</Text>

          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
              <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Full Name"
                placeholderTextColor={colors.textTertiary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Email (e.g., user@gmail.com)"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Password"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.passwordToggle} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Confirm Password"
                placeholderTextColor={colors.textTertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.passwordToggle} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.passwordRequirements}>
            <Text style={[styles.requirementsTitle, { color: colors.textSecondary }]}>Password Requirements:</Text>
            <Text style={[styles.requirement, { color: password.length >= 6 ? colors.success : colors.textTertiary }]}>• At least 6 characters</Text>
            <Text style={[styles.requirement, { color: password === confirmPassword && confirmPassword.length > 0 ? colors.success : colors.textTertiary }]}>• Passwords match</Text>
          </View>

          <TouchableOpacity
            style={[styles.signupButton, { backgroundColor: colors.primary }, loading && { opacity: 0.7 }]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={[styles.signupButtonText, { color: colors.surface }]}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <TouchableOpacity
            style={[
              styles.googleButton, 
              { 
                borderColor: colors.border,
                backgroundColor: '#ffffff',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                opacity: loading ? 0.7 : 1
              }
            ]}
            onPress={handleGoogleSignup}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text style={[styles.googleButtonText, { color: '#333333' }]}>
              {loading ? 'Creating Account...' : 'Sign up with Google'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, { borderColor: colors.border }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.loginButtonText, { color: colors.text }]}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20, alignItems: 'center' },
  backButton: { position: 'absolute', top: 60, left: 20, padding: 10 },
  logoContainer: { alignItems: 'center' },
  logoEmoji: { fontSize: 64, marginBottom: 10 },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 5 },
  tagline: { fontSize: 16, color: '#ffffff', opacity: 0.9, textAlign: 'center' },
  formContainer: { flex: 1, padding: 20, paddingTop: 30 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  inputContainer: { marginBottom: 20 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, marginBottom: 15, paddingHorizontal: 15, height: 50 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, height: '100%' },
  passwordToggle: { padding: 5 },
  passwordRequirements: { marginBottom: 25, paddingHorizontal: 5 },
  requirementsTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  requirement: { fontSize: 12, marginBottom: 4 },
  signupButton: { height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  signupButtonText: { fontSize: 16, fontWeight: 'bold' },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 15, fontSize: 14 },
  googleButton: { height: 50, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 20, flexDirection: 'row', gap: 10 },
  googleButtonText: { fontSize: 16, fontWeight: '500' },
  loginButton: { height: 50, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  loginButtonText: { fontSize: 16, fontWeight: '600' },
}); 