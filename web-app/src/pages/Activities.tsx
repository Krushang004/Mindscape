import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';
import { Activity } from '../types';

export default function Activities() {
  const { activities, addActivity, updateActivity, deleteActivity } = useAppStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activityName, setActivityName] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [activityCategory, setActivityCategory] = useState<'exercise' | 'mindfulness' | 'social' | 'creative' | 'self-care'>('exercise');
  const [activityDuration, setActivityDuration] = useState(30);
  const [activityMoodBoost, setActivityMoodBoost] = useState(5);

  const categories = [
    { id: 'exercise', name: 'Exercise', icon: '💪', color: '#10B981', description: 'Physical activities' },
    { id: 'mindfulness', name: 'Mindfulness', icon: '🧘', color: '#3B82F6', description: 'Meditation and relaxation' },
    { id: 'social', name: 'Social', icon: '👥', color: '#8B5CF6', description: 'Connecting with others' },
    { id: 'creative', name: 'Creative', icon: '🎨', color: '#F59E0B', description: 'Art and creative expression' },
    { id: 'self-care', name: 'Self-Care', icon: '💆', color: '#EF4444', description: 'Personal well-being' },
  ];

  const handleAddActivity = () => {
    setEditingActivity(null);
    setActivityName('');
    setActivityDescription('');
    setActivityCategory('exercise');
    setActivityDuration(30);
    setActivityMoodBoost(5);
    setModalVisible(true);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setActivityName(activity.name);
    setActivityDescription(activity.description);
    setActivityCategory(activity.category);
    setActivityDuration(activity.duration);
    setActivityMoodBoost(activity.moodBoost);
    setModalVisible(true);
  };

  const handleSaveActivity = () => {
    if (!activityName.trim()) {
      alert('Please enter an activity name');
      return;
    }

    const newActivity: Activity = {
      id: editingActivity?.id || Date.now().toString(),
      name: activityName.trim(),
      description: activityDescription.trim(),
      category: activityCategory,
      duration: activityDuration,
      moodBoost: activityMoodBoost,
      icon: getCategoryIcon(activityCategory),
    };

    if (editingActivity) {
      updateActivity(editingActivity.id, { ...newActivity });
    } else {
      addActivity(newActivity);
    }

    setModalVisible(false);
  };

  const handleDeleteActivity = (activity: Activity) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      deleteActivity(activity.id);
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || '📋';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6B7280';
  };

  const getMoodBoostColor = (boost: number) => {
    if (boost >= 8) return '#10B981';
    if (boost >= 6) return '#F59E0B';
    if (boost >= 4) return '#EF4444';
    return '#6B7280';
  };

  const getMoodBoostText = (boost: number) => {
    if (boost >= 8) return 'Excellent';
    if (boost >= 6) return 'Good';
    if (boost >= 4) return 'Fair';
    return 'Low';
  };

  const renderActivityCard = (activity: Activity) => {
    return (
      <motion.div
        key={activity.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <span className="text-3xl mr-4">{activity.icon || getCategoryIcon(activity.category)}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {activity.name}
              </h3>
              <span
                className="px-2 py-1 text-xs font-medium rounded-full"
                style={{ backgroundColor: getCategoryColor(activity.category) + '20', color: getCategoryColor(activity.category) }}
              >
                {categories.find(c => c.id === activity.category)?.name}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEditActivity(activity)}
              className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              ✏️
            </button>
            <button
              onClick={() => handleDeleteActivity(activity)}
              className="p-2 rounded-lg bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            >
              🗑️
            </button>
          </div>
        </div>

        {activity.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">{activity.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <span className="text-gray-500 dark:text-gray-400 mr-2">⏱️</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {activity.duration} minutes
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 dark:text-gray-400 mr-2">😊</span>
            <span 
              className="text-sm font-medium"
              style={{ color: getMoodBoostColor(activity.moodBoost) }}
            >
              {getMoodBoostText(activity.moodBoost)} ({activity.moodBoost}/10)
            </span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Mood Boost</span>
            <span>{activity.moodBoost}/10</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(activity.moodBoost / 10) * 100}%`,
                backgroundColor: getMoodBoostColor(activity.moodBoost)
              }}
            />
          </div>
        </div>
      </motion.div>
    );
  };

  const getCategoryStats = () => {
    const stats = categories.map(category => {
      const categoryActivities = activities.filter(a => a.category === category.id);
      const avgMoodBoost = categoryActivities.length > 0
        ? categoryActivities.reduce((sum, a) => sum + a.moodBoost, 0) / categoryActivities.length
        : 0;
      
      return {
        ...category,
        count: categoryActivities.length,
        avgMoodBoost: Math.round(avgMoodBoost * 10) / 10
      };
    });

    return stats;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Activities & Mood Boosters
            </h1>
            <button
              onClick={handleAddActivity}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <span className="mr-2">+</span>
              Add Activity
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Track activities that boost your mood and mental well-being
          </p>
        </motion.div>

        {/* Category Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        >
          {getCategoryStats().map((stat) => (
            <div
              key={stat.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{stat.icon}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stat.name}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.count}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Avg boost: {stat.avgMoodBoost}/10
              </div>
            </div>
          ))}
        </motion.div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {activities.map(renderActivityCard)}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {activities.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No activities yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start by adding activities that boost your mood
            </p>
            <button
              onClick={handleAddActivity}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Activity
            </button>
          </motion.div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {modalVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setModalVisible(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {editingActivity ? 'Edit Activity' : 'Add New Activity'}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Activity Name *
                    </label>
                    <input
                      type="text"
                      value={activityName}
                      onChange={(e) => setActivityName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter activity name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={activityDescription}
                      onChange={(e) => setActivityDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Describe the activity"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={activityCategory}
                      onChange={(e) => setActivityCategory(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name} - {category.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={activityDuration}
                      onChange={(e) => setActivityDuration(parseInt(e.target.value) || 30)}
                      min="1"
                      max="480"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mood Boost (1-10)
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        value={activityMoodBoost}
                        onChange={(e) => setActivityMoodBoost(parseInt(e.target.value))}
                        min="1"
                        max="10"
                        className="flex-1"
                      />
                      <span className="text-lg font-semibold text-gray-900 dark:text-white min-w-[2rem]">
                        {activityMoodBoost}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setModalVisible(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveActivity}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingActivity ? 'Update' : 'Save'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 