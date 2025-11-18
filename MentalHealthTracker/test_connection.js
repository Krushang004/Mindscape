// Test script to verify Django backend connection
// Run this in your React Native app to test the connection

import { Alert } from 'react-native';

const testConnection = async () => {
  try {
    const response = await fetch('http://192.168.0.106:8000/api/moods/');
    const data = await response.json();
    
    Alert.alert(
      'Connection Test',
      `✅ Success! Connected to Django backend.\n\nMoods found: ${data.results?.length || 0}\n\nFirst mood: ${data.results?.[0]?.name || 'None'}`,
      [{ text: 'OK' }]
    );
    
    console.log('✅ Connection successful:', data);
    return data;
  } catch (error) {
    Alert.alert(
      'Connection Test',
      `❌ Failed to connect to Django backend.\n\nError: ${error.message}\n\nMake sure:\n1. Django server is running\n2. Both devices are on same WiFi\n3. IP address is correct: 192.168.0.106`,
      [{ text: 'OK' }]
    );
    
    console.error('❌ Connection failed:', error);
    throw error;
  }
};

export default testConnection;
