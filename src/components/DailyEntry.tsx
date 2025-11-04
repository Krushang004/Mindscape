import React, { useState } from 'react';
import { Entry, MoodSuggestion } from '../types';

interface DailyEntryProps {
  onSave: (entry: Entry) => void;
}

const moodEmojis = [
  { emoji: '😊', mood: 'Happy', color: '#4CAF50' },
  { emoji: '😔', mood: 'Sad', color: '#2196F3' },
  { emoji: '😡', mood: 'Angry', color: '#F44336' },
  { emoji: '😰', mood: 'Anxious', color: '#FF9800' },
  { emoji: '😴', mood: 'Tired', color: '#9C27B0' },
  { emoji: '😌', mood: 'Calm', color: '#00BCD4' },
  { emoji: '🤔', mood: 'Confused', color: '#607D8B' },
  { emoji: '😤', mood: 'Frustrated', color: '#795548' },
  { emoji: '🥰', mood: 'Loved', color: '#E91E63' },
  { emoji: '😎', mood: 'Confident', color: '#3F51B5' },
];

const moodSuggestions: MoodSuggestion[] = [
  {
    mood: 'Happy',
    suggestions: [
      'Share your joy with someone you care about',
      'Take a moment to appreciate this feeling',
      'Do something creative to express your happiness',
      'Go for a walk and enjoy the good weather'
    ]
  },
  {
    mood: 'Sad',
    suggestions: [
      'Be gentle with yourself today',
      'Talk to a friend or family member',
      'Do something that usually brings you comfort',
      'Consider writing about your feelings',
      'Take a warm bath or shower'
    ]
  },
  {
    mood: 'Angry',
    suggestions: [
      'Take deep breaths and count to 10',
      'Go for a walk to cool down',
      'Write down what\'s bothering you',
      'Listen to calming music',
      'Try some physical exercise to release tension'
    ]
  },
  {
    mood: 'Anxious',
    suggestions: [
      'Practice deep breathing exercises',
      'Focus on what you can control right now',
      'Try grounding techniques (5-4-3-2-1 method)',
      'Limit caffeine and take breaks',
      'Talk to someone you trust about your worries'
    ]
  },
  {
    mood: 'Tired',
    suggestions: [
      'Get some rest if possible',
      'Take short breaks throughout the day',
      'Stay hydrated and eat nutritious food',
      'Try some gentle stretching',
      'Go to bed early tonight'
    ]
  },
  {
    mood: 'Calm',
    suggestions: [
      'Enjoy this peaceful state',
      'Practice mindfulness or meditation',
      'Do something you enjoy',
      'Take time to reflect on your day',
      'Help someone else feel calm too'
    ]
  },
  {
    mood: 'Confused',
    suggestions: [
      'Write down your thoughts to organize them',
      'Talk to someone about what\'s unclear',
      'Take one step at a time',
      'Ask for help if needed',
      'Give yourself time to figure things out'
    ]
  },
  {
    mood: 'Frustrated',
    suggestions: [
      'Take a step back and breathe',
      'Break down the problem into smaller parts',
      'Ask for help or support',
      'Do something else for a while',
      'Remember that setbacks are temporary'
    ]
  },
  {
    mood: 'Loved',
    suggestions: [
      'Express gratitude to those who care about you',
      'Spend time with loved ones',
      'Do something kind for someone else',
      'Write about what makes you feel loved',
      'Celebrate this positive feeling'
    ]
  },
  {
    mood: 'Confident',
    suggestions: [
      'Use this energy to tackle challenges',
      'Help others build their confidence',
      'Set goals and work towards them',
      'Celebrate your achievements',
      'Share your positive energy'
    ]
  }
];

const DailyEntry: React.FC<DailyEntryProps> = ({ onSave }) => {
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [summary, setSummary] = useState('');
  const [journal, setJournal] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleEmojiSelect = (emoji: string, mood: string) => {
    setSelectedEmoji(emoji);
    setSelectedMood(mood);
    
    const moodSuggestion = moodSuggestions.find(s => s.mood === mood);
    if (moodSuggestion) {
      setSuggestions(moodSuggestion.suggestions);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmoji || !summary.trim()) {
      alert('Please select a mood and write a summary of your day.');
      return;
    }

    const entry: Entry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      emoji: selectedEmoji,
      mood: selectedMood,
      summary: summary.trim(),
      journal: journal.trim(),
      suggestions
    };

    onSave(entry);
  };

  return (
    <div className="daily-entry">
      <h2>How are you feeling today?</h2>
      
      <form onSubmit={handleSubmit} className="entry-form">
        <div className="mood-selector">
          <h3>Choose your mood:</h3>
          <div className="emoji-grid">
            {moodEmojis.map(({ emoji, mood, color }) => (
              <button
                key={mood}
                type="button"
                className={`emoji-button ${selectedEmoji === emoji ? 'selected' : ''}`}
                onClick={() => handleEmojiSelect(emoji, mood)}
                style={{ borderColor: selectedEmoji === emoji ? color : 'transparent' }}
              >
                <span className="emoji">{emoji}</span>
                <span className="mood-label">{mood}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="summary-section">
          <h3>How was your day? (One sentence)</h3>
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="e.g., Today was productive and I felt accomplished"
            className="summary-input"
            maxLength={200}
          />
        </div>

        <div className="journal-section">
          <h3>Journal Entry (Optional)</h3>
          <textarea
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            placeholder="Write more about your day, thoughts, or feelings..."
            className="journal-textarea"
            rows={4}
          />
        </div>

        {suggestions.length > 0 && (
          <div className="suggestions-section">
            <h3>Suggestions for your mood:</h3>
            <ul className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="suggestion-item">
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button type="submit" className="save-button">
          Save Today's Entry
        </button>
      </form>
    </div>
  );
};

export default DailyEntry; 