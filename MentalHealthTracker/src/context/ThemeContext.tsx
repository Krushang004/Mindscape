import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserSettings, saveUserSettings } from '../utils/database';

// Only dark mode with black and white colors
interface ThemeContextType {
  isDark: boolean;
  colors: typeof darkColors;
}

// Black and white dark mode colors only
const darkColors = {
  // Background colors - dark theme
  background: '#0F1117',
  surface: '#1B1F2A',
  card: '#1B1F2A',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#9AA4C7',
  textTertiary: '#667399',
  
  // Primary colors - blue glow accent
  primary: '#4C6FFF',
  primaryLight: '#7A8CFF',
  primaryDark: '#2E49C2',
  
  // Secondary colors
  secondary: '#2A2F3C',
  secondaryLight: '#3A4259',
  secondaryDark: '#1A1D26',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#FF5252',
  info: '#4C6FFF',
  
  // Border and divider colors
  border: '#2A2F3C',
  divider: '#2A2F3C',
  
  // Shadow colors
  shadow: 'rgba(76, 111, 255, 0.15)',
  
  // Gradient colors
  gradientStart: '#1B1F2A',
  gradientEnd: '#0F1117',
  
  // Switch colors
  switchTrack: '#2A2F3C',
  switchThumb: '#9AA4C7',
  switchActiveTrack: '#2E49C2',
  switchActiveThumb: '#4C6FFF',
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