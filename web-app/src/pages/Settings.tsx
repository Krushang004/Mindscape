import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Moon, Sun, Monitor, User, Bell } from 'lucide-react';
import { useAppStore } from '../store';

const Settings: React.FC = () => {
  const { settings, updateSettings, theme, setTheme } = useAppStore();

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'auto', label: 'Auto', icon: Monitor },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your experience and preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Appearance
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = theme === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value as 'light' | 'dark' | 'auto')}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Name
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => updateSettings({ name: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Email
              </label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => updateSettings({ email: e.target.value })}
                className="input-field"
                placeholder="Enter your email"
              />
            </div>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Daily Reminders
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get reminded to log your mood
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.reminderEnabled}
                  onChange={(e) => updateSettings({ reminderEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Data Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Data & Privacy
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Data Export
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Allow data export functionality
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.dataExportEnabled}
                  onChange={(e) => updateSettings({ dataExportEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings; 