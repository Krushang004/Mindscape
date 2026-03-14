import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { getMoodEntries, getActivities } from '../utils/database';
import { MoodEntry, Activity } from '../types';
import { MOOD_SUGGESTIONS, getMoodEmoji as getMoodEmojiData } from '../constants/moodData';

interface SuggestionsScreenProps {
  navigation: any;
}

export default function SuggestionsScreen({ navigation }: SuggestionsScreenProps) {
  const { colors } = useTheme();
  const [recentMood, setRecentMood] = useState<string>('neutral');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Refresh data whenever the screen gains focus
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [moodEntries, availableActivities] = await Promise.all([
        getMoodEntries(),
        getActivities(),
      ]);
      
      setActivities(availableActivities);
      
      // Get the most recent mood
      if (moodEntries.length > 0) {
        setRecentMood(moodEntries[0].mood);
      }
    } catch (error) {
      console.error('Error loading suggestions data:', error);
      Alert.alert('Error', 'Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  const getMoodSuggestion = (mood: string) => {
    const suggestion = MOOD_SUGGESTIONS.find(s => s.mood.toLowerCase() === mood.toLowerCase());
    return suggestion || MOOD_SUGGESTIONS.find(s => s.mood === 'Neutral') || MOOD_SUGGESTIONS[0];
  };

  const resolveMoodEmoji = (mood: string) => getMoodEmojiData(mood)?.emoji || '😐';

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

  const renderSuggestionCard = (title: string, items: string[], icon: string) => (
    <View style={[styles.suggestionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon as any} size={24} color={colors.primary} style={styles.cardIcon} />
        <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
      </View>
      {items.map((item, index) => (
        <View key={index} style={styles.suggestionItem}>
          <Text style={[styles.bulletPoint, { color: colors.primary }]}>•</Text>
          <Text style={[styles.suggestionText, { color: colors.text }]}>{item}</Text>
        </View>
      ))}
    </View>
  );

  const renderActivityCard = (activity: Activity) => (
    <TouchableOpacity
      style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        Alert.alert(
          activity.name,
          `${activity.description}\n\nDuration: ${activity.duration} minutes\nMood Boost: ${activity.moodBoost}/10`,
          [{ text: 'OK' }]
        );
      }}
    >
      <View style={styles.activityHeader}>
        <View style={[styles.activityIcon, { backgroundColor: colors.primary }]}>
          <Ionicons name="fitness-outline" size={20} color={colors.surface} />
        </View>
        <View style={styles.activityInfo}>
          <Text style={[styles.activityName, { color: colors.text }]}>{activity.name}</Text>
          <Text style={[styles.activityCategory, { color: colors.textSecondary }]}>
            {activity.category}
          </Text>
        </View>
        <View style={styles.activityStats}>
          <Text style={[styles.activityDuration, { color: colors.textSecondary }]}>
            {activity.duration}m
          </Text>
          <Text style={[styles.activityBoost, { color: colors.success }]}>
            +{activity.moodBoost}
          </Text>
        </View>
      </View>
      <Text style={[styles.activityDescription, { color: colors.textSecondary }]} numberOfLines={2}>
        {activity.description}
      </Text>
    </TouchableOpacity>
  );

  const renderQuickActions = () => (
    <View style={[styles.quickActionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Daily Entry')}
        >
          <Ionicons name="add-circle-outline" size={24} color={colors.surface} />
          <Text style={[styles.quickActionText, { color: colors.surface }]}>Add Entry</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: colors.secondary }]}
          onPress={() => navigation.navigate('History', { screen: 'MonthlyReview' })}
        >
          <Ionicons name="analytics-outline" size={24} color={colors.surface} />
          <Text style={[styles.quickActionText, { color: colors.surface }]}>View Stats</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: colors.success }]}
          onPress={() => navigation.navigate('History')}
        >
          <Ionicons name="calendar-outline" size={24} color={colors.surface} />
          <Text style={[styles.quickActionText, { color: colors.surface }]}>History</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: colors.warning }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color={colors.surface} />
          <Text style={[styles.quickActionText, { color: colors.surface }]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading suggestions...</Text>
      </View>
    );
  }

  const currentSuggestion = getMoodSuggestion(recentMood);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          <Text style={styles.headerTitle}>Mood Suggestions</Text>
          <Text style={styles.headerSubtitle}>Personalized recommendations for you</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Mood Section */}
        <View style={[styles.moodSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Based on Your Recent Mood</Text>
          <View style={styles.moodInfo}>
            <Text style={[styles.moodEmoji, { fontSize: 48 }]}>
              {resolveMoodEmoji(recentMood)}
            </Text>
            <View style={styles.moodDetails}>
              <Text style={[styles.moodLabel, { color: colors.text }]}>
                {recentMood.charAt(0).toUpperCase() + recentMood.slice(1)}
              </Text>
              <Text style={[styles.moodDescription, { color: colors.textSecondary }]}>
                Here are some suggestions to help you feel better
              </Text>
            </View>
          </View>
        </View>

        {/* Suggestions */}
        {renderSuggestionCard('Suggestions', currentSuggestion.suggestions, 'bulb-outline')}
        {renderSuggestionCard('Activities', currentSuggestion.activities, 'fitness-outline')}
        {renderSuggestionCard('Affirmations', currentSuggestion.affirmations, 'sparkles-outline')}

        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Available Activities */}
        <View style={styles.activitiesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Activities</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Tap on an activity to learn more
          </Text>
          <FlatList
            data={activities}
            renderItem={({ item }) => renderActivityCard(item)}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
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
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 64,
    height: 64,
    marginBottom: 10,
    borderRadius: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  moodSection: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: 'rgba(76, 111, 255, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  moodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodEmoji: {
    marginRight: 15,
  },
  moodDetails: {
    flex: 1,
  },
  moodLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  moodDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  suggestionCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: 'rgba(76, 111, 255, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardIcon: {
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  suggestionItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 2,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  quickActionsContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: 'rgba(76, 111, 255, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  activitiesSection: {
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 15,
  },
  activityCard: {
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: 'rgba(76, 111, 255, 0.15)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityCategory: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  activityStats: {
    alignItems: 'flex-end',
  },
  activityDuration: {
    fontSize: 12,
    marginBottom: 2,
  },
  activityBoost: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  activityDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
}); 