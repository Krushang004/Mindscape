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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { saveGoal, getGoals, updateGoal, deleteGoal } from '../utils/database';
import { Goal } from '../types';

const GoalScreen = () => {
  const { colors } = useTheme();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      console.log('Loading goals...');
      const savedGoals = await getGoals();
      console.log('Loaded goals:', savedGoals);
      setGoals(savedGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const handleAddGoal = () => {
    setEditingGoal(null);
    setGoalTitle('');
    setGoalDescription('');
    setGoalDeadline('');
    setModalVisible(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalTitle(goal.title);
    setGoalDescription(goal.description);
    setGoalDeadline(goal.deadline);
    setModalVisible(true);
  };

  const handleSaveGoal = async () => {
    if (!goalTitle.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    try {
      console.log('Saving goal with title:', goalTitle);
      const newGoal: Goal = {
        id: editingGoal?.id || Date.now().toString(),
        title: goalTitle.trim(),
        description: goalDescription.trim(),
        deadline: goalDeadline.trim(),
        completed: editingGoal?.completed || false,
        createdAt: editingGoal?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('Goal object to save:', newGoal);

      if (editingGoal) {
        console.log('Updating existing goal...');
        await updateGoal(newGoal);
      } else {
        console.log('Creating new goal...');
        await saveGoal(newGoal);
      }

      console.log('Goal saved successfully');
      setModalVisible(false);
      await loadGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      Alert.alert('Error', 'Failed to save goal. Please try again.');
    }
  };

  const handleToggleGoal = async (goal: Goal) => {
    try {
      const updatedGoal = { ...goal, completed: !goal.completed, updatedAt: new Date().toISOString() };
      await updateGoal(updatedGoal);
      loadGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleDeleteGoal = (goal: Goal) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGoal(goal.id);
              loadGoals();
            } catch (error) {
              console.error('Error deleting goal:', error);
              Alert.alert('Error', 'Failed to delete goal. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getProgressPercentage = () => {
    if (goals.length === 0) return 0;
    const completedGoals = goals.filter(goal => goal.completed).length;
    return Math.round((completedGoals / goals.length) * 100);
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
    progressContainer: {
      marginHorizontal: 20,
      marginBottom: 20,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    progressText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 8,
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
    goalItem: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      marginBottom: 15,
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
    },
    goalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    goalCheckbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    goalTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    goalDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 36,
      marginBottom: 8,
    },
    goalDeadline: {
      fontSize: 12,
      color: colors.textTertiary,
      marginLeft: 36,
    },
    goalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 8,
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
      height: 100,
      textAlignVertical: 'top',
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
        <Text style={styles.headerTitle}>Goals</Text>
        <Text style={styles.headerSubtitle}>Track your mental health goals</Text>
      </LinearGradient>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${getProgressPercentage()}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {goals.filter(goal => goal.completed).length} of {goals.length} goals completed ({getProgressPercentage()}%)
        </Text>
      </View>

      {/* Goals List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="flag-outline" style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No Goals Yet</Text>
            <Text style={styles.emptyText}>
              Start by adding your first mental health goal. Set achievable targets to improve your well-being.
            </Text>
          </View>
        ) : (
          goals.map((goal) => (
            <View 
              key={goal.id} 
              style={[
                styles.goalItem,
                { 
                  borderLeftColor: goal.completed ? colors.success : colors.primary,
                  opacity: goal.completed ? 0.7 : 1
                }
              ]}
            >
              <View style={styles.goalHeader}>
                <TouchableOpacity
                  style={[
                    styles.goalCheckbox,
                    {
                      borderColor: goal.completed ? colors.success : colors.border,
                      backgroundColor: goal.completed ? colors.success : 'transparent',
                    }
                  ]}
                  onPress={() => handleToggleGoal(goal)}
                >
                  {goal.completed && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </TouchableOpacity>
                <Text 
                  style={[
                    styles.goalTitle,
                    { textDecorationLine: goal.completed ? 'line-through' : 'none' }
                  ]}
                >
                  {goal.title}
                </Text>
              </View>
              
              {goal.description && (
                <Text 
                  style={[
                    styles.goalDescription,
                    { textDecorationLine: goal.completed ? 'line-through' : 'none' }
                  ]}
                >
                  {goal.description}
                </Text>
              )}
              
              {goal.deadline && (
                <Text style={styles.goalDeadline}>
                  Deadline: {goal.deadline}
                </Text>
              )}
              
              <View style={styles.goalActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditGoal(goal)}
                >
                  <Ionicons name="create-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteGoal(goal)}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={handleAddGoal}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Add/Edit Goal Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingGoal ? 'Edit Goal' : 'Add New Goal'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Goal Title *</Text>
              <TextInput
                style={styles.textInput}
                value={goalTitle}
                onChangeText={setGoalTitle}
                placeholder="Enter your goal title"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={goalDescription}
                onChangeText={setGoalDescription}
                placeholder="Describe your goal (optional)"
                placeholderTextColor={colors.textTertiary}
                multiline
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Deadline</Text>
              <TextInput
                style={styles.textInput}
                value={goalDeadline}
                onChangeText={setGoalDeadline}
                placeholder="e.g., December 31, 2024"
                placeholderTextColor={colors.textTertiary}
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
                onPress={handleSaveGoal}
              >
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Save Goal</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default GoalScreen; 