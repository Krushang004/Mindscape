import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAppStore } from './store';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DailyEntry from './pages/DailyEntry';
import History from './pages/History';
import Goals from './pages/Goals';
import Activities from './pages/Activities';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Suggestions from './pages/Suggestions';
import MonthlyReview from './pages/MonthlyReview';
import './App.css';

function App() {
  const { theme, setTheme, isAuthenticated } = useAppStore();

  useEffect(() => {
    // Apply theme
    const root = document.documentElement;
    if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'auto') {
        const root = document.documentElement;
        if (mediaQuery.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <>
      <Helmet>
        <title>Mental Health Tracker</title>
        <meta name="description" content="Track your mood, activities, and mental well-being" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/" replace />} />
          
          {/* Protected routes */}
          <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}>
            <Route index element={<Dashboard />} />
            <Route path="entry" element={<DailyEntry />} />
            <Route path="history" element={<History />} />
            <Route path="monthly-review" element={<MonthlyReview />} />
            <Route path="goals" element={<Goals />} />
            <Route path="activities" element={<Activities />} />
            <Route path="suggestions" element={<Suggestions />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default App; 