import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  Save, 
  Calendar, 
  Heart, 
  Activity, 
  Droplets, 
  Zap,
  Moon,
  Dumbbell
} from 'lucide-react';
import { useAppStore } from '../store';
import { MoodEntry } from '../types';

interface EntryFormData {
  mood: string;
  moodLevel: number;
  summary: string;
  journal: string;
  sleepHours: number;
  exerciseMinutes: number;
  waterIntake: number;
  stressLevel: number;
  energyLevel: number;
}

const moodOptions = [
  { emoji: '😊', mood: 'Happy', level: 9, color: '#22c55e' },
  { emoji: '😌', mood: 'Calm', level: 8, color: '#3b82f6' },
  { emoji: '😐', mood: 'Neutral', level: 6, color: '#6b7280' },
  { emoji: '😔', mood: 'Sad', level: 4, color: '#8b5cf6' },
  { emoji: '😤', mood: 'Stressed', level: 3, color: '#f59e0b' },
  { emoji: '😢', mood: 'Depressed', level: 2, color: '#ef4444' },
  { emoji: '😡', mood: 'Angry', level: 1, color: '#dc2626' },
];

const activityOptions = [
  { name: 'Exercise', icon: Dumbbell, category: 'exercise' },
  { name: 'Meditation', icon: Heart, category: 'mindfulness' },
  { name: 'Socializing', icon: Activity, category: 'social' },
  { name: 'Reading', icon: Moon, category: 'creative' },
  { name: 'Walking', icon: Zap, category: 'exercise' },
  { name: 'Cooking', icon: Heart, category: 'creative' },
  { name: 'Music', icon: Activity, category: 'creative' },
  { name: 'Gaming', icon: Zap, category: 'social' },
];

const DailyEntry: React.FC = () => {
  const { addEntry } = useAppStore();
  const [selectedMood, setSelectedMood] = useState<typeof moodOptions[0] | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<EntryFormData>({
    defaultValues: {
      moodLevel: 5,
      sleepHours: 8,
      exerciseMinutes: 30,
      waterIntake: 8,
      stressLevel: 5,
      energyLevel: 7,
    },
  });

  const watchedMoodLevel = watch('moodLevel');

  const handleMoodSelect = (mood: typeof moodOptions[0]) => {
    setSelectedMood(mood);
  };

  const handleActivityToggle = (activityName: string) => {
    setSelectedActivities(prev =>
      prev.includes(activityName)
        ? prev.filter(a => a !== activityName)
        : [...prev, activityName]
    );
  };

  const onSubmit = async (data: EntryFormData) => {
    if (!selectedMood) {
      toast.error('Please select a mood');
      return;
    }

    setIsSubmitting(true);

    try {
      const entry: MoodEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        emoji: selectedMood.emoji,
        mood: selectedMood.mood,
        moodLevel: selectedMood.level,
        summary: data.summary,
        journal: data.journal,
        activities: selectedActivities,
        sleepHours: data.sleepHours,
        exerciseMinutes: data.exerciseMinutes,
        waterIntake: data.waterIntake,
        stressLevel: data.stressLevel,
        energyLevel: data.energyLevel,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addEntry(entry);
      toast.success('Entry saved successfully!');
      
      // Reset form
      setSelectedMood(null);
      setSelectedActivities([]);
      reset();
    } catch (error) {
      toast.error('Failed to save entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Daily Entry
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          How are you feeling today?
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Mood Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            How's your mood today?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {moodOptions.map((mood) => (
              <motion.button
                key={mood.mood}
                type="button"
                onClick={() => handleMoodSelect(mood)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedMood?.mood === mood.mood
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{mood.emoji}</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {mood.mood}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Level {mood.level}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            What activities did you do today?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {activityOptions.map((activity) => {
              const Icon = activity.icon;
              const isSelected = selectedActivities.includes(activity.name);
              
              return (
                <motion.button
                  key={activity.name}
                  type="button"
                  onClick={() => handleActivityToggle(activity.name)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {activity.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Summary and Journal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Quick Summary
            </h2>
            <textarea
              {...register('summary', { required: 'Summary is required' })}
              placeholder="Brief summary of your day..."
              className="input-field h-32 resize-none"
            />
            {errors.summary && (
              <p className="text-red-500 text-sm mt-1">{errors.summary.message}</p>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Journal Entry
            </h2>
            <textarea
              {...register('journal')}
              placeholder="Optional detailed journal entry..."
              className="input-field h-32 resize-none"
            />
          </div>
        </motion.div>

        {/* Health Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Health Metrics
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sleep */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Moon className="h-4 w-4 mr-2" />
                Sleep (hours)
              </label>
              <input
                type="number"
                {...register('sleepHours', { min: 0, max: 24 })}
                className="input-field"
                min="0"
                max="24"
                step="0.5"
              />
            </div>

            {/* Exercise */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Dumbbell className="h-4 w-4 mr-2" />
                Exercise (minutes)
              </label>
              <input
                type="number"
                {...register('exerciseMinutes', { min: 0, max: 480 })}
                className="input-field"
                min="0"
                max="480"
              />
            </div>

            {/* Water */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Droplets className="h-4 w-4 mr-2" />
                Water (glasses)
              </label>
              <input
                type="number"
                {...register('waterIntake', { min: 0, max: 20 })}
                className="input-field"
                min="0"
                max="20"
              />
            </div>

            {/* Stress Level */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Heart className="h-4 w-4 mr-2" />
                Stress Level (1-10)
              </label>
              <input
                type="range"
                {...register('stressLevel')}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                min="1"
                max="10"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>{watchedMoodLevel}</span>
                <span>High</span>
              </div>
            </div>

            {/* Energy Level */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Zap className="h-4 w-4 mr-2" />
                Energy Level (1-10)
              </label>
              <input
                type="range"
                {...register('energyLevel')}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                min="1"
                max="10"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>{watchedMoodLevel}</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <button
            type="submit"
            disabled={isSubmitting || !selectedMood}
            className="btn-primary flex items-center px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="loading-spinner mr-2" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            {isSubmitting ? 'Saving...' : 'Save Entry'}
          </button>
        </motion.div>
      </form>
    </div>
  );
};

export default DailyEntry; 