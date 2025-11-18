import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Habit, HabitCompletion } from '../types';
import { 
  saveHabit, 
  getHabits, 
  updateHabit, 
  deleteHabit, 
  completeHabit, 
  getHabitCompletions 
} from '../utils/database';

const { width } = Dimensions.get('window');

const HabitTrackerScreen = () => {
  const { colors } = useTheme();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [habitName, setHabitName] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [habitCategory, setHabitCategory] = useState<'wellness' | 'productivity' | 'social' | 'learning' | 'fitness' | 'mindfulness'>('wellness');
  const [habitFrequency, setHabitFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [targetCount, setTargetCount] = useState('1');
  const [reminderTime, setReminderTime] = useState('');
  const [selectedColor, setSelectedColor] = useState('#667eea');

  const categories = [
    { key: 'wellness', label: 'Wellness', icon: 'heart', color: '#FF6B6B' },
    { key: 'productivity', label: 'Productivity', icon: 'checkmark-circle', color: '#4ECDC4' },
    { key: 'social', label: 'Social', icon: 'people', color: '#45B7D1' },
    { key: 'learning', label: 'Learning', icon: 'book', color: '#96CEB4' },
    { key: 'fitness', label: 'Fitness', icon: 'fitness', color: '#FFEAA7' },
    { key: 'mindfulness', label: 'Mindfulness', icon: 'leaf', color: '#DDA0DD' },
  ];

  const colorOptions = [
    '#667eea', '#FF6B6B', '#4ECDC4', '#45B7D1', 
    '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'
  ];

  useEffect(() => {
    loadHabits();
    loadCompletions();
  }, []);

  const loadHabits = async () => {
    try {
      const savedHabits = await getHabits();
      setHabits(savedHabits);
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

  const loadCompletions = async () => {
    try {
      const habitCompletions = await getHabitCompletions();
      setCompletions(habitCompletions);
    } catch (error) {
      console.error('Error loading completions:', error);
    }
  };

  const handleAddHabit = () => {
    setEditingHabit(null);
    setHabitName('');
    setHabitDescription('');
    setHabitCategory('wellness');
    setHabitFrequency('daily');
    setTargetCount('1');
    setReminderTime('');
    setSelectedColor('#667eea');
    setModalVisible(true);
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setHabitName(habit.name);
    setHabitDescription(habit.description);
    setHabitCategory(habit.category);
    setHabitFrequency(habit.frequency);
    setTargetCount(habit.targetCount.toString());
    setReminderTime(habit.reminderTime || '');
    setSelectedColor(habit.color);
    setModalVisible(true);
  };

  const handleSaveHabit = async () => {
    if (!habitName.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    if (!targetCount.trim() || isNaN(Number(targetCount)) || Number(targetCount) < 1) {
      Alert.alert('Error', 'Please enter a valid target count');
      return;
    }

    try {
      const newHabit: Habit = {
        id: editingHabit?.id || Date.now().toString(),
        name: habitName.trim(),
        description: habitDescription.trim(),
        category: habitCategory,
        frequency: habitFrequency,
        targetCount: Number(targetCount),
        currentStreak: editingHabit?.currentStreak || 0,
        longestStreak: editingHabit?.longestStreak || 0,
        totalCompletions: editingHabit?.totalCompletions || 0,
        isActive: true,
        reminderTime: reminderTime.trim() || undefined,
        color: selectedColor,
        icon: categories.find(c => c.key === habitCategory)?.icon || 'star',
        createdAt: editingHabit?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingHabit) {
        await updateHabit(newHabit);
      } else {
        await saveHabit(newHabit);
      }

      setModalVisible(false);
      loadHabits();
    } catch (error) {
      console.error('Error saving habit:', error);
      Alert.alert('Error', 'Failed to save habit. Please try again.');
    }
  };

  const handleToggleHabit = async (habit: Habit) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayCompletion = completions.find(
        c => c.habitId === habit.id && c.date === today
      );

      if (todayCompletion) {
        // Already completed today, mark as incomplete
        await completeHabit(habit.id, today, false);
        // Update streak
        const updatedHabit = {
          ...habit,
          currentStreak: Math.max(0, habit.currentStreak - 1),
          totalCompletions: Math.max(0, habit.totalCompletions - 1),
        };
        await updateHabit(updatedHabit);
      } else {
        // Mark as completed
        await completeHabit(habit.id, today, true);
        // Update streak
        const newStreak = habit.currentStreak + 1;
        const updatedHabit = {
          ...habit,
          currentStreak: newStreak,
          longestStreak: Math.max(habit.longestStreak, newStreak),
          totalCompletions: habit.totalCompletions + 1,
        };
        await updateHabit(updatedHabit);
      }

      loadHabits();
      loadCompletions();
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  const handleDeleteHabit = (habit: Habit) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabit(habit.id);
              loadHabits();
            } catch (error) {
              console.error('Error deleting habit:', error);
              Alert.alert('Error', 'Failed to delete habit. Please try again.');
            }
          },
        },
      ]
    );
  };

  const isHabitCompletedToday = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return completions.some(
      c => c.habitId === habitId && c.date === today && c.completed
    );
  };

  const getStreakText = (habit: Habit) => {
    if (habit.currentStreak === 0) return 'No streak yet';
    if (habit.currentStreak === 1) return '1 day streak';
    return `${habit.currentStreak} day streak`;
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.key === category);
    return cat?.icon || 'star';
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.key === category);
    return cat?.color || colors.primary;
  };

  const getTotalStreak = () => {
    return habits.reduce((sum, habit) => sum + habit.currentStreak, 0);
  };

  const getTotalCompletions = () => {
    return habits.reduce((sum, habit) => sum + habit.totalCompletions, 0);
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
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginHorizontal: 20,
      marginBottom: 20,
    },
    statItem: {
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: 15,
      borderRadius: 10,
      flex: 1,
      marginHorizontal: 5,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
      textAlign: 'center',
    },
    addButton: {
      position: 'absolute',
      bottom: 30,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    habitItem: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      marginBottom: 15,
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    habitHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    habitIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    habitContent: {
      flex: 1,
    },
    habitName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    habitDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    habitStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    habitStat: {
      alignItems: 'center',
    },
    habitStatValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    habitStatLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    habitActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
    },
    habitToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    habitToggleText: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 6,
    },
    actionButtons: {
      flexDirection: 'row',
    },
    actionButton: {
      padding: 8,
      marginLeft: 8,
    },
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
    inputContainer: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    textInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.background,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    categoryContainer: {
      marginBottom: 16,
    },
    categoryLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    categoryButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
    },
    categoryButtonText: {
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 4,
    },
    colorContainer: {
      marginBottom: 16,
    },
    colorLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    colorButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    colorButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    colorButtonSelected: {
      borderColor: colors.text,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      marginRight: 10,
    },
    cancelButtonText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    saveButton: {
      flex: 1,
      borderRadius: 25,
      overflow: 'hidden',
      marginLeft: 10,
    },
    saveButtonGradient: {
      paddingVertical: 12,
      alignItems: 'center',
    },
    saveButtonText: {
      fontSize: 16,
      color: 'white',
      fontWeight: 'bold',
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Habit Tracker</Text>
        <Text style={styles.headerSubtitle}>Build positive habits, one day at a time</Text>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{habits.length}</Text>
          <Text style={styles.statLabel}>Active Habits</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{getTotalStreak()}</Text>
          <Text style={styles.statLabel}>Total Streak</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{getTotalCompletions()}</Text>
          <Text style={styles.statLabel}>Completions</Text>
        </View>
      </View>

      {/* Habits List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No Habits Yet</Text>
            <Text style={styles.emptyText}>
              Start building positive habits by adding your first one. Track your progress and build streaks!
            </Text>
          </View>
        ) : (
          habits.map((habit) => {
            const isCompleted = isHabitCompletedToday(habit.id);
            return (
              <View 
                key={habit.id} 
                style={[
                  styles.habitItem,
                  { borderLeftColor: habit.color }
                ]}
              >
                <View style={styles.habitHeader}>
                  <View 
                    style={[
                      styles.habitIcon,
                      { backgroundColor: habit.color + '20' }
                    ]}
                  >
                    <Ionicons 
                      name={getCategoryIcon(habit.category) as any} 
                      size={20} 
                      color={habit.color} 
                    />
                  </View>
                  <View style={styles.habitContent}>
                    <Text style={styles.habitName}>{habit.name}</Text>
                    <Text style={styles.habitDescription}>{habit.description}</Text>
                  </View>
                </View>
                
                <View style={styles.habitStats}>
                  <View style={styles.habitStat}>
                    <Text style={styles.habitStatValue}>{habit.currentStreak}</Text>
                    <Text style={styles.habitStatLabel}>Current Streak</Text>
                  </View>
                  <View style={styles.habitStat}>
                    <Text style={styles.habitStatValue}>{habit.longestStreak}</Text>
                    <Text style={styles.habitStatLabel}>Best Streak</Text>
                  </View>
                  <View style={styles.habitStat}>
                    <Text style={styles.habitStatValue}>{habit.totalCompletions}</Text>
                    <Text style={styles.habitStatLabel}>Total</Text>
                  </View>
                </View>
                
                <View style={styles.habitActions}>
                  <TouchableOpacity
                    style={[
                      styles.habitToggle,
                      { backgroundColor: isCompleted ? colors.success + '20' : colors.surface }
                    ]}
                    onPress={() => handleToggleHabit(habit)}
                  >
                    <Ionicons 
                      name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'} 
                      size={20} 
                      color={isCompleted ? colors.success : colors.textSecondary} 
                    />
                    <Text 
                      style={[
                        styles.habitToggleText,
                        { color: isCompleted ? colors.success : colors.textSecondary }
                      ]}
                    >
                      {isCompleted ? 'Completed' : 'Mark Complete'}
                    </Text>
                  </TouchableOpacity>
                  
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditHabit(habit)}
                    >
                      <Ionicons name="create-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteHabit(habit)}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={handleAddHabit}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Add/Edit Habit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingHabit ? 'Edit Habit' : 'Add New Habit'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Habit Name *</Text>
              <TextInput
                style={styles.textInput}
                value={habitName}
                onChangeText={setHabitName}
                placeholder="Enter habit name"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={habitDescription}
                onChangeText={setHabitDescription}
                placeholder="Describe your habit (optional)"
                placeholderTextColor={colors.textTertiary}
                multiline
              />
            </View>
            
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryLabel}>Category</Text>
              <View style={styles.categoryButtons}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.key}
                    style={[
                      styles.categoryButton,
                      {
                        borderColor: habitCategory === category.key ? category.color : colors.border,
                        backgroundColor: habitCategory === category.key ? category.color + '20' : 'transparent',
                      }
                    ]}
                    onPress={() => setHabitCategory(category.key as any)}
                  >
                    <Ionicons 
                      name={category.icon as any} 
                      size={16} 
                      color={habitCategory === category.key ? category.color : colors.textSecondary} 
                    />
                    <Text 
                      style={[
                        styles.categoryButtonText,
                        { color: habitCategory === category.key ? category.color : colors.textSecondary }
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.colorContainer}>
              <Text style={styles.colorLabel}>Color</Text>
              <View style={styles.colorButtons}>
                {colorOptions.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorButtonSelected
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Target Count</Text>
              <TextInput
                style={styles.textInput}
                value={targetCount}
                onChangeText={setTargetCount}
                placeholder="1"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveHabit}
              >
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Save Habit</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default HabitTrackerScreen;
