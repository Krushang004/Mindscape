import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { AnalyticsData, Insight, MoodEntry, Habit } from '../types';
import { 
  getMoodEntries, 
  getHabits, 
  getHabitCompletions,
  getMeditationSessions 
} from '../utils/database';

const { width } = Dimensions.get('window');

const AnalyticsScreen = () => {
  const { colors } = useTheme();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const [moodEntries, habits, habitCompletions, meditationSessions] = await Promise.all([
        getMoodEntries(),
        getHabits(),
        getHabitCompletions(),
        getMeditationSessions(),
      ]);

      const data = generateAnalyticsData(moodEntries, habits, habitCompletions, meditationSessions);
      setAnalyticsData(data);
      
      const generatedInsights = generateInsights(data, moodEntries, habits, habitCompletions);
      setInsights(generatedInsights);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAnalyticsData = (moodEntries: MoodEntry[], habits: Habit[], habitCompletions: any[], meditationSessions: any[]): AnalyticsData => {
    const now = new Date();
    const periodDays = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 365;
    const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    // Filter data by selected period
    const recentEntries = moodEntries.filter(entry => 
      new Date(entry.date) >= startDate
    );

    // Mood trends
    const moodTrends = generateMoodTrends(recentEntries, selectedPeriod);

    // Habit performance
    const habitPerformance = generateHabitPerformance(habits, habitCompletions, recentEntries);

    // Activity correlations
    const activityCorrelations = generateActivityCorrelations(recentEntries);

    // Sleep-mood correlation
    const sleepMoodCorrelation = generateSleepMoodCorrelation(recentEntries);

    // Stress patterns
    const stressPatterns = generateStressPatterns(recentEntries);

    return {
      moodTrends,
      habitPerformance,
      activityCorrelations,
      sleepMoodCorrelation,
      stressPatterns,
    };
  };

  const generateMoodTrends = (entries: MoodEntry[], period: string) => {
    const trends = [];
    const groupSize = period === 'week' ? 1 : period === 'month' ? 7 : 30;
    
    for (let i = 0; i < entries.length; i += groupSize) {
      const group = entries.slice(i, i + groupSize);
      if (group.length === 0) continue;

      const averageMood = group.reduce((sum, entry) => sum + entry.moodLevel, 0) / group.length;
      const moodVariance = group.reduce((sum, entry) => sum + Math.pow(entry.moodLevel - averageMood, 2), 0) / group.length;
      
      const periodLabel = period === 'week' ? 
        new Date(group[0].date).toLocaleDateString('en-US', { weekday: 'short' }) :
        period === 'month' ? 
        `Week ${Math.floor(i / groupSize) + 1}` :
        `Month ${Math.floor(i / groupSize) + 1}`;

      trends.push({
        period: periodLabel,
        averageMood: Math.round(averageMood * 10) / 10,
        moodVariance: Math.round(moodVariance * 10) / 10,
        trend: i > 0 ? 
          (averageMood > trends[trends.length - 1].averageMood ? 'improving' : 
           averageMood < trends[trends.length - 1].averageMood ? 'declining' : 'stable') : 
          'stable'
      });
    }

    return trends;
  };

  const generateHabitPerformance = (habits: Habit[], habitCompletions: any[], moodEntries: MoodEntry[]) => {
    return habits.map(habit => {
      const habitCompletionsForHabit = habitCompletions.filter(c => c.habitId === habit.id);
      const totalDays = 30; // Last 30 days
      const completionRate = (habitCompletionsForHabit.length / totalDays) * 100;
      
      // Calculate mood impact (simplified)
      const moodImpact = habit.totalCompletions > 0 ? 
        Math.min(10, Math.max(1, habit.currentStreak * 0.5)) : 0;

      return {
        habitId: habit.id,
        habitName: habit.name,
        completionRate: Math.round(completionRate),
        averageStreak: habit.longestStreak,
        moodImpact: Math.round(moodImpact * 10) / 10,
      };
    });
  };

  const generateActivityCorrelations = (entries: MoodEntry[]) => {
    const activityMap = new Map<string, { totalMood: number; count: number; frequency: number }>();
    
    entries.forEach(entry => {
      entry.activities.forEach(activity => {
        if (!activityMap.has(activity)) {
          activityMap.set(activity, { totalMood: 0, count: 0, frequency: 0 });
        }
        const data = activityMap.get(activity)!;
        data.totalMood += entry.moodLevel;
        data.count += 1;
        data.frequency += 1;
      });
    });

    return Array.from(activityMap.entries()).map(([activity, data]) => ({
      activity,
      moodImprovement: data.count > 0 ? Math.round((data.totalMood / data.count) * 10) / 10 : 0,
      frequency: data.frequency,
      recommendation: data.count > 0 && (data.totalMood / data.count) > 7 ? 
        'Keep doing this activity!' : 
        'Consider trying this activity more often'
    })).sort((a, b) => b.moodImprovement - a.moodImprovement);
  };

  const generateSleepMoodCorrelation = (entries: MoodEntry[]) => {
    const sleepMap = new Map<number, { totalMood: number; count: number }>();
    
    entries.forEach(entry => {
      if (entry.sleepHours) {
        const sleepHours = Math.round(entry.sleepHours);
        if (!sleepMap.has(sleepHours)) {
          sleepMap.set(sleepHours, { totalMood: 0, count: 0 });
        }
        const data = sleepMap.get(sleepHours)!;
        data.totalMood += entry.moodLevel;
        data.count += 1;
      }
    });

    return Array.from(sleepMap.entries()).map(([sleepHours, data]) => ({
      sleepHours,
      averageMood: Math.round((data.totalMood / data.count) * 10) / 10,
      dataPoints: data.count,
    })).sort((a, b) => a.sleepHours - b.sleepHours);
  };

  const generateStressPatterns = (entries: MoodEntry[]) => {
    const dayMap = new Map<string, { totalStress: number; count: number }>();
    
    entries.forEach(entry => {
      if (entry.stressLevel) {
        const dayOfWeek = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long' });
        if (!dayMap.has(dayOfWeek)) {
          dayMap.set(dayOfWeek, { totalStress: 0, count: 0 });
        }
        const data = dayMap.get(dayOfWeek)!;
        data.totalStress += entry.stressLevel;
        data.count += 1;
      }
    });

    return Array.from(dayMap.entries()).map(([dayOfWeek, data]) => ({
      dayOfWeek,
      averageStress: Math.round((data.totalStress / data.count) * 10) / 10,
      frequency: data.count,
    })).sort((a, b) => b.averageStress - a.averageStress);
  };

  const generateInsights = (data: AnalyticsData, moodEntries: MoodEntry[], habits: Habit[], habitCompletions: any[]): Insight[] => {
    const insights: Insight[] = [];

    // Mood pattern insights
    if (data.moodTrends.length > 1) {
      const recentTrend = data.moodTrends[data.moodTrends.length - 1];
      const previousTrend = data.moodTrends[data.moodTrends.length - 2];
      
      if (recentTrend.trend === 'improving') {
        insights.push({
          id: '1',
          type: 'mood_pattern',
          title: 'Mood Improvement Detected! 🎉',
          description: `Your mood has been improving over the last ${selectedPeriod}. Keep up the great work!`,
          data: { trend: recentTrend.trend, change: recentTrend.averageMood - previousTrend.averageMood },
          confidence: 0.8,
          actionable: true,
          recommendations: [
            'Continue your current routine',
            'Consider what activities might be helping',
            'Track what makes you feel good'
          ],
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Habit correlation insights
    const topHabit = data.habitPerformance.sort((a, b) => b.moodImpact - a.moodImpact)[0];
    if (topHabit && topHabit.moodImpact > 6) {
      insights.push({
        id: '2',
        type: 'habit_correlation',
        title: 'Habit Impact Found! 💪',
        description: `Your habit "${topHabit.habitName}" is positively impacting your mood.`,
        data: { habit: topHabit },
        confidence: 0.7,
        actionable: true,
        recommendations: [
          `Keep up with ${topHabit.habitName}`,
          'Consider adding similar habits',
          'Track your progress regularly'
        ],
        createdAt: new Date().toISOString(),
      });
    }

    // Activity insights
    const topActivity = data.activityCorrelations[0];
    if (topActivity && topActivity.moodImprovement > 7) {
      insights.push({
        id: '3',
        type: 'activity_impact',
        title: 'Activity Boost! ⚡',
        description: `"${topActivity.activity}" consistently improves your mood.`,
        data: { activity: topActivity },
        confidence: 0.9,
        actionable: true,
        recommendations: [
          `Do more ${topActivity.activity}`,
          'Schedule it regularly',
          'Try similar activities'
        ],
        createdAt: new Date().toISOString(),
      });
    }

    // Sleep insights
    if (data.sleepMoodCorrelation.length > 0) {
      const bestSleep = data.sleepMoodCorrelation.sort((a, b) => b.averageMood - a.averageMood)[0];
      insights.push({
        id: '4',
        type: 'sleep_mood',
        title: 'Sleep Quality Matters! 😴',
        description: `You feel best with ${bestSleep.sleepHours} hours of sleep.`,
        data: { sleep: bestSleep },
        confidence: 0.8,
        actionable: true,
        recommendations: [
          `Aim for ${bestSleep.sleepHours} hours of sleep`,
          'Maintain consistent sleep schedule',
          'Create a bedtime routine'
        ],
        createdAt: new Date().toISOString(),
      });
    }

    // Stress pattern insights
    if (data.stressPatterns.length > 0) {
      const highestStressDay = data.stressPatterns[0];
      if (highestStressDay.averageStress > 7) {
        insights.push({
          id: '5',
          type: 'stress_trend',
          title: 'Stress Pattern Alert! ⚠️',
          description: `${highestStressDay.dayOfWeek}s tend to be more stressful for you.`,
          data: { stressDay: highestStressDay },
          confidence: 0.6,
          actionable: true,
          recommendations: [
            'Plan stress-relief activities for this day',
            'Consider what causes stress on this day',
            'Prepare coping strategies in advance'
          ],
          createdAt: new Date().toISOString(),
        });
      }
    }

    return insights.sort((a, b) => b.confidence - a.confidence);
  };

  const StatCard = ({ title, value, subtitle, icon, color, onPress }: any) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <LinearGradient
        colors={[color, color + '80']}
        style={styles.statCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.statCardContent}>
          <Ionicons name={icon} size={24} color="white" />
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const InsightCard = ({ insight }: { insight: Insight }) => (
    <View style={styles.insightCard}>
      <View style={styles.insightHeader}>
        <Text style={styles.insightTitle}>{insight.title}</Text>
        <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(insight.confidence) }]}>
          <Text style={styles.confidenceText}>
            {Math.round(insight.confidence * 100)}%
          </Text>
        </View>
      </View>
      <Text style={styles.insightDescription}>{insight.description}</Text>
      {insight.recommendations.length > 0 && (
        <View style={styles.recommendationsContainer}>
          <Text style={styles.recommendationsTitle}>Recommendations:</Text>
          {insight.recommendations.map((rec, index) => (
            <Text key={index} style={styles.recommendationItem}>• {rec}</Text>
          ))}
        </View>
      )}
    </View>
  );

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return colors.success;
    if (confidence >= 0.6) return colors.warning || '#FFA500';
    return colors.error;
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
    periodSelector: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 20,
    },
    periodButton: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      marginHorizontal: 5,
      borderRadius: 20,
      borderWidth: 1,
    },
    periodButtonActive: {
      backgroundColor: '#ffffff',
    },
    periodButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    periodButtonTextActive: {
      color: '#000000',
      fontWeight: 'bold',
    },
    periodButtonTextInactive: {
      color: colors.textSecondary,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      marginHorizontal: 5,
      borderRadius: 15,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    statCardGradient: {
      borderRadius: 15,
      padding: 15,
    },
    statCardContent: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
      marginTop: 5,
    },
    statTitle: {
      fontSize: 12,
      color: 'white',
      textAlign: 'center',
      marginTop: 5,
    },
    statSubtitle: {
      fontSize: 10,
      color: 'rgba(255, 255, 255, 0.8)',
      textAlign: 'center',
      marginTop: 2,
    },
    section: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 15,
    },
    insightCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    insightHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    insightTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    confidenceBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    confidenceText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: 'white',
    },
    insightDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    recommendationsContainer: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 12,
    },
    recommendationsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 6,
    },
    recommendationItem: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
      marginBottom: 2,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyIcon: {
      fontSize: 64,
      color: colors.textTertiary,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Analytics & Insights</Text>
          <Text style={styles.headerSubtitle}>Loading your data...</Text>
        </LinearGradient>
        <View style={styles.emptyState}>
          <Ionicons name="analytics" style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>Analyzing Data</Text>
          <Text style={styles.emptyText}>Please wait while we process your information...</Text>
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
        <Text style={styles.headerTitle}>Analytics & Insights</Text>
        <Text style={styles.headerSubtitle}>Discover patterns in your mental health journey</Text>
      </LinearGradient>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(['week', 'month', 'year'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              { borderColor: colors.border },
              selectedPeriod === period && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period
                  ? styles.periodButtonTextActive
                  : styles.periodButtonTextInactive,
              ]}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Key Stats */}
        {analyticsData && (
          <View style={styles.statsContainer}>
            <StatCard
              title="Avg Mood"
              value={analyticsData.moodTrends.length > 0 ? 
                analyticsData.moodTrends[analyticsData.moodTrends.length - 1].averageMood : 'N/A'}
              subtitle="out of 10"
              icon="happy"
              color="#45B7D1"
            />
            <StatCard
              title="Habits"
              value={analyticsData.habitPerformance.length}
              subtitle="tracked"
              icon="checkmark-circle"
              color="#4ECDC4"
            />
            <StatCard
              title="Insights"
              value={insights.length}
              subtitle="found"
              icon="bulb"
              color="#FF6B6B"
            />
          </View>
        )}

        {/* Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personalized Insights</Text>
          {insights.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="bulb-outline" style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>No Insights Yet</Text>
              <Text style={styles.emptyText}>
                Keep tracking your mood and activities to unlock personalized insights!
              </Text>
            </View>
          ) : (
            insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default AnalyticsScreen;
