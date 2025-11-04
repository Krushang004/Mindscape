import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Clock, Activity } from 'lucide-react';
import { useAppStore } from '../store';

const History: React.FC = () => {
  const { entries } = useAppStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          History
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View your past mood entries and track your progress.
        </p>
      </div>

      {entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">{entry.emoji}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {entry.mood}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {entry.summary}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(entry.date), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Level {entry.moodLevel}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {entry.activities.length > 0 && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Activity className="h-4 w-4 mr-1" />
                      {entry.activities.slice(0, 2).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No entries yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start tracking your mood to see your history here.
          </p>
        </div>
      )}
    </div>
  );
};

export default History; 