import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getMonthlyStats, getMoodEntries } from '../utils/database';
import { MonthlyStats, MoodEntry } from '../types';

const { width } = Dimensions.get('window');

interface MonthlyReviewScreenProps {
  navigation: any;
}

export default function MonthlyReviewScreen({ navigation }: MonthlyReviewScreenProps) {
  const { colors } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonthlyStats();
  }, [currentMonth]);

  const loadMonthlyStats = async () => {
    try {
      setLoading(true);
      const monthString = currentMonth.toISOString().slice(0, 7); // YYYY-MM format
      const monthlyStats = await getMonthlyStats(monthString);
      setStats(monthlyStats);
    } catch (error) {
      console.error('Error loading monthly stats:', error);
      Alert.alert('Error', 'Failed to load monthly statistics');
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: { [key: string]: string } = {
      'excellent': '😄',
      'good': '🙂',
      'neutral': '😐',
      'bad': '😔',
      'terrible': '😢',
    };
    return moodEmojis[mood] || '😐';
  };

  const getMoodColor = (mood: string) => {
    const moodColors: { [key: string]: string } = {
      'excellent': '#4CAF50',
      'good': '#8BC34A',
      'neutral': '#FFC107',
      'bad': '#FF9800',
      'terrible': '#F44336',
    };
    return moodColors[mood] || colors.textSecondary;
  };

  const renderStatCard = (title: string, value: string | number, icon: string, color?: string) => (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.statHeader}>
        <Text style={[styles.statIcon, { color: color || colors.primary }]}>{icon}</Text>
        <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    </View>
  );

  const renderMoodDistribution = () => {
    if (!stats?.moodDistribution) return null;

    const totalEntries = stats.totalEntries;
    const moodEntries = Object.entries(stats.moodDistribution);

    return (
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Mood Distribution</Text>
        {moodEntries.map(([mood, count]) => {
          const percentage = totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0;
          const barWidth = (count / totalEntries) * (width - 80);

          return (
            <View key={mood} style={styles.moodBarContainer}>
              <View style={styles.moodBarHeader}>
                <Text style={[styles.moodBarEmoji, { fontSize: 20 }]}>
                  {getMoodEmoji(mood)}
                </Text>
                <Text style={[styles.moodBarLabel, { color: colors.text }]}>
                  {mood.charAt(0).toUpperCase() + mood.slice(1)}
                </Text>
                <Text style={[styles.moodBarCount, { color: colors.textSecondary }]}>
                  {count} ({percentage}%)
                </Text>
              </View>
              <View style={[styles.moodBarBackground, { backgroundColor: colors.divider }]}>
                <View
                  style={[
                    styles.moodBarFill,
                    {
                      width: barWidth,
                      backgroundColor: getMoodColor(mood),
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderTopActivities = () => {
    if (!stats?.topActivities || stats.topActivities.length === 0) return null;

    return (
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Activities</Text>
        {stats.topActivities.map((activity, index) => (
          <View key={activity} style={styles.activityItem}>
            <View style={[styles.activityRank, { backgroundColor: colors.primary }]}>
              <Text style={[styles.activityRankText, { color: colors.surface }]}>
                {index + 1}
              </Text>
            </View>
            <Text style={[styles.activityName, { color: colors.text }]}>{activity}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderInsights = () => {
    if (!stats) return null;

    const insights = [];
    
    if (stats.averageMood > 7) {
      insights.push('🌟 You had a great month! Keep up the positive energy.');
    } else if (stats.averageMood > 5) {
      insights.push('👍 Your mood was generally positive this month.');
    } else {
      insights.push('💪 Remember, every day is a new opportunity for improvement.');
    }

    if (stats.averageSleep < 7) {
      insights.push('😴 Consider getting more sleep - it can significantly improve your mood.');
    }

    if (stats.averageExercise < 30) {
      insights.push('🏃‍♂️ Regular exercise can boost your mood and energy levels.');
    }

    if (stats.averageWater < 8) {
      insights.push('💧 Staying hydrated is important for mental clarity and mood.');
    }

    return (
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Insights</Text>
        {insights.map((insight, index) => (
          <View key={index} style={styles.insightItem}>
            <Text style={[styles.insightText, { color: colors.text }]}>{insight}</Text>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading monthly review...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => changeMonth('prev')}
          >
            <Ionicons name="chevron-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <View style={styles.monthInfo}>
            <Text style={styles.monthTitle}>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <Text style={styles.monthSubtitle}>Monthly Review</Text>
          </View>
          
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => changeMonth('next')}
          >
            <Ionicons name="chevron-forward" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {stats ? (
          <>
            <View style={styles.statsGrid}>
              {renderStatCard('Total Entries', stats.totalEntries, '📊')}
              {renderStatCard('Average Mood', `${stats.averageMood.toFixed(1)}/10`, '😊')}
              {renderStatCard('Most Frequent', getMoodEmoji(stats.mostFrequentMood), '🎯')}
              {renderStatCard('Avg Sleep', `${stats.averageSleep.toFixed(1)}h`, '😴')}
              {renderStatCard('Avg Exercise', `${stats.averageExercise.toFixed(0)}min`, '🏃‍♂️')}
              {renderStatCard('Avg Water', `${stats.averageWater.toFixed(1)}L`, '💧')}
            </View>

            {renderMoodDistribution()}
            {renderTopActivities()}
            {renderInsights()}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No data for this month
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
              Start tracking your mood to see monthly insights
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthButton: {
    padding: 10,
  },
  monthInfo: {
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  monthSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: (width - 60) / 2,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  moodBarContainer: {
    marginBottom: 15,
  },
  moodBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodBarEmoji: {
    marginRight: 8,
  },
  moodBarLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  moodBarCount: {
    fontSize: 12,
  },
  moodBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  moodBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityRankText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  activityName: {
    fontSize: 14,
    flex: 1,
  },
  insightItem: {
    marginBottom: 12,
    paddingLeft: 8,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
}); 