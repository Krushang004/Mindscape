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
  Image,
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

  const StatCard = ({ title, value, subtitle, icon, onPress }: any) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.statCardContent}>
        <View style={styles.iconGlowContainer}>
          <Ionicons name={icon} size={24} color={colors.primary} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );

  const QuickActionCard = ({ title, description, icon, onPress }: any) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.quickActionIconContainer}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={styles.quickActionTitle} numberOfLines={1}>{title}</Text>
      <Text style={styles.quickActionDescription} numberOfLines={2}>{description}</Text>
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
    logoImage: {
      width: 72,
      height: 72,
      marginBottom: 10,
      borderRadius: 20, // Optional, makes it blend smoothly if it has a background
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
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 5,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
    },
    statCardContent: {
      alignItems: 'center',
      padding: 16,
    },
    iconGlowContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(76, 111, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    statValue: {
      fontSize: 26,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    statTitle: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 2,
    },
    statSubtitle: {
      fontSize: 10,
      color: colors.textSecondary,
      textAlign: 'center',
      opacity: 0.7,
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
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    quickActionCard: {
      width: '48%',
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 16,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
      elevation: 3,
    },
    quickActionIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(76, 111, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    quickActionTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    quickActionDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 16,
    },
    recentEntryCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: 15,
      borderRadius: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.6,
      shadowRadius: 4,
      elevation: 2,
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
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.6,
      shadowRadius: 4,
      elevation: 2,
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
            <Image 
              source={require('../../assets/icon.png')} 
              style={styles.logoImage} 
              resizeMode="contain" 
            />
            <Text style={styles.headerTitle}>Mindscape</Text>
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
            onPress={() => Alert.alert('Streak', `You've been tracking for ${dashboardData.currentStreak} days!`)}
          />
          <StatCard
            title="Total Entries"
            value={dashboardData.totalEntries}
            subtitle="entries"
            icon="book"
            onPress={() => navigation.navigate('History' as never)}
          />
          <StatCard
            title="Average Mood"
            value={dashboardData.averageMood.toFixed(1)}
            subtitle="out of 10"
            icon="happy"
            onPress={() => navigation.navigate('History' as never)}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
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
              title="Assessments"
              description="Take standard mental health tests"
              icon="clipboard"
              onPress={() => navigation.navigate('Assessments' as never)}
            />
            <QuickActionCard
              title="Trusted Contacts"
              description="Manage your support network"
              icon="people"
              onPress={() => navigation.navigate('Trusted Contacts' as never)}
            />
            <QuickActionCard
              title="Analytics"
              description="Discover patterns in your data"
              icon="analytics"
              onPress={() => navigation.navigate('Analytics' as never)}
            />
          </View>
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