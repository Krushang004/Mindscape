import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MoodEntry, DashboardData } from '../types';
import { getMoodEntries, getCurrentStreak } from '../utils/database';
import { MOOD_EMOJIS } from '../constants/moodData';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    currentStreak: 0,
    totalEntries: 0,
    averageMood: 0,
    weeklyMoodData: [],
    monthlyMoodData: [],
    recentEntries: [],
    moodDistribution: [],
  });
  const [refreshing, setRefreshing] = useState(false);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const loadDashboardData = async () => {
    try {
      console.log('Loading dashboard data...');
      const entries = await getMoodEntries();
      console.log('Found entries:', entries.length);
      const streak = await getCurrentStreak();
      
      const totalEntries = entries.length;
      const averageMood = entries.length > 0 
        ? entries.reduce((sum, entry) => sum + entry.moodLevel, 0) / entries.length 
        : 0;

      const recentEntries = entries.slice(0, 5);

      // Calculate mood distribution
      const moodCount: { [key: string]: number } = {};
      entries.forEach(entry => {
        moodCount[entry.mood] = (moodCount[entry.mood] || 0) + 1;
      });

      const moodDistribution = Object.entries(moodCount).map(([mood, count]) => ({
        mood,
        count,
      }));

      setDashboardData({
        currentStreak: streak,
        totalEntries,
        averageMood,
        weeklyMoodData: [],
        monthlyMoodData: [],
        recentEntries,
        moodDistribution,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getMoodEmoji = (mood: string) => {
    const moodData = MOOD_EMOJIS.find(m => m.mood === mood);
    return moodData?.emoji || '😊';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const StatCard = ({ title, value, subtitle, icon, color, onPress }: any) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <View
        style={[styles.statCardGradient, { backgroundColor: color }]}
      >
        <View style={styles.statCardContent}>
          <Ionicons name={icon} size={24} color={color === '#ffffff' ? '#000000' : '#ffffff'} />
          <Text style={[styles.statValue, { color: color === '#ffffff' ? '#000000' : '#ffffff' }]}>{value}</Text>
          <Text style={[styles.statTitle, { color: color === '#ffffff' ? '#000000' : '#ffffff' }]}>{title}</Text>
          {subtitle && <Text style={[styles.statSubtitle, { color: color === '#ffffff' ? '#666666' : 'rgba(255, 255, 255, 0.8)' }]}>{subtitle}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );

  const QuickActionCard = ({ title, description, icon, onPress }: any) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <View style={styles.quickActionIcon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const RecentEntryCard = ({ entry }: { entry: MoodEntry }) => (
    <TouchableOpacity style={styles.recentEntryCard}>
      <Text style={styles.recentEntryEmoji}>{entry.emoji}</Text>
      <View style={styles.recentEntryContent}>
        <Text style={styles.recentEntryDate}>{formatDate(entry.date)}</Text>
        <Text style={styles.recentEntryMood}>{entry.mood}</Text>
        <Text style={styles.recentEntrySummary}>{entry.summary}</Text>
      </View>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
      paddingBottom: 20, // Add bottom padding to avoid navigation bar overlap
    },
    header: {
      paddingTop: 60,
      paddingBottom: 30,
      paddingHorizontal: 20,
    },
    logoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoEmoji: {
      fontSize: 48,
      marginBottom: 10,
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
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginTop: -20,
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
      borderWidth: 1,
      borderColor: colors.border,
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
    quickActionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    quickActionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
    },
    quickActionContent: {
      flex: 1,
    },
    quickActionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    quickActionDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    recentEntryCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    recentEntryEmoji: {
      fontSize: 30,
      marginRight: 15,
    },
    recentEntryContent: {
      flex: 1,
    },
    recentEntryDate: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    recentEntryMood: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginTop: 2,
    },
    recentEntrySummary: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    moodDistribution: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: colors.card,
      padding: 20,
      borderRadius: 10,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    moodItem: {
      alignItems: 'center',
    },
    moodEmoji: {
      fontSize: 24,
      marginBottom: 5,
    },
    moodName: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    moodCount: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 2,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
      {/* Header */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🧠</Text>
          <Text style={styles.headerTitle}>Mental Health Tracker</Text>
          <Text style={styles.headerSubtitle}>Track your journey to better mental health</Text>
        </View>
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Current Streak"
          value={dashboardData.currentStreak}
          subtitle="days"
          icon="flame"
          color="#ffffff"
          onPress={() => Alert.alert('Streak', `You've been tracking for ${dashboardData.currentStreak} days!`)}
        />
        <StatCard
          title="Total Entries"
          value={dashboardData.totalEntries}
          subtitle="entries"
          icon="book"
          color="#ffffff"
          onPress={() => navigation.navigate('History' as never)}
        />
        <StatCard
          title="Average Mood"
          value={dashboardData.averageMood.toFixed(1)}
          subtitle="out of 10"
          icon="happy"
          color="#ffffff"
          onPress={() => navigation.navigate('History' as never)}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <QuickActionCard
          title="Add Today's Entry"
          description="Record how you're feeling today"
          icon="add-circle"
          onPress={() => navigation.navigate('DailyEntry' as never)}
        />
        <QuickActionCard
          title="View History"
          description="See your mood journey over time"
          icon="calendar"
          onPress={() => navigation.navigate('History' as never)}
        />
        <QuickActionCard
          title="Mood Boosters"
          description="Get suggestions to improve your mood"
          icon="bulb"
          onPress={() => navigation.navigate('Suggestions' as never)}
        />
        <QuickActionCard
          title="Goals & Activities"
          description="Track your mental health goals"
          icon="trophy"
          onPress={() => navigation.navigate('Goals' as never)}
        />
        <QuickActionCard
          title="Meditation Timer"
          description="Find peace with guided sessions"
          icon="leaf"
          onPress={() => navigation.navigate('Meditation' as never)}
        />
        <QuickActionCard
          title="Habit Tracker"
          description="Build positive daily habits"
          icon="checkmark-circle"
          onPress={() => navigation.navigate('HabitTracker' as never)}
        />
        <QuickActionCard
          title="Analytics"
          description="Discover patterns in your data"
          icon="analytics"
          onPress={() => navigation.navigate('Analytics' as never)}
        />
      </View>

      {/* Recent Entries */}
      {dashboardData.recentEntries.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Entries</Text>
          {dashboardData.recentEntries.map((entry) => (
            <RecentEntryCard key={entry.id} entry={entry} />
          ))}
        </View>
      )}

      {/* Mood Distribution */}
      {dashboardData.moodDistribution.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Mood Patterns</Text>
          <View style={styles.moodDistribution}>
            {dashboardData.moodDistribution.slice(0, 5).map((item) => (
              <View key={item.mood} style={styles.moodItem}>
                <Text style={styles.moodEmoji}>{getMoodEmoji(item.mood)}</Text>
                <Text style={styles.moodName}>{item.mood}</Text>
                <Text style={styles.moodCount}>{item.count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen; 