import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import { MonthlyStats, MoodEntry } from '../types';

const getMoodEmoji = (mood: string) => {
  const moodEmojis: { [key: string]: string } = {
    'excellent': '😄',
    'good': '🙂',
    'neutral': '😐',
    'bad': '😔',
    'terrible': '😢',
    'Happy': '😊',
    'Sad': '😔',
    'Angry': '😡',
    'Anxious': '😰',
    'Tired': '😴',
    'Calm': '😌',
    'Confused': '🤔',
    'Frustrated': '😤',
    'Loved': '🥰',
    'Confident': '😎',
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
    'Happy': '#4CAF50',
    'Sad': '#2196F3',
    'Angry': '#F44336',
    'Anxious': '#FF9800',
    'Tired': '#9C27B0',
    'Calm': '#00BCD4',
    'Confused': '#607D8B',
    'Frustrated': '#795548',
    'Loved': '#E91E63',
    'Confident': '#3F51B5',
  };
  return moodColors[mood] || '#6B7280';
};

export default function MonthlyReview() {
  const { moodEntries } = useAppStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonthlyStats();
  }, [currentMonth, moodEntries]);

  const loadMonthlyStats = () => {
    try {
      setLoading(true);
      const monthString = currentMonth.toISOString().slice(0, 7); // YYYY-MM format
      const monthlyStats = calculateMonthlyStats(monthString);
      setStats(monthlyStats);
    } catch (error) {
      console.error('Error loading monthly stats:', error);
    } finally {
      setLoading(false);
    }
  };

    const calculateMonthlyStats = (monthString: string): MonthlyStats => {
    const monthEntries = moodEntries.filter(entry =>
      entry.date.startsWith(monthString)
    );

    const totalEntries = monthEntries.length;
    const averageMood = totalEntries > 0 
      ? monthEntries.reduce((sum, entry) => sum + (entry.moodLevel || 5), 0) / totalEntries 
      : 0;

    // Calculate mood distribution
    const moodDistribution: { [key: string]: number } = {};
    monthEntries.forEach(entry => {
      moodDistribution[entry.mood] = (moodDistribution[entry.mood] || 0) + 1;
    });

    // Calculate top activities
    const activityCount: { [key: string]: number } = {};
    monthEntries.forEach(entry => {
      entry.activities?.forEach(activity => {
        activityCount[activity] = (activityCount[activity] || 0) + 1;
      });
    });

    const topActivities = Object.entries(activityCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Calculate insights
    const insights = [];
    if (averageMood >= 7) {
      insights.push('You had a very positive month! Keep up the great work.');
    } else if (averageMood >= 5) {
      insights.push('Your mood was generally stable this month.');
    } else {
      insights.push('This month was challenging. Remember, it\'s okay to seek support.');
    }

    if (totalEntries >= 20) {
      insights.push('Great consistency in tracking your mood!');
    } else if (totalEntries >= 10) {
      insights.push('Good tracking habits. Try to log more frequently for better insights.');
    } else {
      insights.push('Consider tracking more frequently to get better insights.');
    }

    return {
      month: monthString,
      totalEntries,
      averageMood: Math.round(averageMood * 10) / 10,
      moodDistribution,
      topActivities,
      insights,
      bestDay: monthEntries.length > 0 ? monthEntries[0] : null,
      worstDay: monthEntries.length > 0 ? monthEntries[monthEntries.length - 1] : null,
    };
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

  const renderStatCard = (title: string, value: string | number, icon: string, color?: string) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <span 
          className="text-3xl"
          style={{ color: color || '#3B82F6' }}
        >
          {icon}
        </span>
      </div>
    </motion.div>
  );

  const renderMoodDistribution = () => {
    if (!stats?.moodDistribution) return null;

    const totalEntries = stats.totalEntries;
    const moodEntries = Object.entries(stats.moodDistribution);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mood Distribution</h3>
        <div className="space-y-3">
          {moodEntries.map(([mood, count]) => {
            const percentage = totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0;
            return (
              <div key={mood} className="flex items-center">
                <span className="text-2xl mr-3">{getMoodEmoji(mood)}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{mood}</span>
                    <span className="text-gray-600 dark:text-gray-400">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: getMoodColor(mood)
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  const renderTopActivities = () => {
    if (!stats?.topActivities || stats.topActivities.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Activities</h3>
        <div className="space-y-3">
          {stats.topActivities.map((activity, index) => (
            <div key={activity.name} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-lg font-bold text-blue-500 mr-3">#{index + 1}</span>
                <span className="text-gray-700 dark:text-gray-300">{activity.name}</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">{activity.count} times</span>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderInsights = () => {
    if (!stats?.insights || stats.insights.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Monthly Insights</h3>
        <div className="space-y-2">
          {stats.insights.map((insight, index) => (
            <div key={index} className="flex items-start">
              <span className="text-white mr-3 mt-1">💡</span>
              <span className="text-white">{insight}</span>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading monthly review...</p>
        </div>
      </div>
    );
  }

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
              Monthly Review
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => changeMonth('prev')}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                ←
              </button>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => changeMonth('next')}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                →
              </button>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Review your mood patterns and insights for {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {renderStatCard('Total Entries', stats?.totalEntries || 0, '📊')}
          {renderStatCard('Average Mood', stats?.averageMood || 0, '😊')}
          {renderStatCard('Tracking Days', Math.ceil((stats?.totalEntries || 0) / 3), '📅')}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {renderMoodDistribution()}
            {renderTopActivities()}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {renderInsights()}
            
            {/* Best and Worst Days */}
            {(stats?.bestDay || stats?.worstDay) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="space-y-4"
              >
                {stats.bestDay && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Best Day</h3>
                    <div className="flex items-center">
                      <span className="text-3xl mr-3">{getMoodEmoji(stats.bestDay.mood)}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{stats.bestDay.mood}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(stats.bestDay.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {stats.worstDay && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Challenging Day</h3>
                    <div className="flex items-center">
                      <span className="text-3xl mr-3">{getMoodEmoji(stats.worstDay.mood)}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{stats.worstDay.mood}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(stats.worstDay.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* No Data Message */}
        {(!stats || stats.totalEntries === 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No data for this month
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start tracking your mood to see insights and patterns.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
} 