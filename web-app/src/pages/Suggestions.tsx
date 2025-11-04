import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import { MoodSuggestion, Activity } from '../types';

// Mood suggestions data
const MOOD_SUGGESTIONS: MoodSuggestion[] = [
  {
    mood: 'Happy',
    suggestions: [
      'Share your joy with someone you care about',
      'Take a moment to appreciate this feeling',
      'Do something creative to express your happiness',
      'Go for a walk and enjoy the good weather',
      'Write down what made you happy today',
    ],
    activities: ['Walking', 'Drawing', 'Call a friend', 'Gratitude practice'],
    affirmations: [
      'I deserve to feel happy',
      'My joy is contagious and helps others',
      'I am grateful for this moment of happiness',
    ],
  },
  {
    mood: 'Sad',
    suggestions: [
      'Be gentle with yourself today',
      'Talk to a friend or family member',
      'Do something that usually brings you comfort',
      'Consider writing about your feelings',
      'Take a warm bath or shower',
      'Listen to music that matches your mood',
    ],
    activities: ['Warm bath', 'Journaling', 'Call a friend', 'Reading'],
    affirmations: [
      'It\'s okay to feel sad sometimes',
      'This feeling will pass',
      'I am strong enough to get through this',
    ],
  },
  {
    mood: 'Angry',
    suggestions: [
      'Take deep breaths and count to 10',
      'Go for a walk to cool down',
      'Write down what\'s bothering you',
      'Listen to calming music',
      'Try some physical exercise to release tension',
      'Step away from the situation for a moment',
    ],
    activities: ['Walking', 'Yoga', 'Deep breathing', 'Journaling'],
    affirmations: [
      'I can control my reactions',
      'My anger doesn\'t define me',
      'I choose to respond with calmness',
    ],
  },
  {
    mood: 'Anxious',
    suggestions: [
      'Practice deep breathing exercises',
      'Focus on what you can control right now',
      'Try grounding techniques (5-4-3-2-1 method)',
      'Limit caffeine and take breaks',
      'Talk to someone you trust about your worries',
      'Write down your concerns',
    ],
    activities: ['Meditation', 'Deep breathing', 'Yoga', 'Journaling'],
    affirmations: [
      'I am safe in this moment',
      'I can handle whatever comes my way',
      'My anxiety doesn\'t control me',
    ],
  },
  {
    mood: 'Tired',
    suggestions: [
      'Get some rest if possible',
      'Take short breaks throughout the day',
      'Stay hydrated and eat nutritious food',
      'Try some gentle stretching',
      'Go to bed early tonight',
      'Avoid screens before bedtime',
    ],
    activities: ['Yoga', 'Reading', 'Warm bath', 'Meditation'],
    affirmations: [
      'Rest is productive',
      'I listen to my body\'s needs',
      'Taking care of myself is important',
    ],
  },
  {
    mood: 'Calm',
    suggestions: [
      'Enjoy this peaceful state',
      'Practice mindfulness or meditation',
      'Do something you enjoy',
      'Take time to reflect on your day',
      'Help someone else feel calm too',
      'Express gratitude for this moment',
    ],
    activities: ['Meditation', 'Reading', 'Gratitude practice', 'Drawing'],
    affirmations: [
      'I am at peace with myself',
      'I can maintain this calm energy',
      'My inner peace radiates outward',
    ],
  },
  {
    mood: 'Confused',
    suggestions: [
      'Write down your thoughts to organize them',
      'Talk to someone about what\'s unclear',
      'Take one step at a time',
      'Ask for help if needed',
      'Give yourself time to figure things out',
      'Break down complex problems into smaller parts',
    ],
    activities: ['Journaling', 'Call a friend', 'Reading', 'Meditation'],
    affirmations: [
      'It\'s okay not to have all the answers',
      'I can figure this out step by step',
      'Confusion is often a sign of growth',
    ],
  },
  {
    mood: 'Frustrated',
    suggestions: [
      'Take a step back and breathe',
      'Break down the problem into smaller parts',
      'Ask for help or support',
      'Do something else for a while',
      'Remember that setbacks are temporary',
      'Focus on what you can control',
    ],
    activities: ['Deep breathing', 'Walking', 'Yoga', 'Call a friend'],
    affirmations: [
      'I can overcome this challenge',
      'Setbacks are opportunities to learn',
      'I am resilient and capable',
    ],
  },
  {
    mood: 'Loved',
    suggestions: [
      'Express gratitude to those who care about you',
      'Spend time with loved ones',
      'Do something kind for someone else',
      'Write about what makes you feel loved',
      'Celebrate this positive feeling',
      'Share your love with others',
    ],
    activities: ['Call a friend', 'Gratitude practice', 'Journaling', 'Drawing'],
    affirmations: [
      'I am worthy of love and care',
      'I have people who love and support me',
      'I can share love with others',
    ],
  },
  {
    mood: 'Confident',
    suggestions: [
      'Use this energy to tackle challenges',
      'Help others build their confidence',
      'Set goals and work towards them',
      'Celebrate your achievements',
      'Share your positive energy',
      'Take on new opportunities',
    ],
    activities: ['Walking', 'Drawing', 'Call a friend', 'Journaling'],
    affirmations: [
      'I am capable and strong',
      'I trust in my abilities',
      'I can achieve my goals',
    ],
  },
];

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

export default function Suggestions() {
  const { moodEntries, activities } = useAppStore();
  const [recentMood, setRecentMood] = useState<string>('neutral');
  const [selectedMood, setSelectedMood] = useState<string>('neutral');

  useEffect(() => {
    if (moodEntries.length > 0) {
      const latestMood = moodEntries[0].mood;
      setRecentMood(latestMood);
      setSelectedMood(latestMood);
    }
  }, [moodEntries]);

  const getMoodSuggestion = (mood: string) => {
    const suggestion = MOOD_SUGGESTIONS.find(s => s.mood.toLowerCase() === mood.toLowerCase());
    return suggestion || MOOD_SUGGESTIONS.find(s => s.mood === 'Calm') || MOOD_SUGGESTIONS[0];
  };

  const currentSuggestion = getMoodSuggestion(selectedMood);

  const renderSuggestionCard = (title: string, items: string[], icon: string) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6"
    >
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">{icon}</span>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-start">
            <span className="text-blue-500 mr-2 mt-1">•</span>
            <span className="text-gray-700 dark:text-gray-300">{item}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderActivityCard = (activity: Activity) => (
    <motion.div
      key={activity.id}
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">{activity.name}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{activity.category}</p>
        </div>
        <span className="text-2xl">{activity.icon}</span>
      </div>
    </motion.div>
  );

  const renderQuickActions = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-6"
    >
      <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Deep Breathing', 'Meditation', 'Walking', 'Journaling'].map((action, index) => (
          <motion.button
            key={action}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white bg-opacity-20 rounded-lg p-4 text-white font-medium hover:bg-opacity-30 transition-all"
          >
            {action}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Mood Boosters & Suggestions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Personalized suggestions based on your mood
          </p>
        </motion.div>

        {/* Recent Mood Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Your Recent Mood
              </h2>
              <div className="flex items-center">
                <span className="text-4xl mr-3">{getMoodEmoji(recentMood)}</span>
                <span 
                  className="text-lg font-medium"
                  style={{ color: getMoodColor(recentMood) }}
                >
                  {recentMood}
                </span>
              </div>
            </div>
            <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Last updated</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {moodEntries.length > 0 ? new Date(moodEntries[0].date).toLocaleDateString() : 'Never'}        
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mood Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Get suggestions for a different mood
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['Happy', 'Sad', 'Angry', 'Anxious', 'Tired', 'Calm', 'Confused', 'Frustrated', 'Loved', 'Confident'].map((mood) => (
              <motion.button
                key={mood}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedMood(mood)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedMood === mood
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{getMoodEmoji(mood)}</div>
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{mood}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Suggestions */}
        {currentSuggestion && (
          <div className="grid md:grid-cols-2 gap-6">
            {renderSuggestionCard('Suggestions', currentSuggestion.suggestions, '💡')}
            {renderSuggestionCard('Activities', currentSuggestion.activities, '🎯')}
          </div>
        )}

        {/* Affirmations */}
        {currentSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg p-6 mt-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">Daily Affirmations</h3>
            <div className="space-y-3">
              {currentSuggestion.affirmations.map((affirmation, index) => (
                <div key={index} className="flex items-center">
                  <span className="text-white mr-3">✨</span>
                  <span className="text-white font-medium">{affirmation}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Your Activities */}
        {activities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Your Activities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activities.slice(0, 6).map(renderActivityCard)}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 