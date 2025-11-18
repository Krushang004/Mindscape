import React, { useState } from 'react';
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
import { API_BASE, FULL_API_BASE, API_ENDPOINTS } from '../config';
import axios from 'axios';

interface ForgotPasswordScreenProps {
  navigation: any;
}

type Step = 'email' | 'otp' | 'reset';

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const { colors } = useTheme();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleRequestOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${FULL_API_BASE}${API_ENDPOINTS.REQUEST_PASSWORD_RESET_OTP}/`,
        { email: email.trim().toLowerCase() }
      );

      if (response.status === 200) {
        // Check if debug OTP is available (development mode)
        const debugOtp = response.data?.debug_otp;
        let message = 'An OTP has been sent to your email address. Please check your inbox.';
        
        if (debugOtp) {
          message += `\n\nDebug OTP (for testing): ${debugOtp}`;
        }
        
        Alert.alert(
          'OTP Sent',
          message,
          [{ text: 'OK', onPress: () => setStep('otp') }]
        );
        
        // Auto-fill OTP if in debug mode
        if (debugOtp) {
          setOtp(debugOtp);
        }
      }
    } catch (error: any) {
      console.error('Request OTP error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to send OTP. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${FULL_API_BASE}${API_ENDPOINTS.VERIFY_PASSWORD_RESET_OTP}/`,
        {
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        }
      );

      if (response.status === 200 && response.data.verified) {
        Alert.alert('Success', 'OTP verified successfully. Please set your new password.');
        setStep('reset');
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      const errorMessage = error.response?.data?.error || 'Invalid or expired OTP. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${FULL_API_BASE}${API_ENDPOINTS.RESET_PASSWORD}/`,
        {
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          new_password: newPassword,
        }
      );

      if (response.status === 200) {
        Alert.alert(
          'Success',
          'Your password has been reset successfully. You can now login with your new password.',
          [
            {
              text: 'Go to Login',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to reset password. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <>
      <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Enter your email address and we'll send you an OTP to reset your password.
      </Text>

      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Email address"
            placeholderTextColor={colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          { backgroundColor: colors.primary },
          loading && { opacity: 0.7 },
        ]}
        onPress={handleRequestOTP}
        disabled={loading}
      >
        <Text style={[styles.primaryButtonText, { color: colors.surface }]}>
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderOTPStep = () => (
    <>
      <Text style={[styles.title, { color: colors.text }]}>Enter OTP</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        We've sent a 6-digit OTP to {email}. Please enter it below.
      </Text>

      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="key-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Enter 6-digit OTP"
            placeholderTextColor={colors.textTertiary}
            value={otp}
            onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.secondaryButton, { borderColor: colors.border }]}
        onPress={handleRequestOTP}
        disabled={loading}
      >
        <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Resend OTP</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          { backgroundColor: colors.primary },
          loading && { opacity: 0.7 },
        ]}
        onPress={handleVerifyOTP}
        disabled={loading || otp.length !== 6}
      >
        <Text style={[styles.primaryButtonText, { color: colors.surface }]}>
          {loading ? 'Verifying...' : 'Verify OTP'}
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderResetStep = () => (
    <>
      <Text style={[styles.title, { color: colors.text }]}>Set New Password</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Please enter your new password below.
      </Text>

      <View style={styles.inputContainer}>
        <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="New Password"
            placeholderTextColor={colors.textTertiary}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
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

        <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Confirm New Password"
            placeholderTextColor={colors.textTertiary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.passwordRequirements}>
        <Text style={[styles.requirementsTitle, { color: colors.textSecondary }]}>Password Requirements:</Text>
        <Text style={[styles.requirement, { color: newPassword.length >= 6 ? colors.success : colors.textTertiary }]}>
          • At least 6 characters
        </Text>
        <Text
          style={[
            styles.requirement,
            { color: newPassword === confirmPassword && confirmPassword.length > 0 ? colors.success : colors.textTertiary },
          ]}
        >
          • Passwords match
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          { backgroundColor: colors.primary },
          loading && { opacity: 0.7 },
        ]}
        onPress={handleResetPassword}
        disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
      >
        <Text style={[styles.primaryButtonText, { color: colors.surface }]}>
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </Text>
      </TouchableOpacity>
    </>
  );

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
            <Text style={styles.logoEmoji}>🔐</Text>
            <Text style={styles.appName}>Reset Password</Text>
          </View>
        </LinearGradient>

        <View style={styles.formContainer}>
          {step === 'email' && renderEmailStep()}
          {step === 'otp' && renderOTPStep()}
          {step === 'reset' && renderResetStep()}

          <TouchableOpacity
            style={[styles.backToLoginButton, { borderColor: colors.border }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.backToLoginButtonText, { color: colors.text }]}>Back to Login</Text>
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
  formContainer: { flex: 1, padding: 20, paddingTop: 30 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  inputContainer: { marginBottom: 20 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, height: '100%' },
  passwordToggle: { padding: 5 },
  primaryButton: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  primaryButtonText: { fontSize: 16, fontWeight: 'bold' },
  secondaryButton: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  secondaryButtonText: { fontSize: 16, fontWeight: '500' },
  passwordRequirements: { marginBottom: 25, paddingHorizontal: 5 },
  requirementsTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  requirement: { fontSize: 12, marginBottom: 4 },
  backToLoginButton: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  backToLoginButtonText: { fontSize: 16, fontWeight: '600' },
});

