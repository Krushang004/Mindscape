import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { MoodEntry } from '../types';

interface DayEntryBriefProps {
  visible: boolean;
  entry: MoodEntry | null;
  onClose: () => void;
}

const DayEntryBrief: React.FC<DayEntryBriefProps> = ({ visible, entry, onClose }) => {
  const { colors } = useTheme();

  if (!entry) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getMoodColor = (mood: string) => {
    const moodColors: { [key: string]: string } = {
      'Happy': '#4CAF50',
      'Sad': '#2196F3',
      'Angry': '#F44336',
      'Anxious': '#FF9800',
      'Tired': '#9C27B0',
      'Calm': '#00BCD4',
      'Confused': '#607D8B',
      'Frustrated': '#795548',
      'Loved': '#E91E63',
      'Confident': '#3F51B5',
    };
    return moodColors[mood] || colors.primary;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Day Entry Brief</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={[styles.dateText, { color: colors.text }]}>
              {formatDate(entry.date)}
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Mood Summary</Text>
            <View style={styles.moodDisplay}>
              <Text style={styles.moodEmoji}>{entry.emoji}</Text>
              <View style={styles.moodInfo}>
                <Text style={[styles.moodText, { color: getMoodColor(entry.mood) }]}>
                  {entry.mood}
                </Text>
                <Text style={[styles.moodLevel, { color: colors.textSecondary }]}>
                  Level: {entry.moodLevel}/10
                </Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Summary</Text>
            <Text style={[styles.text, { color: colors.textSecondary }]}>
              {entry.summary}
            </Text>

            {entry.journal && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Journal Entry</Text>
                <Text style={[styles.text, { color: colors.textSecondary }]}>
                  {entry.journal}
                </Text>
              </>
            )}

            {entry.activities && entry.activities.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Activities</Text>
                <Text style={[styles.text, { color: colors.textSecondary }]}>
                  {entry.activities.join(', ')}
                </Text>
              </>
            )}

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Metrics</Text>
            <View style={styles.metricsContainer}>
              {entry.sleepHours && (
                <Text style={[styles.metricText, { color: colors.textSecondary }]}>
                  Sleep: {entry.sleepHours} hours
                </Text>
              )}
              {entry.exerciseMinutes && (
                <Text style={[styles.metricText, { color: colors.textSecondary }]}>
                  Exercise: {entry.exerciseMinutes} minutes
                </Text>
              )}
              {entry.waterIntake && (
                <Text style={[styles.metricText, { color: colors.textSecondary }]}>
                  Water: {entry.waterIntake} glasses
                </Text>
              )}
              {entry.stressLevel && (
                <Text style={[styles.metricText, { color: colors.textSecondary }]}>
                  Stress Level: {entry.stressLevel}/10
                </Text>
              )}
              {entry.energyLevel && (
                <Text style={[styles.metricText, { color: colors.textSecondary }]}>
                  Energy Level: {entry.energyLevel}/10
                </Text>
              )}
            </View>

            <Text style={[styles.timestampText, { color: colors.textTertiary }]}>
              Created: {new Date(entry.createdAt).toLocaleString()}
            </Text>
            {entry.updatedAt !== entry.createdAt && (
              <Text style={[styles.timestampText, { color: colors.textTertiary }]}>
                Updated: {new Date(entry.updatedAt).toLocaleString()}
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 15,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  moodDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  moodEmoji: {
    fontSize: 32,
    marginRight: 15,
  },
  moodInfo: {
    flex: 1,
  },
  moodText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  moodLevel: {
    fontSize: 14,
  },
  metricsContainer: {
    marginBottom: 15,
  },
  metricText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 5,
  },
  timestampText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default DayEntryBrief;
