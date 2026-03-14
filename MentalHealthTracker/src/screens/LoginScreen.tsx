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
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useGoogleAuth, signInWithGoogle } from '../utils/firebaseAuth';
import { API_BASE } from '../config';
import { LoginCredentials } from '../types';

interface LoginScreenProps {
  navigation: any;
  onLogin: (credentials: LoginCredentials) => Promise<void>;
}

export default function LoginScreen({ navigation, onLogin }: LoginScreenProps) {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [request, response, promptAsync] = useGoogleAuth();

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      console.log('LoginScreen: Attempting login with email:', email);
      setLoading(true);
      await onLogin({ email: email.trim(), password });
      console.log('LoginScreen: Login successful');
    } catch (error) {
      console.error('LoginScreen: Login error:', error);

      // Check if the error is about user not existing
      if (error.message && error.message.includes('Invalid email or password')) {
        Alert.alert(
          'Account Not Found',
          'No account found with this email address. Would you like to create a new account?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Create Account',
              onPress: () => navigation.navigate('Signup')
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      console.log('LoginScreen: Starting Firebase Google login...');

      // Sign in with Google using Firebase
      const result = await signInWithGoogle(promptAsync);

      if (!result || !result.idToken) {
        console.log('LoginScreen: Google login cancelled by user or no token received');
        // User cancelled, don't show error
        return;
      }

      console.log('LoginScreen: Firebase Google sign-in successful, sending to backend...');

      // Send idToken to backend for verification and user creation
      try {
        console.log('LoginScreen: Sending idToken to backend:', `${API_BASE}/auth/google`);
        
        const response = await fetch(`${API_BASE}/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken: result.idToken,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText || 'Google authentication failed' };
          }
          throw new Error(errorData.message || `Backend returned ${response.status}`);
        }

        const data = await response.json();

        console.log('LoginScreen: Backend Google auth successful');

        // Store token and user data
        if (data.token) {
          await AsyncStorage.setItem('auth_token', data.token);
          console.log('LoginScreen: Auth token stored successfully');
        } else {
          console.warn('LoginScreen: No token received from backend');
        }

        // Store user data temporarily for login handler
        if (data.user) {
          await AsyncStorage.setItem('google_user_temp', JSON.stringify(data.user));
          console.log('LoginScreen: Google user temp data stored');
        }

        // Get email from backend response or OAuth result
        const userEmail = data.user?.email || result.user?.email || '';
        
        if (!userEmail) {
          throw new Error('No email received from Google authentication');
        }

        console.log('LoginScreen: Calling onLogin with email:', userEmail);

        // Use the login handler with Google credentials
        await onLogin({
          email: userEmail,
          password: 'google_idtoken_verified'
        });

        console.log('LoginScreen: Google login successful, redirecting to dashboard...');
        
        // Ensure API service has the token
        try {
          const { apiService } = await import('../services/api');
          if (data.token) {
            await apiService.setAuthToken(data.token);
            console.log('LoginScreen: API service token initialized');
          }
        } catch (apiError) {
          console.warn('LoginScreen: Failed to initialize API service token:', apiError);
        }

      } catch (apiError: any) {
        console.error('LoginScreen: Backend Google auth failed:', apiError);
        Alert.alert(
          'Authentication Failed',
          apiError.message || 'Failed to authenticate with Google. Please try again.'
        );
      }

    } catch (error: any) {
      console.error('LoginScreen: Google login error:', error);
      if (error.message && !error.message.includes('cancelled')) {
        Alert.alert(
          'Google Sign-in Failed',
          error.message || 'Failed to sign in with Google. Please try again.'
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
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.header}
        >
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/icon.png')} 
              style={styles.logoImage} 
              resizeMode="contain" 
            />
            <Text style={styles.appName}>Mindscape</Text>
            <Text style={styles.tagline}>Track your journey to better mental health</Text>
          </View>
        </LinearGradient>

        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sign in to continue your mental health journey
          </Text>

          <View style={styles.inputContainer}>
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
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.forgotPassword,
              {
                backgroundColor: colors.surface,
                paddingHorizontal: 15,
                paddingVertical: 8,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.primary
              }
            ]}
            onPress={handleForgotPassword}
          >
            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.loginButton,
              { backgroundColor: colors.primary },
              loading && { opacity: 0.7 }
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <Text style={[styles.loginButtonText, { color: colors.surface }]}>
                Signing In...
              </Text>
            ) : (
              <Text style={[styles.loginButtonText, { color: colors.surface }]}>
                Sign In
              </Text>
            )}
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
            onPress={() => {
              console.log('Google sign-in button pressed!');
              handleGoogleLogin();
            }}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text style={[styles.googleButtonText, { color: '#333333' }]}>
              {loading ? 'Signing In...' : 'Sign in with Google'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signupButton, { borderColor: colors.border }]}
            onPress={() => {
              console.log('LoginScreen: Navigating to Signup');
              navigation.navigate('Signup');
            }}
          >
            <Text style={[styles.signupButtonText, { color: colors.text }]}>
              Create New Account
            </Text>
          </TouchableOpacity>

          <View style={styles.termsContainer}>
            <Text style={[styles.termsText, { color: colors.textTertiary }]}>
              By signing in, you agree to our{' '}
              <Text style={[styles.termsLink, { color: colors.primary }]}>
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text style={[styles.termsLink, { color: colors.primary }]}>
                Privacy Policy
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20, alignItems: 'center' },
  logoContainer: { alignItems: 'center' },
  logoImage: { width: 80, height: 80, marginBottom: 10, borderRadius: 20 },
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
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 25 },
  forgotPasswordText: { fontSize: 14, fontWeight: '500' },
  loginButton: { height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  loginButtonText: { fontSize: 16, fontWeight: 'bold' },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 15, fontSize: 14 },
  googleButton: { height: 50, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 20, flexDirection: 'row', gap: 10 },
  googleButtonText: { fontSize: 16, fontWeight: '500' },
  signupButton: { height: 50, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  signupButtonText: { fontSize: 16, fontWeight: '600' },
  termsContainer: { alignItems: 'center' },
  termsText: { fontSize: 12, textAlign: 'center', lineHeight: 16 },
  termsLink: { fontWeight: '600' },
});