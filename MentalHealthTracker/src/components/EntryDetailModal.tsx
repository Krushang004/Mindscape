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

interface EntryDetailModalProps {
  visible: boolean;
  entry: MoodEntry | null;
  onClose: () => void;
}

const EntryDetailModal = ({ visible, entry, onClose }: EntryDetailModalProps) => {
  const { colors } = useTheme();

  if (!entry) return null;

  const formatDate = (dateString: string) => {
    const [y, m, d] = dateString.split('-').map(Number);
    const date = new Date(y, (m || 1) - 1, d || 1);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getMoodColor = (moodLevel: number) => {
    if (moodLevel >= 8) return '#4CAF50';
    if (moodLevel >= 6) return '#8BC34A';
    if (moodLevel >= 4) return '#FFC107';
    if (moodLevel >= 2) return '#FF9800';
    return '#F44336';
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 15,
      padding: 20,
      width: '90%',
      maxWidth: 400,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    closeButton: {
      padding: 5,
    },
    content: {
      flex: 1,
    },
    dateHeader: {
      alignItems: 'center',
      marginBottom: 20,
    },
    dateText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    moodSection: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    moodDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    moodEmoji: {
      fontSize: 48,
      marginRight: 16,
    },
    moodInfo: {
      alignItems: 'center',
    },
    moodText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    moodLevel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    summarySection: {
      marginBottom: 20,
    },
    summaryText: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 8,
    },
    journalSection: {
      marginBottom: 20,
    },
    journalText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 8,
      fontStyle: 'italic',
    },
    activitiesSection: {
      marginBottom: 20,
    },
    activityList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    activityTag: {
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    activityText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '600',
    },
    metricsSection: {
      marginBottom: 20,
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    metricItem: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.card,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    metricIcon: {
      fontSize: 20,
      color: colors.primary,
      marginBottom: 4,
    },
    metricValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 2,
    },
    metricLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    suggestionsSection: {
      marginBottom: 20,
    },
    suggestionList: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 8,
    },
    suggestionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    suggestionBullet: {
      fontSize: 12,
      color: colors.primary,
      marginRight: 8,
    },
    suggestionText: {
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textTertiary,
      fontStyle: 'italic',
      textAlign: 'center',
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Daily Entry Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Date Header */}
            <View style={styles.dateHeader}>
              <Text style={styles.dateText}>{formatDate(entry.date)}</Text>
            </View>

            {/* Mood Section */}
            <View style={styles.moodSection}>
              <Text style={styles.sectionTitle}>Mood</Text>
              <View style={styles.moodDisplay}>
                <Text style={styles.moodEmoji}>{entry.emoji}</Text>
                <View style={styles.moodInfo}>
                  <Text style={styles.moodText}>{entry.mood}</Text>
                  <Text style={[styles.moodLevel, { color: getMoodColor(entry.moodLevel) }]}>
                    Level {entry.moodLevel}/10
                  </Text>
                </View>
              </View>
            </View>

            {/* Summary Section */}
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <Text style={styles.summaryText}>{entry.summary}</Text>
            </View>

            {/* Journal Section */}
            {entry.journal && (
              <View style={styles.journalSection}>
                <Text style={styles.sectionTitle}>Journal</Text>
                <Text style={styles.journalText}>{entry.journal}</Text>
              </View>
            )}

            {/* Activities Section */}
            <View style={styles.activitiesSection}>
              <Text style={styles.sectionTitle}>Activities</Text>
              {entry.activities && entry.activities.length > 0 ? (
                <View style={styles.activityList}>
                  {entry.activities.map((activity, index) => (
                    <View key={index} style={styles.activityTag}>
                      <Text style={styles.activityText}>{activity}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>No activities recorded</Text>
              )}
            </View>

            {/* Metrics Section */}
            <View style={styles.metricsSection}>
              <Text style={styles.sectionTitle}>Daily Metrics</Text>
              <View style={styles.metricsGrid}>
                {entry.sleepHours && (
                  <View style={styles.metricItem}>
                    <Ionicons name="moon-outline" style={styles.metricIcon} />
                    <Text style={styles.metricValue}>{entry.sleepHours}h</Text>
                    <Text style={styles.metricLabel}>Sleep</Text>
                  </View>
                )}
                
                {entry.exerciseMinutes && (
                  <View style={styles.metricItem}>
                    <Ionicons name="fitness-outline" style={styles.metricIcon} />
                    <Text style={styles.metricValue}>{entry.exerciseMinutes}m</Text>
                    <Text style={styles.metricLabel}>Exercise</Text>
                  </View>
                )}
                
                {entry.waterIntake && (
                  <View style={styles.metricItem}>
                    <Ionicons name="water-outline" style={styles.metricIcon} />
                    <Text style={styles.metricValue}>{entry.waterIntake}L</Text>
                    <Text style={styles.metricLabel}>Water</Text>
                  </View>
                )}
                
                {entry.stressLevel && (
                  <View style={styles.metricItem}>
                    <Ionicons name="alert-circle-outline" style={styles.metricIcon} />
                    <Text style={styles.metricValue}>{entry.stressLevel}/10</Text>
                    <Text style={styles.metricLabel}>Stress</Text>
                  </View>
                )}
                
                {entry.energyLevel && (
                  <View style={styles.metricItem}>
                    <Ionicons name="flash-outline" style={styles.metricIcon} />
                    <Text style={styles.metricValue}>{entry.energyLevel}/10</Text>
                    <Text style={styles.metricLabel}>Energy</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Suggestions Section */}
            <View style={styles.suggestionsSection}>
              <Text style={styles.sectionTitle}>Suggestions</Text>
              <View style={styles.suggestionList}>
                {entry.moodLevel < 5 && (
                  <>
                    <View style={styles.suggestionItem}>
                      <Text style={styles.suggestionBullet}>•</Text>
                      <Text style={styles.suggestionText}>Try some light exercise to boost your mood</Text>
                    </View>
                    <View style={styles.suggestionItem}>
                      <Text style={styles.suggestionBullet}>•</Text>
                      <Text style={styles.suggestionText}>Practice deep breathing or meditation</Text>
                    </View>
                    <View style={styles.suggestionItem}>
                      <Text style={styles.suggestionBullet}>•</Text>
                      <Text style={styles.suggestionText}>Reach out to a friend or family member</Text>
                    </View>
                  </>
                )}
                {entry.moodLevel >= 5 && (
                  <>
                    <View style={styles.suggestionItem}>
                      <Text style={styles.suggestionBullet}>•</Text>
                      <Text style={styles.suggestionText}>Great job maintaining a positive mood!</Text>
                    </View>
                    <View style={styles.suggestionItem}>
                      <Text style={styles.suggestionBullet}>•</Text>
                      <Text style={styles.suggestionText}>Keep up with your healthy habits</Text>
                    </View>
                    <View style={styles.suggestionItem}>
                      <Text style={styles.suggestionBullet}>•</Text>
                      <Text style={styles.suggestionText}>Consider trying a new activity or hobby</Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default EntryDetailModal; 