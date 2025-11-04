import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Activity,
  Plus,
  BarChart3,
  Heart,
  Zap
} from 'lucide-react';
import { useAppStore } from '../store';
import { format } from 'date-fns';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard: React.FC = () => {
  const { getDashboardData, entries, addEntry } = useAppStore();
  const dashboardData = getDashboardData();

  const weeklyChartData = {
    labels: dashboardData.weeklyMoodData.map(item => format(new Date(item.date), 'MMM dd')),
    datasets: [
      {
        label: 'Mood Level',
        data: dashboardData.weeklyMoodData.map(item => item.mood),
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const moodDistributionData = {
    labels: dashboardData.moodDistribution.map(item => item.mood),
    datasets: [
      {
        data: dashboardData.moodDistribution.map(item => item.count),
        backgroundColor: [
          '#22c55e', // Green
          '#3b82f6', // Blue
          '#f59e0b', // Yellow
          '#ef4444', // Red
          '#8b5cf6', // Purple
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 2,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
  };

  const stats = [
    {
      title: 'Current Streak',
      value: dashboardData.currentStreak,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Entries',
      value: dashboardData.totalEntries,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Average Mood',
      value: dashboardData.averageMood.toFixed(1),
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
    {
      title: 'Active Goals',
      value: '3', // This would come from goals data
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's your mental health overview.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 sm:mt-0 btn-primary flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Entry
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bgColor} dark:bg-gray-700`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Mood Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Weekly Mood Trend
            </h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64">
            <Line data={weeklyChartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Mood Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Mood Distribution
            </h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64">
            <Doughnut data={moodDistributionData} options={doughnutOptions} />
          </div>
        </motion.div>
      </div>

      {/* Recent Entries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recent Entries
          </h3>
          <Zap className="h-5 w-5 text-gray-400" />
        </div>
        
        {dashboardData.recentEntries.length > 0 ? (
          <div className="space-y-3">
            {dashboardData.recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{entry.emoji}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {entry.mood}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(entry.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Level {entry.moodLevel}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {entry.activities.slice(0, 2).join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              No entries yet. Start tracking your mood!
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard; 