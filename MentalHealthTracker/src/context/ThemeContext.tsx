import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserSettings, saveUserSettings } from '../utils/database';

// Only dark mode with black and white colors
interface ThemeContextType {
  isDark: boolean;
  colors: typeof darkColors;
}

// Black and white dark mode colors only
const darkColors = {
  // Background colors - black shades
  background: '#000000',
  surface: '#1a1a1a',
  card: '#2a2a2a',
  
  // Text colors - white shades
  text: '#ffffff',
  textSecondary: '#cccccc',
  textTertiary: '#999999',
  
  // Primary colors - white for buttons/accents
  primary: '#ffffff',
  primaryLight: '#ffffff',
  primaryDark: '#cccccc',
  
  // Secondary colors - gray shades
  secondary: '#666666',
  secondaryLight: '#888888',
  secondaryDark: '#444444',
  
  // Status colors - grayscale
  success: '#ffffff',
  warning: '#cccccc',
  error: '#999999',
  info: '#ffffff',
  
  // Border and divider colors
  border: '#333333',
  divider: '#2a2a2a',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.5)',
  
  // Gradient colors - black to dark gray
  gradientStart: '#1a1a1a',
  gradientEnd: '#000000',
  
  // Switch colors
  switchTrack: '#333333',
  switchThumb: '#ffffff',
  switchActiveTrack: '#ffffff',
  switchActiveThumb: '#000000',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Always dark mode - black and white only
  const isDark = true;
  const colors = darkColors;

  const value: ThemeContextType = {
    isDark,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 