import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MoodEntry, NomineeAlert } from '../types';
import { saveMoodEntry, getMoodEntryByDate, checkStressThreshold, saveNomineeAlert } from '../utils/database';
import { MOOD_EMOJIS, getMoodSuggestion } from '../constants/moodData';
import { useTheme } from '../context/ThemeContext';

const DailyEntryScreen = () => {
  const { colors } = useTheme();
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [summary, setSummary] = useState('');
  const [journal, setJournal] = useState('');
  const [activities, setActivities] = useState<string[]>([]);
  const [sleepHours, setSleepHours] = useState('');
  const [exerciseMinutes, setExerciseMinutes] = useState('');
  const [waterIntake, setWaterIntake] = useState('');
  const [stressLevel, setStressLevel] = useState('');
  const [energyLevel, setEnergyLevel] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkTodayEntry();
  }, []);

  // Returns YYYY-MM-DD based on local time to avoid timezone-related off-by-one issues
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const checkTodayEntry = async () => {
    try {
      const today = getLocalDateString();
      const existingEntry = await getMoodEntryByDate(today);
      
      if (existingEntry) {
        Alert.alert(
          'Entry Already Exists',
          'You already have an entry for today. Would you like to update it?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Update', onPress: () => loadExistingEntry(existingEntry) },
          ]
        );
      }
    } catch (error) {
      console.error('Error checking today entry:', error);
    }
  };

  const loadExistingEntry = (entry: MoodEntry) => {
    setSelectedMood(entry.mood);
    setSummary(entry.summary);
    setJournal(entry.journal);
    setActivities(entry.activities);
    setSleepHours(entry.sleepHours?.toString() || '');
    setExerciseMinutes(entry.exerciseMinutes?.toString() || '');
    setWaterIntake(entry.waterIntake?.toString() || '');
    setStressLevel(entry.stressLevel?.toString() || '');
    setEnergyLevel(entry.energyLevel?.toString() || '');
  };

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
  };

  const handleActivityToggle = (activity: string) => {
    setActivities(prev => 
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const handleSave = async () => {
    if (!selectedMood || !summary.trim()) {
      Alert.alert('Missing Information', 'Please select a mood and write a summary of your day.');
      return;
    }

    // Validate stress and energy levels
    const stressValue = stressLevel ? parseFloat(stressLevel) : 0;
    const energyValue = energyLevel ? parseFloat(energyLevel) : 0;
    
    if (stressValue > 10 || energyValue > 10) {
      Alert.alert('Invalid Input', 'Stress and Energy levels must be between 1-10.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting to save entry...');
      const moodData = MOOD_EMOJIS.find(m => m.mood === selectedMood);
      const today = getLocalDateString();
      
      const entry: MoodEntry = {
        id: Date.now().toString(),
        date: today,
        emoji: moodData?.emoji || '😊',
        mood: selectedMood,
        moodLevel: moodData?.moodLevel || 5,
        summary: summary.trim(),
        journal: journal.trim(),
        activities,
        sleepHours: sleepHours ? parseFloat(sleepHours) : undefined,
        exerciseMinutes: exerciseMinutes ? parseFloat(exerciseMinutes) : undefined,
        waterIntake: waterIntake ? parseFloat(waterIntake) : undefined,
        stressLevel: stressLevel ? parseFloat(stressLevel) : undefined,
        energyLevel: energyLevel ? parseFloat(energyLevel) : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveMoodEntry(entry);
      console.log('Entry saved successfully');
      
      // Check if stress level triggers nominee alerts
      if (entry.stressLevel && entry.stressLevel > 0) {
        await checkAndTriggerNomineeAlerts(entry.stressLevel, entry.date);
      }
      
      Alert.alert(
        'Entry Saved!',
        'Your daily entry has been saved successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              resetForm();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedMood('');
    setSummary('');
    setJournal('');
    setActivities([]);
    setSleepHours('');
    setExerciseMinutes('');
    setWaterIntake('');
    setStressLevel('');
    setEnergyLevel('');
  };

  const checkAndTriggerNomineeAlerts = async (stressLevel: number, date: string) => {
    try {
      // Get nominees that should be alerted for this stress level
      const nomineesToAlert = await checkStressThreshold(stressLevel);
      
      if (nomineesToAlert.length > 0) {
        console.log(`Triggering alerts for ${nomineesToAlert.length} nominees due to stress level ${stressLevel}`);
        
        // Create alerts for each nominee
        for (const nominee of nomineesToAlert) {
          const alert: NomineeAlert = {
            id: Date.now().toString() + '_' + nominee.id,
            nomineeId: nominee.id,
            userId: '1', // This would be the current user's ID
            stressLevel,
            date,
            message: `Your loved one reported a stress level of ${stressLevel}/10 on ${date}. They might need your support right now.`,
            isRead: false,
            createdAt: new Date().toISOString(),
          };
          
          await saveNomineeAlert(alert);
          console.log(`Alert created for nominee: ${nominee.name}`);
        }
        
        // Show a gentle notification to the user
        Alert.alert(
          'Support Alert',
          `Your stress level of ${stressLevel}/10 has triggered support notifications to your trusted contacts.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error checking nominee alerts:', error);
    }
  };

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
      fontSize: 24,
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
    section: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 15,
    },
    moodGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    moodButton: {
      width: '30%',
      aspectRatio: 1,
      backgroundColor: colors.card,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
      borderWidth: 3,
      borderColor: colors.border,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    moodButtonSelected: {
      elevation: 4,
      shadowOpacity: 0.2,
      backgroundColor: '#ffffff',
      borderColor: '#ffffff',
      transform: [{ scale: 1.04 }],
    },
    moodEmoji: {
      fontSize: 32,
      marginBottom: 5,
    },
    moodEmojiSelected: {
      fontSize: 36,
    },
    moodLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    moodLabelSelected: {
      color: '#000000',
      fontWeight: 'bold',
    },
    summaryInput: {
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 15,
      fontSize: 16,
      minHeight: 50,
      textAlignVertical: 'top',
      color: colors.text,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    journalInput: {
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 15,
      fontSize: 16,
      minHeight: 120,
      maxHeight: 200,
      textAlignVertical: 'top',
      color: colors.text,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    activitiesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    activityButton: {
      backgroundColor: colors.card,
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    activityButtonSelected: {
      backgroundColor: '#ffffff',
      borderColor: '#ffffff',
    },
    activityText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    activityTextSelected: {
      color: '#000000',
      fontWeight: 'bold',
    },
    metricsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    metricInput: {
      flex: 1,
      marginHorizontal: 5,
    },
    metricLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 5,
    },
    input: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.text,
      elevation: 1,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
    },
    suggestionsContainer: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      padding: 15,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    suggestionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    suggestionText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: 8,
      flex: 1,
    },
    saveButton: {
      borderRadius: 25,
      elevation: 3,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 25,
    },
    saveButtonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Daily Entry</Text>
          <Text style={styles.headerSubtitle}>How are you feeling today?</Text>
        </LinearGradient>

        {/* Mood Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Your Mood</Text>
          <View style={styles.moodGrid}>
            {MOOD_EMOJIS.map((mood) => (
              <TouchableOpacity
                key={mood.mood}
                style={[
                  styles.moodButton,
                  selectedMood === mood.mood && styles.moodButtonSelected,
                ]}
                onPress={() => handleMoodSelect(mood.mood)}
              >
                <Text
                  style={[
                    styles.moodEmoji,
                    selectedMood === mood.mood && styles.moodEmojiSelected,
                  ]}
                >
                  {mood.emoji}
                </Text>
                <Text
                  style={[
                    styles.moodLabel,
                    selectedMood === mood.mood && styles.moodLabelSelected,
                  ]}
                >
                  {mood.mood}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>One-Sentence Summary</Text>
          <TextInput
            style={styles.summaryInput}
            placeholder="Describe your day in one sentence..."
            placeholderTextColor={colors.textTertiary}
            value={summary}
            onChangeText={setSummary}
            multiline
          />
        </View>

        {/* Journal (Optional) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Journal (Optional)</Text>
          <TextInput
            style={styles.journalInput}
            placeholder="Write more about your day if you'd like..."
            placeholderTextColor={colors.textTertiary}
            value={journal}
            onChangeText={setJournal}
            multiline
            scrollEnabled
            textAlignVertical="top"
          />
        </View>

        {/* Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activities</Text>
          <View style={styles.activitiesGrid}>
            {[
              'Exercise', 'Meditation', 'Reading', 'Socializing',
              'Work', 'Study', 'Creative', 'Outdoor', 'Rest'
            ].map((activity) => (
              <TouchableOpacity
                key={activity}
                style={[
                  styles.activityButton,
                  activities.includes(activity) && styles.activityButtonSelected,
                ]}
                onPress={() => handleActivityToggle(activity)}
              >
                <Text style={[
                  styles.activityText,
                  activities.includes(activity) && styles.activityTextSelected,
                ]}>
                  {activity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Metrics</Text>
          
          <View style={styles.metricsRow}>
            <View style={styles.metricInput}>
              <Text style={styles.metricLabel}>Sleep (hours)</Text>
              <TextInput
                style={styles.input}
                placeholder="8"
                placeholderTextColor={colors.textTertiary}
                value={sleepHours}
                onChangeText={setSleepHours}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.metricInput}>
              <Text style={styles.metricLabel}>Exercise (minutes)</Text>
              <TextInput
                style={styles.input}
                placeholder="30"
                placeholderTextColor={colors.textTertiary}
                value={exerciseMinutes}
                onChangeText={setExerciseMinutes}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricInput}>
              <Text style={styles.metricLabel}>Water (glasses)</Text>
              <TextInput
                style={styles.input}
                placeholder="8"
                placeholderTextColor={colors.textTertiary}
                value={waterIntake}
                onChangeText={setWaterIntake}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.metricInput}>
              <Text style={styles.metricLabel}>Stress Level (1-10)</Text>
              <TextInput
                style={styles.input}
                placeholder="5"
                placeholderTextColor={colors.textTertiary}
                value={stressLevel}
                onChangeText={(text) => {
                  const num = parseFloat(text);
                  if (text === '' || (num >= 0 && num <= 10)) {
                    setStressLevel(text);
                  }
                }}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricInput}>
              <Text style={styles.metricLabel}>Energy Level (1-10)</Text>
              <TextInput
                style={styles.input}
                placeholder="7"
                placeholderTextColor={colors.textTertiary}
                value={energyLevel}
                onChangeText={(text) => {
                  const num = parseFloat(text);
                  if (text === '' || (num >= 0 && num <= 10)) {
                    setEnergyLevel(text);
                  }
                }}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Suggestions */}
        {selectedMood && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggestions</Text>
            <View style={styles.suggestionsContainer}>
              {getMoodSuggestion(selectedMood)?.suggestions.slice(0, 3).map((suggestion, index) => (
                <View key={index} style={styles.suggestionItem}>
                  <Ionicons name="bulb" size={16} color={colors.primary} />
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Save Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!selectedMood || !summary.trim() || isLoading) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!selectedMood || !summary.trim() || isLoading}
          >
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={styles.saveButtonGradient}
            >
              <Ionicons name="save" size={20} color={colors.primary} />
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save Today\'s Entry'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default DailyEntryScreen; 