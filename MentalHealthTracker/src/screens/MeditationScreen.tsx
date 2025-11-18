import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { MeditationSession } from '../types';
import { saveMeditationSession, getMeditationSessions } from '../utils/database';

const { width, height } = Dimensions.get('window');

const MeditationScreen = () => {
  const { colors } = useTheme();
  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [moodBefore, setMoodBefore] = useState<number | null>(null);
  const [moodAfter, setMoodAfter] = useState<number | null>(null);
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [showMoodCheck, setShowMoodCheck] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const predefinedSessions: MeditationSession[] = [
    {
      id: '1',
      name: 'Breathing Exercise',
      duration: 5,
      type: 'breathing',
      description: 'Simple breathing exercise to calm your mind',
      instructions: [
        'Find a comfortable position',
        'Close your eyes gently',
        'Breathe in slowly for 4 counts',
        'Hold your breath for 4 counts',
        'Exhale slowly for 4 counts',
        'Repeat this cycle'
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Mindfulness Meditation',
      duration: 10,
      type: 'mindfulness',
      description: 'Focus on the present moment with gentle awareness',
      instructions: [
        'Sit comfortably with your back straight',
        'Close your eyes and relax your body',
        'Focus on your breath naturally',
        'When thoughts arise, gently return to your breath',
        'Stay present and non-judgmental',
        'End with gratitude for this moment'
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Body Scan',
      duration: 15,
      type: 'body_scan',
      description: 'Progressive relaxation through body awareness',
      instructions: [
        'Lie down comfortably',
        'Start with your toes, notice any tension',
        'Slowly move up through your body',
        'Release tension in each area',
        'End at the top of your head',
        'Feel your whole body relaxed'
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Loving Kindness',
      duration: 12,
      type: 'loving_kindness',
      description: 'Cultivate compassion for yourself and others',
      instructions: [
        'Sit comfortably and close your eyes',
        'Start by sending love to yourself',
        'Think of someone you care about',
        'Extend loving kindness to them',
        'Include someone neutral in your life',
        'Finally, include all beings everywhere'
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (isPlaying && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, timeRemaining]);

  const loadSessions = async () => {
    try {
      const savedSessions = await getMeditationSessions();
      setSessions([...predefinedSessions, ...savedSessions]);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const startSession = (session: MeditationSession) => {
    setSelectedSession(session);
    setTimeRemaining(session.duration * 60);
    setCurrentStep(0);
    setShowMoodCheck(true);
  };

  const handleMoodBeforeSubmit = (mood: number) => {
    setMoodBefore(mood);
    setShowMoodCheck(false);
    setIsPlaying(true);
    startBreathingAnimation();
  };

  const handleSessionComplete = () => {
    setIsPlaying(false);
    setShowMoodCheck(true);
    setCurrentStep(selectedSession?.instructions.length || 0);
  };

  const handleMoodAfterSubmit = async (mood: number) => {
    setMoodAfter(mood);
    setShowMoodCheck(false);
    
    if (selectedSession) {
      const completedSession = {
        ...selectedSession,
        moodBefore,
        moodAfter: mood,
        completedAt: new Date().toISOString(),
      };
      
      try {
        await saveMeditationSession(completedSession);
        Alert.alert(
          'Session Complete!',
          `Great job! You completed ${selectedSession.name}. Your mood ${mood > (moodBefore || 5) ? 'improved' : 'changed'} from ${moodBefore || 'N/A'} to ${mood}.`
        );
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }
    
    resetSession();
  };

  const resetSession = () => {
    setSelectedSession(null);
    setIsPlaying(false);
    setTimeRemaining(0);
    setMoodBefore(null);
    setMoodAfter(null);
    setCurrentStep(0);
    setShowMoodCheck(false);
    fadeAnim.setValue(1);
    scaleAnim.setValue(1);
  };

  const startBreathingAnimation = () => {
    const breathingCycle = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (isPlaying) {
          breathingCycle();
        }
      });
    };
    breathingCycle();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'breathing': return 'leaf';
      case 'mindfulness': return 'flower';
      case 'body_scan': return 'body';
      case 'loving_kindness': return 'heart';
      default: return 'meditation';
    }
  };

  const getSessionColor = (type: string) => {
    switch (type) {
      case 'breathing': return '#4ECDC4';
      case 'mindfulness': return '#45B7D1';
      case 'body_scan': return '#96CEB4';
      case 'loving_kindness': return '#FFB6C1';
      default: return colors.primary;
    }
  };

  const MoodCheckModal = ({ onMoodSelect, title }: { onMoodSelect: (mood: number) => void; title: string }) => (
    <View style={styles.moodModalOverlay}>
      <View style={styles.moodModalContent}>
        <Text style={styles.moodModalTitle}>{title}</Text>
        <Text style={styles.moodModalSubtitle}>Rate your mood from 1-10</Text>
        <View style={styles.moodButtons}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((mood) => (
            <TouchableOpacity
              key={mood}
              style={[styles.moodButton, { backgroundColor: colors.card }]}
              onPress={() => onMoodSelect(mood)}
            >
              <Text style={styles.moodButtonText}>{mood}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 20,
      paddingBottom: 30,
      paddingHorizontal: 20,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.8)',
      textAlign: 'center',
      marginTop: 5,
    },
    sessionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 20,
      justifyContent: 'space-between',
    },
    sessionCard: {
      width: (width - 60) / 2,
      backgroundColor: colors.card,
      borderRadius: 15,
      padding: 15,
      marginBottom: 15,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    sessionIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    sessionName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 5,
    },
    sessionDuration: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 5,
    },
    sessionDescription: {
      fontSize: 12,
      color: colors.textTertiary,
      lineHeight: 16,
    },
    meditationContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    breathingCircle: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 40,
    },
    breathingText: {
      fontSize: 18,
      color: 'white',
      fontWeight: '600',
    },
    timerText: {
      fontSize: 48,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
    },
    instructionText: {
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 30,
    },
    controlButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
    },
    controlButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 30,
      paddingVertical: 15,
      borderRadius: 25,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    controlButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    moodModalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    moodModalContent: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 30,
      width: '90%',
      maxWidth: 400,
    },
    moodModalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 10,
    },
    moodModalSubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
    },
    moodButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 10,
    },
    moodButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    moodButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
  });

  if (showMoodCheck) {
    return (
      <MoodCheckModal
        onMoodSelect={moodBefore === null ? handleMoodBeforeSubmit : handleMoodAfterSubmit}
        title={moodBefore === null ? 'How are you feeling before meditation?' : 'How do you feel after meditation?'}
      />
    );
  }

  if (selectedSession && !showMoodCheck) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>{selectedSession.name}</Text>
          <Text style={styles.headerSubtitle}>
            {isPlaying ? 'Focus on your breath' : 'Ready to begin?'}
          </Text>
        </LinearGradient>

        <View style={styles.meditationContainer}>
          {isPlaying ? (
            <>
              <Animated.View
                style={[
                  styles.breathingCircle,
                  {
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <Text style={styles.breathingText}>
                  {currentStep < selectedSession.instructions.length
                    ? 'Breathe In'
                    : 'Breathe Out'}
                </Text>
              </Animated.View>
              
              <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
              
              <Text style={styles.instructionText}>
                {selectedSession.instructions[currentStep] || 'Continue breathing naturally...'}
              </Text>
              
              <View style={styles.controlButtons}>
                <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: colors.error }]}
                  onPress={resetSession}
                >
                  <Text style={styles.controlButtonText}>Stop</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={[styles.breathingCircle, { backgroundColor: colors.surface }]}>
                <Ionicons
                  name={getSessionIcon(selectedSession.type) as any}
                  size={60}
                  color={getSessionColor(selectedSession.type)}
                />
              </View>
              
              <Text style={styles.timerText}>{formatTime(selectedSession.duration * 60)}</Text>
              
              <Text style={styles.instructionText}>
                {selectedSession.description}
              </Text>
              
              <View style={styles.controlButtons}>
                <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: colors.error }]}
                  onPress={resetSession}
                >
                  <Text style={styles.controlButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => startSession(selectedSession)}
                >
                  <Text style={styles.controlButtonText}>Start</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Meditation & Breathing</Text>
        <Text style={styles.headerSubtitle}>Find peace and calm your mind</Text>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.sessionGrid}>
          {sessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={styles.sessionCard}
              onPress={() => startSession(session)}
            >
              <View
                style={[
                  styles.sessionIcon,
                  { backgroundColor: getSessionColor(session.type) + '20' },
                ]}
              >
                <Ionicons
                  name={getSessionIcon(session.type) as any}
                  size={24}
                  color={getSessionColor(session.type)}
                />
              </View>
              <Text style={styles.sessionName}>{session.name}</Text>
              <Text style={styles.sessionDuration}>{session.duration} minutes</Text>
              <Text style={styles.sessionDescription}>{session.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default MeditationScreen;
