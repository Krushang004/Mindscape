import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Signup: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
            <Heart className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Coming Soon
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Sign up functionality will be available soon. For now, please use the login page.
        </p>
        <Link
          to="/login"
          className="btn-primary inline-flex items-center px-6 py-3"
        >
          Go to Login
        </Link>
      </motion.div>
    </div>
  );
};

export default Signup; 