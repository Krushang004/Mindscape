import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';
import { Goal } from '../types';

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal } = useAppStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [goalCategory, setGoalCategory] = useState('personal');
  const [goalPriority, setGoalPriority] = useState('medium');

  const categories = [
    { id: 'personal', name: 'Personal', icon: '👤', color: '#3B82F6' },
    { id: 'health', name: 'Health', icon: '💪', color: '#10B981' },
    { id: 'work', name: 'Work', icon: '💼', color: '#F59E0B' },
    { id: 'social', name: 'Social', icon: '👥', color: '#8B5CF6' },
    { id: 'learning', name: 'Learning', icon: '📚', color: '#EF4444' },
  ];

  const priorities = [
    { id: 'low', name: 'Low', color: '#10B981' },
    { id: 'medium', name: 'Medium', color: '#F59E0B' },
    { id: 'high', name: 'High', color: '#EF4444' },
  ];

  const handleAddGoal = () => {
    setEditingGoal(null);
    setGoalTitle('');
    setGoalDescription('');
    setGoalDeadline('');
    setGoalCategory('personal');
    setGoalPriority('medium');
    setModalVisible(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalTitle(goal.title);
    setGoalDescription(goal.description);
    setGoalDeadline(goal.deadline);
    setGoalCategory(goal.category || 'personal');
    setGoalPriority(goal.priority || 'medium');
    setModalVisible(true);
  };

  const handleSaveGoal = () => {
    if (!goalTitle.trim()) {
      alert('Please enter a goal title');
      return;
    }

    const newGoal: Goal = {
      id: editingGoal?.id || Date.now().toString(),
      title: goalTitle.trim(),
      description: goalDescription.trim(),
      deadline: goalDeadline.trim(),
      category: goalCategory,
      priority: goalPriority,
      completed: editingGoal?.completed || false,
      createdAt: editingGoal?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingGoal) {
      updateGoal(editingGoal.id, { ...newGoal });
    } else {
      addGoal(newGoal);
    }

    setModalVisible(false);
  };

  const handleToggleGoal = (goal: Goal) => {
    updateGoal(goal.id, { completed: !goal.completed });
  };

  const handleDeleteGoal = (goal: Goal) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      deleteGoal(goal.id);
    }
  };

  const getProgressPercentage = () => {
    if (goals.length === 0) return 0;
    const completedGoals = goals.filter(goal => goal.completed).length;
    return Math.round((completedGoals / goals.length) * 100);
  };

  const getCategoryIcon = (categoryId?: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || '📋';
  };

  const getCategoryColor = (categoryId?: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6B7280';
  };

  const getPriorityColor = (priorityId?: string) => {
    const priority = priorities.find(p => p.id === priorityId);
    return priority?.color || '#6B7280';
  };

  const isOverdue = (deadline: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const getDaysRemaining = (deadline: string) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderGoalCard = (goal: Goal) => {
    const daysRemaining = getDaysRemaining(goal.deadline);
    const overdue = isOverdue(goal.deadline);

    return (
      <motion.div
        key={goal.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 ${
          goal.completed ? 'opacity-75' : ''
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{getCategoryIcon(goal.category)}</span>
            <div>
              <h3 className={`text-lg font-semibold ${goal.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                {goal.title}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span
                  className="px-2 py-1 text-xs font-medium rounded-full"
                  style={{ backgroundColor: getPriorityColor(goal.priority) + '20', color: getPriorityColor(goal.priority) }}
                >
                  {goal.priority}
                </span>
                <span
                  className="px-2 py-1 text-xs font-medium rounded-full"
                  style={{ backgroundColor: getCategoryColor(goal.category) + '20', color: getCategoryColor(goal.category) }}
                >
                  {categories.find(c => c.id === goal.category)?.name}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleToggleGoal(goal)}
              className={`p-2 rounded-lg transition-colors ${
                goal.completed
                  ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {goal.completed ? '✓' : '○'}
            </button>
            <button
              onClick={() => handleEditGoal(goal)}
              className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              ✏️
            </button>
            <button
              onClick={() => handleDeleteGoal(goal)}
              className="p-2 rounded-lg bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            >
              🗑️
            </button>
          </div>
        </div>

        {goal.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">{goal.description}</p>
        )}

        {goal.deadline && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">📅</span>
              <span className={`text-sm ${overdue ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                {new Date(goal.deadline).toLocaleDateString()}
              </span>
            </div>
            {daysRemaining !== null && (
              <span className={`text-sm font-medium ${
                overdue ? 'text-red-600 dark:text-red-400' :
                daysRemaining <= 3 ? 'text-yellow-600 dark:text-yellow-400' :
                'text-green-600 dark:text-green-400'
              }`}>
                {overdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
              </span>
            )}
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Created: {new Date(goal.createdAt).toLocaleDateString()}
        </div>
      </motion.div>
    );
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
              Goals & Achievements
            </h1>
            <button
              onClick={handleAddGoal}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <span className="mr-2">+</span>
              Add Goal
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Set and track your personal goals to improve your mental well-being
          </p>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Overall Progress</h2>
            <span className="text-2xl font-bold text-blue-600">{getProgressPercentage()}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span>{goals.filter(g => g.completed).length} completed</span>
            <span>{goals.length} total</span>
          </div>
        </motion.div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {goals.map(renderGoalCard)}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {goals.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No goals yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start by adding your first goal to track your progress
            </p>
            <button
              onClick={handleAddGoal}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Goal
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
                  {editingGoal ? 'Edit Goal' : 'Add New Goal'}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={goalTitle}
                      onChange={(e) => setGoalTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter goal title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={goalDescription}
                      onChange={(e) => setGoalDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter goal description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={goalCategory}
                      onChange={(e) => setGoalCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={goalPriority}
                      onChange={(e) => setGoalPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      {priorities.map(priority => (
                        <option key={priority.id} value={priority.id}>
                          {priority.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={goalDeadline}
                      onChange={(e) => setGoalDeadline(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
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
                    onClick={handleSaveGoal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingGoal ? 'Update' : 'Save'}
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