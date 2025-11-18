import { MoodEmoji, MoodSuggestion } from '../types';

export const MOOD_EMOJIS: MoodEmoji[] = [
  {
    emoji: '😊',
    mood: 'Happy',
    color: '#4CAF50',
    description: 'Feeling joyful and content',
    moodLevel: 9,
  },
  {
    emoji: '😔',
    mood: 'Sad',
    color: '#2196F3',
    description: 'Feeling down or blue',
    moodLevel: 3,
  },
  {
    emoji: '😡',
    mood: 'Angry',
    color: '#F44336',
    description: 'Feeling frustrated or upset',
    moodLevel: 2,
  },
  {
    emoji: '😰',
    mood: 'Anxious',
    color: '#FF9800',
    description: 'Feeling worried or nervous',
    moodLevel: 4,
  },
  {
    emoji: '😴',
    mood: 'Tired',
    color: '#9C27B0',
    description: 'Feeling exhausted or sleepy',
    moodLevel: 5,
  },
  {
    emoji: '😌',
    mood: 'Calm',
    color: '#00BCD4',
    description: 'Feeling peaceful and relaxed',
    moodLevel: 8,
  },
  {
    emoji: '🤔',
    mood: 'Confused',
    color: '#607D8B',
    description: 'Feeling uncertain or unclear',
    moodLevel: 6,
  },
  {
    emoji: '😤',
    mood: 'Frustrated',
    color: '#795548',
    description: 'Feeling stuck or annoyed',
    moodLevel: 3,
  },
  {
    emoji: '🥰',
    mood: 'Loved',
    color: '#E91E63',
    description: 'Feeling cared for and appreciated',
    moodLevel: 10,
  },
  {
    emoji: '😎',
    mood: 'Confident',
    color: '#3F51B5',
    description: 'Feeling strong and capable',
    moodLevel: 9,
  },
];

export const MOOD_SUGGESTIONS: MoodSuggestion[] = [
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

export const getMoodSuggestion = (mood: string): MoodSuggestion | undefined => {
  return MOOD_SUGGESTIONS.find(suggestion => suggestion.mood === mood);
};

export const getMoodEmoji = (mood: string): MoodEmoji | undefined => {
  return MOOD_EMOJIS.find(emoji => emoji.mood === mood);
}; 