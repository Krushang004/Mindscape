import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  PlusCircle, 
  Calendar, 
  Target, 
  Activity, 
  Settings, 
  Menu, 
  X,
  LogOut,
  User,
  Lightbulb,
  BarChart3
} from 'lucide-react';
import { useAppStore } from '../store';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuthenticated, setUser, settings } = useAppStore();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Daily Entry', href: '/entry', icon: PlusCircle },
    { name: 'History', href: '/history', icon: Calendar },
    { name: 'Monthly Review', href: '/monthly-review', icon: BarChart3 },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'Activities', href: '/activities', icon: Activity },
    { name: 'Suggestions', href: '/suggestions', icon: Lightbulb },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    setAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg lg:static lg:translate-x-0"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold text-gradient">Mental Health Tracker</h1>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <motion.button
                      key={item.name}
                      onClick={() => {
                        navigate(item.href);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        active
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </motion.button>
                  );
                })}
              </nav>

              {/* User section */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {settings.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {settings.email || 'User'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-4 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex-1 lg:hidden" />
            
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 lg:hidden">
                {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
              </h2>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 