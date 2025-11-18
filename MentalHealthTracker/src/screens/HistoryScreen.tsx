import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ScrollView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getMoodEntries, deleteMoodEntry } from '../utils/database';
import { MoodEntry } from '../types';
import DayEntryBrief from '../components/DayEntryBrief';
import { useFocusEffect } from '@react-navigation/native';

interface HistoryScreenProps {
  navigation: any;
}

export default function HistoryScreen({ navigation }: HistoryScreenProps) {
  const { colors } = useTheme();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'week' | 'month'>('all');
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const getMoodColor = (mood: string) => {
    const moodColors: { [key: string]: string } = {
      'Happy': '#4CAF50',      // Green
      'Sad': '#2196F3',        // Blue
      'Angry': '#F44336',      // Red
      'Anxious': '#FF9800',    // Orange
      'Tired': '#9C27B0',      // Purple
      'Calm': '#00BCD4',       // Cyan
      'Confused': '#607D8B',   // Blue Grey
      'Frustrated': '#795548', // Brown
      'Loved': '#E91E63',      // Pink
      'Confident': '#3F51B5',  // Indigo
      'Excited': '#FF5722',    // Deep Orange
      'Peaceful': '#4DB6AC',   // Teal
      'Stressed': '#FF6B6B',   // Light Red
      'Grateful': '#8BC34A',   // Light Green
      'Hopeful': '#FFC107',    // Amber
    };
    return moodColors[mood] || colors.primary;
  };

  const formatDate = (dateString: string) => {
    const [y, m, d] = dateString.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    loadEntries();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Ensure entries refresh when returning to History
      loadEntries();
    }, [])
  );

  const loadEntries = async () => {
    try {
      console.log('Loading mood entries...');
      const moodEntries = await getMoodEntries();
      console.log('Loaded mood entries:', moodEntries);
      setEntries(moodEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
      Alert.alert('Error', 'Failed to load mood history');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  };

  const handleDeleteEntry = (entry: MoodEntry) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this mood entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMoodEntry(entry.id);
              await loadEntries();
              Alert.alert('Success', 'Entry deleted successfully');
            } catch (error) {
              console.error('Error deleting entry:', error);
              Alert.alert('Error', 'Failed to delete entry');
            }
          },
        },
      ]
    );
  };

  const getFilteredEntries = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);

    const parseLocalDate = (yyyyMmDd: string) => {
      const [y, m, d] = yyyyMmDd.split('-').map(Number);
      return new Date(y, (m || 1) - 1, d || 1);
    };

    switch (selectedFilter) {
      case 'week':
        return entries.filter(entry => parseLocalDate(entry.date) >= oneWeekAgo);
      case 'month':
        return entries.filter(entry => parseLocalDate(entry.date) >= oneMonthAgo);
      default:
        return entries;
    }
  };

  const renderFilterButton = (filter: 'all' | 'week' | 'month', label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        {
          backgroundColor: selectedFilter === filter ? '#ffffff' : colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          { color: selectedFilter === filter ? '#000000' : colors.text, fontWeight: selectedFilter === filter ? 'bold' : 'normal' },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderEntry = ({ item }: { item: MoodEntry }) => (
    <TouchableOpacity
      style={[styles.entryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        setSelectedEntry(item);
        setDetailModalVisible(true);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.entryHeader}>
        <Text style={[styles.entryEmoji, { fontSize: 28 }]}>{item.emoji}</Text>
        <View style={styles.entryInfo}>
          <Text style={[styles.entryDate, { color: colors.text }]}>
            {formatDate(item.date)}
          </Text>
          <Text style={[styles.entryMood, { color: colors.textSecondary }]}>
            {item.mood} • Level {item.moodLevel}/10
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            handleDeleteEntry(item);
          }}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
      
      {item.summary && (
      <Text style={[styles.entrySummary, { color: colors.text }]} numberOfLines={2}>
        {item.summary}
      </Text>
      )}
      
      {item.journal && (
        <Text style={[styles.entryJournal, { color: colors.textSecondary }]} numberOfLines={1}>
          📝 {item.journal}
        </Text>
      )}
      
      {item.activities && Array.isArray(item.activities) && item.activities.length > 0 && (
        <View style={styles.activitiesContainer}>
          <Text style={[styles.activitiesLabel, { color: colors.textSecondary }]}>
            🎯 Activities: {Array.isArray(item.activities) ? item.activities.filter(Boolean).join(', ') : 'None'}
          </Text>
        </View>
      )}

      {/* Quick Stats Row */}
      <View style={styles.quickStatsRow}>
        {item.sleepHours && (
          <View style={styles.quickStat}>
            <Text style={[styles.quickStatLabel, { color: colors.textTertiary }]}>😴 Sleep</Text>
            <Text style={[styles.quickStatValue, { color: colors.text }]}>{item.sleepHours}h</Text>
          </View>
        )}
        {item.exerciseMinutes && (
          <View style={styles.quickStat}>
            <Text style={[styles.quickStatLabel, { color: colors.textTertiary }]}>🏃‍♂️ Exercise</Text>
            <Text style={[styles.quickStatValue, { color: colors.text }]}>{item.exerciseMinutes}m</Text>
          </View>
        )}
        {item.waterIntake && (
          <View style={styles.quickStat}>
            <Text style={[styles.quickStatLabel, { color: colors.textTertiary }]}>💧 Water</Text>
            <Text style={[styles.quickStatValue, { color: colors.text }]}>{item.waterIntake}L</Text>
          </View>
        )}
        {item.stressLevel && (
          <View style={styles.quickStat}>
            <Text style={[styles.quickStatLabel, { color: colors.textTertiary }]}>😰 Stress</Text>
            <Text style={[styles.quickStatValue, { color: colors.text }]}>{item.stressLevel}/10</Text>
          </View>
        )}
      </View>

      <View style={styles.tapHint}>
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        <Text style={[styles.tapHintText, { color: colors.textTertiary }]}>Tap to view full details</Text>
      </View>
    </TouchableOpacity>
  );

  const filteredEntries = getFilteredEntries();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Mood History</Text>
        <Text style={styles.headerSubtitle}>
          {filteredEntries.length} entries found
        </Text>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Statistics Section */}
        <View style={styles.statsContainer}>
          <Text style={[styles.statsTitle, { color: colors.text }]}>📊 Your Mood Insights</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{entries.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>📝 Total Entries</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {entries.length > 0 ? (entries.reduce((sum, entry) => sum + entry.moodLevel, 0) / entries.length).toFixed(1) : '0'}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>😊 Avg Mood</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.warning }]}>
                {(() => {
                  if (entries.length === 0) return '0';
                  const today = new Date().toISOString().split('T')[0];
                  let streak = 0;
                  let currentDate = new Date();
                  
                  for (const entry of entries) {
                    const entryDate = new Date(entry.date);
                    const diffTime = Math.abs(currentDate.getTime() - entryDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays <= 1) {
                      streak++;
                      currentDate = entryDate;
                    } else {
                      break;
                    }
                  }
                  return streak;
                })()}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>🔥 Day Streak</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.info }]}>
                {(() => {
                  if (entries.length === 0) return '0';
                  const moodCounts: { [key: string]: number } = {};
                  entries.forEach(entry => {
                    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
                  });
                  const mostFrequent = Object.keys(moodCounts).reduce((a, b) => 
                    moodCounts[a] > moodCounts[b] ? a : b
                  );
                  return mostFrequent;
                })()}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>🎯 Top Mood</Text>
            </View>
          </View>
          
          {/* Mood Distribution Chart */}
          {entries.length > 0 && (
            <View style={[styles.moodDistributionContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.distributionTitle, { color: colors.text }]}>📈 Mood Distribution</Text>
              <View style={styles.moodBars}>
                {(() => {
                  const moodCounts: { [key: string]: number } = {};
                  entries.forEach(entry => {
                    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
                  });
                  
                  const totalEntries = entries.length;
                  const sortedMoods = Object.entries(moodCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5);
                  
                  return sortedMoods.map(([mood, count], index) => {
                    const percentage = Math.round((count / totalEntries) * 100);
                    const barWidth = Math.max((count / totalEntries) * 100, 8); // Minimum 8% width
                    
                    return (
                      <View key={mood} style={styles.moodBarRow}>
                        <View style={styles.moodBarInfo}>
                          <Text style={[styles.moodBarLabel, { color: colors.text }]} numberOfLines={1}>
                            {mood}
                          </Text>
                          <Text style={[styles.moodBarCount, { color: colors.textSecondary }]} numberOfLines={1}>
                            {count} ({percentage}%)
                          </Text>
                        </View>
                        <View style={[styles.moodBarBackground, { backgroundColor: colors.divider }]}>
                          <View
                            style={[
                              styles.moodBarFill,
                              {
                                width: `${barWidth}%`,
                                backgroundColor: getMoodColor(mood),
                              },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  });
                })()}
              </View>
            </View>
          )}

          {/* Recent Activity & Trends */}
          {entries.length > 0 && (
            <View style={[styles.trendsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.trendsTitle, { color: colors.text }]}>📊 Recent Trends</Text>
              <View style={styles.trendsGrid}>
                <View style={styles.trendItem}>
                  <Text style={[styles.trendLabel, { color: colors.textSecondary }]}>📅 This Week</Text>
                  <Text style={[styles.trendValue, { color: colors.text }]}>
                    {(() => {
                      const oneWeekAgo = new Date();
                      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                      const weekEntries = entries.filter(entry => new Date(entry.date) >= oneWeekAgo);
                      return weekEntries.length;
                    })()} entries
                  </Text>
                </View>
                
                <View style={styles.trendItem}>
                  <Text style={[styles.trendLabel, { color: colors.textSecondary }]}>⭐ Best Day</Text>
                  <Text style={[styles.trendValue, { color: colors.text }]}>
                    {(() => {
                      if (entries.length === 0) return 'N/A';
                      const bestEntry = entries.reduce((best, current) => 
                        current.moodLevel > best.moodLevel ? current : best
                      );
                      return bestEntry.mood;
                    })()}
                  </Text>
                </View>
                
                <View style={styles.trendItem}>
                  <Text style={[styles.trendLabel, { color: colors.textSecondary }]}>🏃‍♂️ Most Active</Text>
                  <Text style={[styles.trendValue, { color: colors.text }]}>
                    {(() => {
                      if (entries.length === 0) return 'N/A';
                      const activityCounts: { [key: string]: number } = {};
                      entries.forEach(entry => {
                        if (entry.activities && Array.isArray(entry.activities)) {
                          entry.activities.forEach(activity => {
                            if (activity) {
                              activityCounts[activity] = (activityCounts[activity] || 0) + 1;
                            }
                          });
                        }
                      });
                      const mostActive = Object.keys(activityCounts).reduce((a, b) => 
                        activityCounts[a] > activityCounts[b] ? a : b
                      );
                      return mostActive || 'N/A';
                    })()}
                  </Text>
                </View>
                
                <View style={styles.trendItem}>
                  <Text style={[styles.trendLabel, { color: colors.textSecondary }]}>😴 Avg Sleep</Text>
                  <Text style={[styles.trendValue, { color: colors.text }]}>
                    {(() => {
                      const sleepEntries = entries.filter(entry => entry.sleepHours);
                      if (sleepEntries.length === 0) return 'N/A';
                      const avgSleep = sleepEntries.reduce((sum, entry) => sum + entry.sleepHours!, 0) / sleepEntries.length;
                      return `${avgSleep.toFixed(1)}h`;
                    })()}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

      <View style={styles.filterContainer}>
          {renderFilterButton('all', '📚 All Time')}
          {renderFilterButton('week', '📅 This Week')}
          {renderFilterButton('month', '🗓️ This Month')}
        </View>

        {/* Quick Date Search */}
        <View style={styles.dateSearchContainer}>
          <TouchableOpacity
            style={[styles.dateSearchButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              // Show today's entry if it exists
              const today = new Date().toISOString().split('T')[0];
              const todayEntry = entries.find(entry => entry.date === today);
              if (todayEntry) {
                setSelectedEntry(todayEntry);
                setDetailModalVisible(true);
              } else {
                Alert.alert('No Entry Found', 'No entry found for today. Would you like to create one?');
              }
            }}
          >
            <Ionicons name="today-outline" size={20} color={colors.primary} />
            <Text style={[styles.dateSearchText, { color: colors.text }]}>📅 Today's Entry</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.dateSearchButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              // Show yesterday's entry if it exists
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = yesterday.toISOString().split('T')[0];
              const yesterdayEntry = entries.find(entry => entry.date === yesterdayStr);
              if (yesterdayEntry) {
                setSelectedEntry(yesterdayEntry);
                setDetailModalVisible(true);
              } else {
                Alert.alert('No Entry Found', 'No entry found for yesterday.');
              }
            }}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={[styles.dateSearchText, { color: colors.text }]}>📆 Yesterday's Entry</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Entries List */}
        <View style={styles.entriesHeaderContainer}>
          <Text style={[styles.entriesHeaderTitle, { color: colors.text }]}>📅 Daily Entries</Text>
          <Text style={[styles.entriesHeaderSubtitle, { color: colors.textSecondary }]}>
            {filteredEntries.length} entries found
          </Text>
      </View>

      {filteredEntries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No mood entries found
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
            Start tracking your mood to see your history here
          </Text>
        </View>
      ) : (
          <View style={styles.entriesListContainer}>
            {filteredEntries.map((item) => (
              <View key={item.id}>
                {renderEntry({ item })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Entry Detail Modal */}
      <DayEntryBrief
        visible={detailModalVisible}
        entry={selectedEntry}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedEntry(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 12,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  entryCard: {
    marginBottom: 15,
    padding: 18,
    borderRadius: 15,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 20,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryEmoji: {
    marginRight: 15,
  },
  entryInfo: {
    flex: 1,
  },
  entryDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  entryMood: {
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  entrySummary: {
    fontSize: 15,
    marginBottom: 10,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  entryJournal: {
    fontSize: 13,
    marginBottom: 10,
    fontStyle: 'italic',
    paddingLeft: 5,
  },
  activitiesContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  activitiesLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  quickStat: {
    alignItems: 'center',
    minWidth: 60,
  },
  quickStatLabel: {
    fontSize: 11,
    marginBottom: 4,
    textAlign: 'center',
  },
  quickStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  tapHintText: {
    marginLeft: 5,
    fontSize: 12,
    fontStyle: 'italic',
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
  dateSearchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
  },
  dateSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25,
    borderWidth: 1,
    minWidth: 140,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateSearchText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    padding: 18,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  moodDistributionContainer: {
    marginTop: 20,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  distributionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  moodBars: {
    paddingHorizontal: 5,
  },
  moodBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    height: 50,
    paddingVertical: 5,
  },
  moodBarInfo: {
    width: 85,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  moodBarLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 3,
    textAlign: 'right',
    lineHeight: 16,
  },
  moodBarCount: {
    fontSize: 11,
    textAlign: 'right',
    opacity: 0.8,
    lineHeight: 14,
  },
  moodBarBackground: {
    flex: 1,
    height: 26,
    borderRadius: 13,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  moodBarFill: {
    height: '100%',
    borderRadius: 13,
    minWidth: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  trendsContainer: {
    marginTop: 20,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  trendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 12,
  },
  trendItem: {
    width: '48%',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  trendLabel: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  trendValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '80%',
    padding: 25,
    borderRadius: 15,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 15,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  entriesHeaderContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  entriesHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  entriesHeaderSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  entriesListContainer: {
    paddingHorizontal: 20,
  },
}); 