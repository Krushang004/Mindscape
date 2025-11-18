import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { validatePin, recordUnlock } from '../utils/appLock';

interface AppLockScreenProps {
  onUnlock: () => void;
  isSetup?: boolean; // If true, this is for setting up PIN, not unlocking
  onSetupComplete?: (pin: string) => void;
}

export default function AppLockScreen({ 
  onUnlock, 
  isSetup = false,
  onSetupComplete 
}: AppLockScreenProps) {
  const { colors } = useTheme();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState('');
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (error) {
      // Shake animation on error
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error]);

  const handlePinInput = (digit: string) => {
    if (isSetup) {
      if (!isConfirming) {
        const newPin = pin + digit;
        if (newPin.length <= 6) {
          setPin(newPin);
          setError('');
          if (newPin.length === 6) {
            setIsConfirming(true);
            setConfirmPin('');
          }
        }
      } else {
        const newConfirmPin = confirmPin + digit;
        if (newConfirmPin.length <= 6) {
          setConfirmPin(newConfirmPin);
          setError('');
          if (newConfirmPin.length === 6) {
            if (newConfirmPin === pin) {
              if (onSetupComplete) {
                onSetupComplete(pin);
              }
            } else {
              setError('PINs do not match. Please try again.');
              setPin('');
              setConfirmPin('');
              setIsConfirming(false);
            }
          }
        }
      }
    } else {
      // Unlock mode
      const newPin = pin + digit;
      if (newPin.length <= 6) {
        setPin(newPin);
        setError('');
        if (newPin.length === 6) {
          handleUnlock(newPin);
        }
      }
    }
  };

  const handleUnlock = async (enteredPin: string) => {
    try {
      const isValid = await validatePin(enteredPin);
      if (isValid) {
        await recordUnlock();
        setPin('');
        onUnlock();
      } else {
        setError('Incorrect PIN. Please try again.');
        setPin('');
      }
    } catch (error) {
      setError('Failed to unlock. Please try again.');
      setPin('');
    }
  };

  const handleDelete = () => {
    if (isConfirming) {
      setConfirmPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setConfirmPin('');
    setIsConfirming(false);
    setError('');
  };

  const renderPinDots = (currentPin: string) => {
    return (
      <View style={styles.pinDotsContainer}>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              {
                backgroundColor: index < currentPin.length ? colors.primary : colors.border,
                borderColor: colors.border,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderKeypad = () => {
    const digits = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', ''],
    ];

    return (
      <View style={styles.keypad}>
        {digits.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((digit, colIndex) => {
              if (digit === '') {
                return <View key={`${rowIndex}-${colIndex}`} style={styles.keypadButton} />;
              }
              return (
                <TouchableOpacity
                  key={digit}
                  style={[styles.keypadButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => handlePinInput(digit)}
                >
                  <Text style={[styles.keypadButtonText, { color: colors.text }]}>{digit}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
        <View style={styles.keypadRow}>
          <View style={styles.keypadButton} />
          <TouchableOpacity
            style={[styles.keypadButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleDelete}
            onLongPress={handleClear}
          >
            <Ionicons name="backspace" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.keypadButton} />
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed" size={64} color={colors.primary} />
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>
          {isSetup ? (isConfirming ? 'Confirm PIN' : 'Set Up App Lock') : 'App Locked'}
        </Text>
        
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {isSetup
            ? isConfirming
              ? 'Re-enter your PIN to confirm'
              : 'Enter a 6-digit PIN to secure your app'
            : 'Enter your PIN to unlock'}
        </Text>

        <Animated.View
          style={[
            styles.pinContainer,
            {
              transform: [{ translateX: shakeAnimation }],
            },
          ]}
        >
          {renderPinDots(isConfirming ? confirmPin : pin)}
        </Animated.View>

        {error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        ) : null}

        {renderKeypad()}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  pinContainer: {
    marginBottom: 20,
  },
  pinDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  keypad: {
    width: '100%',
    maxWidth: 300,
    marginTop: 40,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  keypadButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  keypadButtonText: {
    fontSize: 24,
    fontWeight: '600',
  },
});

