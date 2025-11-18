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
import { Activity, getActivities, saveActivity, updateActivity, deleteActivity } from '../utils/database';

const ActivityScreen = () => {
  const { colors } = useTheme();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activityName, setActivityName] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [activityCategory, setActivityCategory] = useState<'exercise' | 'mindfulness' | 'social' | 'creative' | 'self-care'>('exercise');
  const [activityDuration, setActivityDuration] = useState('');
  const [activityMoodBoost, setActivityMoodBoost] = useState('');

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const savedActivities = await getActivities();
      setActivities(savedActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const handleAddActivity = () => {
    setEditingActivity(null);
    setActivityName('');
    setActivityDescription('');
    setActivityCategory('exercise');
    setActivityDuration('');
    setActivityMoodBoost('');
    setModalVisible(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setActivityName(activity.name);
    setActivityDescription(activity.description);
    setActivityCategory(activity.category);
    setActivityDuration(activity.duration.toString());
    setActivityMoodBoost(activity.moodBoost.toString());
    setModalVisible(true);
  };

  const handleSaveActivity = async () => {
    if (!activityName.trim()) {
      Alert.alert('Error', 'Please enter an activity name');
      return;
    }

    if (!activityDuration.trim() || isNaN(Number(activityDuration))) {
      Alert.alert('Error', 'Please enter a valid duration in minutes');
      return;
    }

    if (!activityMoodBoost.trim() || isNaN(Number(activityMoodBoost))) {
      Alert.alert('Error', 'Please enter a valid mood boost value (1-10)');
      return;
    }

    const moodBoost = Number(activityMoodBoost);
    if (moodBoost < 1 || moodBoost > 10) {
      Alert.alert('Error', 'Mood boost must be between 1 and 10');
      return;
    }

    try {
      const newActivity: Activity = {
        id: editingActivity?.id || Date.now().toString(),
        name: activityName.trim(),
        description: activityDescription.trim(),
        category: activityCategory,
        duration: Number(activityDuration),
        moodBoost: moodBoost,
      };

      if (editingActivity) {
        await updateActivity(newActivity);
      } else {
        await saveActivity(newActivity);
      }

      setModalVisible(false);
      loadActivities();
    } catch (error) {
      console.error('Error saving activity:', error);
      Alert.alert('Error', 'Failed to save activity. Please try again.');
    }
  };

  const handleDeleteActivity = (activity: Activity) => {
    Alert.alert(
      'Delete Activity',
      `Are you sure you want to delete "${activity.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteActivity(activity.id);
              loadActivities();
            } catch (error) {
              console.error('Error deleting activity:', error);
              Alert.alert('Error', 'Failed to delete activity. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'exercise': return 'fitness';
      case 'mindfulness': return 'leaf';
      case 'social': return 'people';
      case 'creative': return 'brush';
      case 'self-care': return 'heart';
      default: return 'star';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'exercise': return '#FF6B6B';
      case 'mindfulness': return '#4ECDC4';
      case 'social': return '#45B7D1';
      case 'creative': return '#96CEB4';
      case 'self-care': return '#FFEAA7';
      default: return colors.primary;
    }
  };

  const categories = [
    { key: 'exercise', label: 'Exercise', icon: 'fitness' },
    { key: 'mindfulness', label: 'Mindfulness', icon: 'leaf' },
    { key: 'social', label: 'Social', icon: 'people' },
    { key: 'creative', label: 'Creative', icon: 'brush' },
    { key: 'self-care', label: 'Self-Care', icon: 'heart' },
  ];

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
    activityItem: {
      backgroundColor: colors.card,
      marginHorizontal: 20,
      marginBottom: 15,
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
    },
    activityHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    activityIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    activityContent: {
      flex: 1,
    },
    activityName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    activityDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    activityDetails: {
      flexDirection: 'row',
      marginTop: 8,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
    },
    detailText: {
      fontSize: 12,
      color: colors.textTertiary,
      marginLeft: 4,
    },
    activityActions: {
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
        <Text style={styles.headerTitle}>Activities</Text>
        <Text style={styles.headerSubtitle}>Track your wellness activities</Text>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{activities.length}</Text>
          <Text style={styles.statLabel}>Total Activities</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {activities.length > 0 
              ? Math.round(activities.reduce((sum, activity) => sum + activity.moodBoost, 0) / activities.length)
              : 0
            }
          </Text>
          <Text style={styles.statLabel}>Avg Mood Boost</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {activities.length > 0 
              ? Math.round(activities.reduce((sum, activity) => sum + activity.duration, 0) / activities.length)
              : 0
            }
          </Text>
          <Text style={styles.statLabel}>Avg Duration (min)</Text>
        </View>
      </View>

      {/* Activities List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {activities.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="fitness-outline" style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No Activities Yet</Text>
            <Text style={styles.emptyText}>
              Start by adding your favorite wellness activities. Track how they improve your mood and well-being.
            </Text>
          </View>
        ) : (
          activities.map((activity) => (
            <View 
              key={activity.id} 
              style={[
                styles.activityItem,
                { borderLeftColor: getCategoryColor(activity.category) }
              ]}
            >
              <View style={styles.activityHeader}>
                <View 
                  style={[
                    styles.activityIcon,
                    { backgroundColor: getCategoryColor(activity.category) }
                  ]}
                >
                  <Ionicons 
                    name={getCategoryIcon(activity.category) as any} 
                    size={20} 
                    color="white" 
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityName}>{activity.name}</Text>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                </View>
              </View>
              
              <View style={styles.activityDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
                  <Text style={styles.detailText}>{activity.duration} min</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="happy-outline" size={14} color={colors.textTertiary} />
                  <Text style={styles.detailText}>+{activity.moodBoost} mood</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="pricetag-outline" size={14} color={colors.textTertiary} />
                  <Text style={styles.detailText}>{activity.category}</Text>
                </View>
              </View>
              
              <View style={styles.activityActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditActivity(activity)}
                >
                  <Ionicons name="create-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteActivity(activity)}
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
        onPress={handleAddActivity}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Add/Edit Activity Modal */}
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
                {editingActivity ? 'Edit Activity' : 'Add New Activity'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Activity Name *</Text>
              <TextInput
                style={styles.textInput}
                value={activityName}
                onChangeText={setActivityName}
                placeholder="Enter activity name"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={activityDescription}
                onChangeText={setActivityDescription}
                placeholder="Describe the activity (optional)"
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
                        borderColor: activityCategory === category.key ? getCategoryColor(category.key) : colors.border,
                        backgroundColor: activityCategory === category.key ? getCategoryColor(category.key) + '20' : 'transparent',
                      }
                    ]}
                    onPress={() => setActivityCategory(category.key as any)}
                  >
                    <Ionicons 
                      name={category.icon as any} 
                      size={16} 
                      color={activityCategory === category.key ? getCategoryColor(category.key) : colors.textSecondary} 
                    />
                    <Text 
                      style={[
                        styles.categoryButtonText,
                        { color: activityCategory === category.key ? getCategoryColor(category.key) : colors.textSecondary }
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Duration (minutes) *</Text>
              <TextInput
                style={styles.textInput}
                value={activityDuration}
                onChangeText={setActivityDuration}
                placeholder="e.g., 30"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mood Boost (1-10) *</Text>
              <TextInput
                style={styles.textInput}
                value={activityMoodBoost}
                onChangeText={setActivityMoodBoost}
                placeholder="e.g., 7"
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
                onPress={handleSaveActivity}
              >
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Save Activity</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default ActivityScreen; 