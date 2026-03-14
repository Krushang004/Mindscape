import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  Share,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useFocusEffect } from '@react-navigation/native';
import { UserSettings, NomineeAlert } from '../types';
import { getUserSettings, saveUserSettings, exportAllData, getNomineeAlerts, markAlertAsRead, getUserByEmail, importAllData, clearAllUserData } from '../utils/database';
import { useTheme } from '../context/ThemeContext';
import { reportFeedback } from '../utils/errorReporting';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';
import TermsOfServiceModal from '../components/TermsOfServiceModal';
import AppLockScreen from '../components/AppLockScreen';
import DateTimePicker from '@react-native-community/datetimepicker';
import { isAppLockEnabled, enableAppLock, disableAppLock, changeAppLockPin } from '../utils/appLock';
import { scheduleDailyReminder, cancelAllReminders } from '../utils/notifications';

interface SettingsScreenProps {
  navigation: any;
  onLogout?: () => void;
}

const SettingsScreen = ({ navigation, onLogout }: SettingsScreenProps) => {
  const { colors } = useTheme();
  const [settings, setSettings] = useState<UserSettings>({
    id: '1',
    name: 'User',
    email: '',
    reminderTime: '20:00',
    reminderEnabled: true,
    theme: 'light',
    notificationsEnabled: true,
    dataExportEnabled: true,
    privacyMode: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState<'feedback' | 'bug'>('feedback');
  const [privacyPolicyVisible, setPrivacyPolicyVisible] = useState(false);
  const [termsOfServiceVisible, setTermsOfServiceVisible] = useState(false);
  const [editNameModalVisible, setEditNameModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [licenseModalVisible, setLicenseModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importText, setImportText] = useState('');
  const [nomineeAlerts, setNomineeAlerts] = useState<NomineeAlert[]>([]);
  const [appLockEnabled, setAppLockEnabled] = useState(false);
  const [appLockSetupVisible, setAppLockSetupVisible] = useState(false);
  const [appLockChangePinVisible, setAppLockChangePinVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadSettings();
    loadAppLockStatus();
  }, []);

  const loadAppLockStatus = async () => {
    try {
      const enabled = await isAppLockEnabled();
      setAppLockEnabled(enabled);
    } catch (error) {
      console.error('Error loading app lock status:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      // Refresh settings when screen comes into focus
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    try {
      // First try to get user settings from database
      let userSettings = await getUserSettings();
      
      // If no settings found, try to get from AsyncStorage auth
      if (!userSettings) {
        try {
          const storedUser = await AsyncStorage.getItem('user_auth');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            console.log('Found authenticated user:', user);
            
            // Try to get user by email from database
            userSettings = await getUserByEmail(user.email);
            
            if (!userSettings) {
              console.log('No database record found for authenticated user, creating one...');
              // Create user settings for the authenticated user
              userSettings = {
                id: user.id,
                name: user.name,
                email: user.email,
                password: 'stored_auth_user',
                reminderTime: '20:00',
                reminderEnabled: true,
                theme: 'light',
                notificationsEnabled: true,
                dataExportEnabled: true,
                privacyMode: false,
                createdAt: user.createdAt,
                updatedAt: new Date().toISOString(),
              };
              await saveUserSettings(userSettings);
            }
          }
        } catch (storageError) {
          console.log('Error accessing AsyncStorage:', storageError);
        }
      }
      
      if (userSettings) {
        console.log('Loaded user settings:', userSettings);
        setSettings(userSettings);
      } else {
        console.log('No user settings found');
      }
      
      // Load nominee alerts (for demo purposes, we'll show alerts for a sample nominee)
      // In a real app, this would be based on the current user's ID
      try {
        const alerts = await getNomineeAlerts('sample-nominee-id');
        setNomineeAlerts(alerts);
      } catch (error) {
        console.log('No nominee alerts found');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const maskEmail = (email: string): string => {
    if (!email || !email.includes('@')) return email;
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  };

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    const updatedSettings = { ...settings, [key]: value, updatedAt: new Date().toISOString() };
    setSettings(updatedSettings);
    try {
      await saveUserSettings(updatedSettings);
      
      if (key === 'reminderEnabled') {
        if (value) {
          await scheduleDailyReminder(updatedSettings.reminderTime);
        } else {
          await cancelAllReminders();
        }
      } else if (key === 'reminderTime' && updatedSettings.reminderEnabled) {
        await scheduleDailyReminder(value as string);
      }
      
      // If updating name, also sync with AsyncStorage auth
      if (key === 'name') {
        try {
          const storedUser = await AsyncStorage.getItem('user_auth');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            const updatedUser = { ...user, name: value };
            await AsyncStorage.setItem('user_auth', JSON.stringify(updatedUser));
            console.log('Synced name update with AsyncStorage auth');
          }
        } catch (storageError) {
          console.log('Error syncing name with AsyncStorage:', storageError);
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      updateSetting('reminderTime', `${hours}:${minutes}`);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: () => {
            console.log('Logout pressed');
            if (onLogout) {
              onLogout();
            } else {
              // Fallback: try to navigate to login
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          }
        },
      ]
    );
  };

  const handleTermsOfService = () => {
    console.log('Terms of Service button pressed');
    setTermsOfServiceVisible(true);
  };

  const handleExportData = async () => {
    try {
      const data = await exportAllData();
      const json = JSON.stringify(data, null, 2);
      const fileName = `mental-health-backup-${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, json);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Mental Health Data (JSON)',
          UTI: 'public.json',
        });
      } else {
        Alert.alert('Export Complete', `JSON saved at: ${fileUri}`);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  const handleImportFromFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (!result || (result as any).type === 'cancel') {
        return;
      }

      let uri: string | undefined;

      if ('assets' in result && result.assets?.length) {
        uri = result.assets[0]?.uri;
      } else if ('uri' in result) {
        uri = (result as any).uri;
      }

      if (!uri) {
        Alert.alert('Import Failed', 'Could not read the selected file.');
        return;
      }

      const content = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8 });
      const data = JSON.parse(content);
      await importAllData(data);
      await loadSettings();
      Alert.alert('Import Complete', 'Your data has been imported successfully.');
    } catch (error: any) {
      console.error('Error importing data from file:', error);
      Alert.alert('Import Failed', error?.message || 'Could not import data from file.');
    }
  };

  const handleImportData = () => {
    Alert.alert('Import Data', 'Choose how you would like to import your backup.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Select JSON File',
        onPress: handleImportFromFile,
      },
      {
        text: 'Paste JSON',
        onPress: () => {
          setImportText('');
          setImportModalVisible(true);
        },
      },
    ]);
  };

  // Import handled via paste JSON modal below (with optional file picker)

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your mood entries, goals, habits, activities, and other data. Your account settings will be preserved. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllUserData();
              await loadSettings(); // Refresh settings to update UI
              Alert.alert('Data Cleared', 'All your data has been permanently deleted. Your account settings have been preserved.');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) {
      Alert.alert('Error', 'Please enter your feedback before sending.');
      return;
    }

    try {
      // Report feedback using the error reporting system
      await reportFeedback(feedbackType, feedbackText, {
        timestamp: new Date().toISOString(),
        appVersion: '1.0.0',
        platform: 'React Native',
      });
      
      Alert.alert(
        'Thank You!',
        'Your feedback has been submitted. We appreciate your input!',
        [
          {
            text: 'OK',
            onPress: () => {
              setFeedbackModalVisible(false);
              setFeedbackText('');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send feedback. Please try again.');
    }
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Check out this amazing Mental Health Tracker app! It helps you track your mood and mental well-being with privacy and care.',
        url: 'https://your-app-store-link.com', // Replace with actual app store link
        title: 'Mental Health Tracker',
      });
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };

  const handleRateApp = () => {
    // Replace with actual app store links
    const appStoreUrl = 'https://apps.apple.com/app/your-app-id';
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.mentalhealth.tracker';
    
    Alert.alert(
      'Rate Our App',
      'Please rate our app on the app store!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Rate App', onPress: () => Linking.openURL(appStoreUrl) },
      ]
    );
  };

  const SettingItem = ({ 
    title, 
    subtitle, 
    icon, 
    onPress, 
    showSwitch = false, 
    switchValue = false, 
    onSwitchChange = () => {},
    showArrow = true 
  }: any) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.border, true: 'rgba(76, 111, 255, 0.5)' }}
          thumbColor={switchValue ? colors.primary : '#ffffff'}
        />
      ) : showArrow ? (
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      ) : null}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 20,
      paddingBottom: 30,
      paddingHorizontal: 20,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.8)',
      textAlign: 'center',
      marginTop: 5,
    },
    section: {
      marginBottom: 20,
      marginHorizontal: 16,
      backgroundColor: colors.surface,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: 'rgba(76, 111, 255, 0.15)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.6,
      shadowRadius: 4,
      elevation: 2,
    },
    sectionHeader: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: 'transparent',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'transparent',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(76, 111, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
      borderWidth: 1,
      borderColor: 'rgba(76, 111, 255, 0.2)',
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    settingSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      width: '90%',
      maxWidth: 400,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: 'rgba(76, 111, 255, 0.15)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.6,
      shadowRadius: 4,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    closeButton: {
      padding: 5,
    },
    feedbackInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 15,
      fontSize: 16,
      minHeight: 120,
      textAlignVertical: 'top',
      marginBottom: 20,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 15,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    sendButton: {
      flex: 1,
      borderRadius: 25,
      overflow: 'hidden',
    },
    sendButtonGradient: {
      paddingVertical: 12,
      alignItems: 'center',
    },
    sendButtonText: {
      fontSize: 16,
      color: 'white',
      fontWeight: 'bold',
    },
    modalText: {
      fontSize: 16,
      marginBottom: 15,
    },
    licenseItem: {
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: 'rgba(0, 0, 0, 0.1)',
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
    },
    licenseTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    licenseText: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 5,
    },
    licenseDescription: {
      fontSize: 13,
    },
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your experience</Text>
      </LinearGradient>

      {/* Profile Settings */}
      <View style={styles.section}>
        <SectionHeader title="Profile" />
        <SettingItem
          title="Name"
          subtitle={settings.name}
          icon="person"
          onPress={() => {
            setNewName(settings.name);
            setEditNameModalVisible(true);
          }}
        />
        <SettingItem
          title="Email"
          subtitle={maskEmail(settings.email || 'Not set')}
          icon="mail"
          onPress={() => {
            // Just show the full email when pressed
            Alert.alert('Email', settings.email || 'No email set');
          }}
        />
      </View>

      {/* App Preferences */}
      <View style={styles.section}>
        <SectionHeader title="App Preferences" />
        <SettingItem
          title="Daily Reminders"
          subtitle={`${settings.reminderTime} daily`}
          icon="notifications"
          showSwitch={true}
          switchValue={settings.reminderEnabled}
          onSwitchChange={(value: boolean) => updateSetting('reminderEnabled', value)}
          onPress={() => setShowTimePicker(true)}
        />
        {showTimePicker && (
          <DateTimePicker
            value={(() => {
              const date = new Date();
              const [hours, minutes] = settings.reminderTime.split(':').map(Number);
              date.setHours(hours, minutes, 0, 0);
              return date;
            })()}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleTimeChange}
          />
        )}
        <SettingItem
          title="Notifications"
          subtitle="Push notifications for reminders"
          icon="notifications-circle"
          showSwitch={true}
          switchValue={settings.notificationsEnabled}
          onSwitchChange={(value: boolean) => updateSetting('notificationsEnabled', value)}
        />
        <SettingItem
          title="Privacy Mode"
          subtitle="Hide sensitive data from screenshots"
          icon="eye-off"
          showSwitch={true}
          switchValue={settings.privacyMode}
          onSwitchChange={(value: boolean) => updateSetting('privacyMode', value)}
        />
        <SettingItem
          title="App Lock"
          subtitle={appLockEnabled ? "PIN protection enabled" : "Protect app with PIN"}
          icon="lock-closed"
          showSwitch={true}
          switchValue={appLockEnabled}
          onSwitchChange={async (value: boolean) => {
            if (value) {
              setAppLockSetupVisible(true);
            } else {
              Alert.alert(
                'Disable App Lock',
                'Are you sure you want to disable app lock?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Disable',
                    style: 'destructive',
                    onPress: async () => {
                      await disableAppLock();
                      await loadAppLockStatus();
                    },
                  },
                ]
              );
            }
          }}
          onPress={() => {
            if (appLockEnabled) {
              Alert.alert(
                'App Lock',
                'What would you like to do?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Change PIN',
                    onPress: () => setAppLockChangePinVisible(true),
                  },
                  {
                    text: 'Disable',
                    style: 'destructive',
                    onPress: async () => {
                      await disableAppLock();
                      await loadAppLockStatus();
                    },
                  },
                ]
              );
            }
          }}
        />
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <SectionHeader title="Data Management" />
        <SettingItem
          title="Export Data"
          subtitle="Export as JSON file"
          icon="download"
          onPress={handleExportData}
        />
        <SettingItem
          title="Import Data"
          subtitle="Restore from a JSON backup"
          icon="cloud-download"
          onPress={handleImportData}
        />
        <SettingItem
          title="Clear All Data"
          subtitle="Permanently delete all data"
          icon="trash"
          onPress={handleClearData}
        />
        <SettingItem
          title="Data Export Enabled"
          subtitle="Allow data export functionality"
          icon="cloud-upload"
          showSwitch={true}
          switchValue={settings.dataExportEnabled}
          onSwitchChange={(value: boolean) => updateSetting('dataExportEnabled', value)}
        />
      </View>

      {/* Support & Feedback */}
      <View style={styles.section}>
        <SectionHeader title="Support & Feedback" />
        <SettingItem
          title="Send Feedback"
          subtitle="Share your thoughts with us"
          icon="chatbubble"
          onPress={() => {
            setFeedbackType('feedback');
            setFeedbackModalVisible(true);
          }}
        />
        <SettingItem
          title="Report a Bug"
          subtitle="Help us improve the app"
          icon="bug"
          onPress={() => {
            setFeedbackType('bug');
            setFeedbackModalVisible(true);
          }}
        />
        <SettingItem
          title="Rate the App"
          subtitle="Support us with a rating"
          icon="star"
          onPress={handleRateApp}
        />
        <SettingItem
          title="Share App"
          subtitle="Tell friends about the app"
          icon="share-social"
          onPress={handleShareApp}
        />
      </View>

      {/* Support Alerts */}
      {nomineeAlerts.length > 0 && (
        <View style={styles.section}>
          <SectionHeader title="Support Alerts" />
          {nomineeAlerts.slice(0, 3).map((alert) => (
            <SettingItem
              key={alert.id}
              title={`Alert: Stress Level ${alert.stressLevel}/10`}
              subtitle={`${alert.date} - ${alert.message}`}
              icon="warning"
              showArrow={false}
              onPress={() => {
                Alert.alert(
                  'Support Alert',
                  alert.message,
                  [
                    { text: 'OK' },
                    {
                      text: 'Mark as Read',
                      onPress: async () => {
                        try {
                          await markAlertAsRead(alert.id);
                          await loadSettings();
                        } catch (error) {
                          console.error('Error marking alert as read:', error);
                        }
                      },
                    },
                  ]
                );
              }}
            />
          ))}
          {nomineeAlerts.length > 3 && (
            <SettingItem
              title={`+${nomineeAlerts.length - 3} more alerts`}
              subtitle="Tap to view all alerts"
              icon="ellipsis-horizontal"
              onPress={() => {
                Alert.alert(
                  'All Support Alerts',
                  nomineeAlerts.map(alert => 
                    `${alert.date}: Stress Level ${alert.stressLevel}/10 - ${alert.message}`
                  ).join('\n\n'),
                  [{ text: 'OK' }]
                );
              }}
            />
          )}
        </View>
      )}

      {/* About */}
      <View style={styles.section}>
        <SectionHeader title="About" />
        <SettingItem
          title="Version"
          subtitle="1.0.0"
          icon="information-circle"
          showArrow={false}
          onPress={() => {}}
        />
        <SettingItem
          title="Privacy Policy"
          subtitle="Read our privacy policy"
          icon="shield-checkmark"
          onPress={() => setPrivacyPolicyVisible(true)}
        />
        <SettingItem
          title="Terms of Service"
          subtitle="Read our terms of service"
          icon="document-text"
          onPress={handleTermsOfService}
        />

        <SettingItem
          title="Open Source Licenses"
          subtitle="View third-party licenses"
          icon="library"
          onPress={() => setLicenseModalVisible(true)}
        />
      </View>

      {/* Account */}
      <View style={styles.section}>
        <SectionHeader title="Account" />
        <SettingItem
          title="Logout"
          subtitle="Sign out of your account"
          icon="log-out"
          onPress={handleLogout}
        />
      </View>

      {/* Feedback Modal */}
      <Modal
        visible={feedbackModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {feedbackType === 'feedback' ? 'Send Feedback' : 'Report a Bug'}
              </Text>
              <TouchableOpacity
                onPress={() => setFeedbackModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.feedbackInput}
              value={feedbackText}
              onChangeText={setFeedbackText}
              placeholder={
                feedbackType === 'feedback'
                  ? 'Share your thoughts, suggestions, or experience with the app...'
                  : 'Describe the bug you encountered, including steps to reproduce...'
              }
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setFeedbackModalVisible(false);
                  setFeedbackText('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendFeedback}
              >
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  style={styles.sendButtonGradient}
                >
                  <Text style={styles.sendButtonText}>Send</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        visible={privacyPolicyVisible}
        onClose={() => setPrivacyPolicyVisible(false)}
      />

      {/* Terms of Service Modal */}
      <TermsOfServiceModal
        visible={termsOfServiceVisible}
        onClose={() => setTermsOfServiceVisible(false)}
      />

      {/* Import Data Modal */}
      <Modal
        visible={importModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setImportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Import Data (JSON)</Text>
              <TouchableOpacity
                onPress={() => setImportModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.feedbackInput}
              value={importText}
              onChangeText={setImportText}
              placeholder="Paste your JSON export here"
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setImportModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sendButton}
                onPress={async () => {
                  try {
                    if (!importText.trim()) {
                      Alert.alert('Import Failed', 'Please paste JSON data to import.');
                      return;
                    }
                    const data = JSON.parse(importText);
                    await importAllData(data);
                    await loadSettings();
                    setImportModalVisible(false);
                    Alert.alert('Import Complete', 'Your data has been imported successfully.');
                  } catch (error: any) {
                    console.error('Error importing data:', error);
                    Alert.alert('Import Failed', error?.message || 'Could not import data.');
                  }
                }}
              >
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  style={styles.sendButtonGradient}
                >
                  <Text style={styles.sendButtonText}>Import</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Name Modal */}
      <Modal
        visible={editNameModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditNameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Name</Text>
              <TouchableOpacity
                onPress={() => setEditNameModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.feedbackInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter your name"
              placeholderTextColor={colors.textTertiary}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditNameModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sendButton}
                onPress={() => {
                  if (newName.trim()) {
                    updateSetting('name', newName.trim());
                    setEditNameModalVisible(false);
                  } else {
                    Alert.alert('Error', 'Please enter a valid name');
                  }
                }}
              >
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  style={styles.sendButtonGradient}
                >
                  <Text style={styles.sendButtonText}>Save</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>



      {/* Third Party Licenses Modal */}
      <Modal
        visible={licenseModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLicenseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Third Party Licenses</Text>
              <TouchableOpacity
                onPress={() => setLicenseModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalText, { color: colors.textSecondary, marginBottom: 15 }]}>
                This app uses the following open source libraries:
              </Text>
              
              <View style={styles.licenseItem}>
                <Text style={[styles.licenseTitle, { color: colors.text }]}>React Native</Text>
                <Text style={[styles.licenseText, { color: colors.textSecondary }]}>MIT License</Text>
                <Text style={[styles.licenseDescription, { color: colors.textTertiary }]}>
                  A framework for building native applications using React.
                </Text>
              </View>
              
              <View style={styles.licenseItem}>
                <Text style={[styles.licenseTitle, { color: colors.text }]}>Expo</Text>
                <Text style={[styles.licenseText, { color: colors.textSecondary }]}>MIT License</Text>
                <Text style={[styles.licenseDescription, { color: colors.textTertiary }]}>
                  A platform for building React Native apps with additional tools and services.
                </Text>
              </View>
              
              <View style={styles.licenseItem}>
                <Text style={[styles.licenseTitle, { color: colors.text }]}>React Navigation</Text>
                <Text style={[styles.licenseText, { color: colors.textSecondary }]}>MIT License</Text>
                <Text style={[styles.licenseDescription, { color: colors.textTertiary }]}>
                  Navigation library for React Native applications.
                </Text>
              </View>
              
              <View style={styles.licenseItem}>
                <Text style={[styles.licenseTitle, { color: colors.text }]}>Expo SQLite</Text>
                <Text style={[styles.licenseText, { color: colors.textSecondary }]}>MIT License</Text>
                <Text style={[styles.licenseDescription, { color: colors.textTertiary }]}>
                  SQLite database integration for Expo apps.
                </Text>
              </View>
              
              <View style={styles.licenseItem}>
                <Text style={[styles.licenseTitle, { color: colors.text }]}>Expo Linear Gradient</Text>
                <Text style={[styles.licenseText, { color: colors.textSecondary }]}>MIT License</Text>
                <Text style={[styles.licenseDescription, { color: colors.textTertiary }]}>
                  Linear gradient component for Expo applications.
                </Text>
              </View>
              
              <View style={styles.licenseItem}>
                <Text style={[styles.licenseTitle, { color: colors.text }]}>React Native Vector Icons</Text>
                <Text style={[styles.licenseText, { color: colors.textSecondary }]}>MIT License</Text>
                <Text style={[styles.licenseDescription, { color: colors.textTertiary }]}>
                  Icon library for React Native applications.
                </Text>
              </View>
              
              <View style={styles.licenseItem}>
                <Text style={[styles.licenseTitle, { color: colors.text }]}>React Native SVG</Text>
                <Text style={[styles.licenseText, { color: colors.textSecondary }]}>MIT License</Text>
                <Text style={[styles.licenseDescription, { color: colors.textTertiary }]}>
                  SVG support for React Native applications.
                </Text>
              </View>
              
              <View style={styles.licenseItem}>
                <Text style={[styles.licenseTitle, { color: colors.text }]}>React Native Gesture Handler</Text>
                <Text style={[styles.licenseText, { color: colors.textSecondary }]}>MIT License</Text>
                <Text style={[styles.licenseDescription, { color: colors.textTertiary }]}>
                  Native touch and gesture system for React Native.
                </Text>
              </View>
              
              <View style={styles.licenseItem}>
                <Text style={[styles.licenseTitle, { color: colors.text }]}>React Native Safe Area Context</Text>
                <Text style={[styles.licenseText, { color: colors.textSecondary }]}>MIT License</Text>
                <Text style={[styles.licenseDescription, { color: colors.textTertiary }]}>
                  Safe area handling for React Native applications.
                </Text>
              </View>
              
              <View style={styles.licenseItem}>
                <Text style={[styles.licenseTitle, { color: colors.text }]}>React Native Screens</Text>
                <Text style={[styles.licenseText, { color: colors.textSecondary }]}>MIT License</Text>
                <Text style={[styles.licenseDescription, { color: colors.textTertiary }]}>
                  Screen management for React Navigation.
                </Text>
              </View>
              
              <View style={styles.licenseItem}>
                <Text style={[styles.licenseTitle, { color: colors.text }]}>Expo File System</Text>
                <Text style={[styles.licenseText, { color: colors.textSecondary }]}>MIT License</Text>
                <Text style={[styles.licenseDescription, { color: colors.textTertiary }]}>
                  File system access for Expo applications.
                </Text>
              </View>
              
              <View style={styles.licenseItem}>
                <Text style={[styles.licenseTitle, { color: colors.text }]}>Expo Sharing</Text>
                <Text style={[styles.licenseText, { color: colors.textSecondary }]}>MIT License</Text>
                <Text style={[styles.licenseDescription, { color: colors.textTertiary }]}>
                  For data export functionality.
                </Text>
              </View>
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.sendButton}
                onPress={() => setLicenseModalVisible(false)}
              >
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  style={styles.sendButtonGradient}
                >
                  <Text style={styles.sendButtonText}>Close</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* App Lock Setup Modal */}
      <Modal
        visible={appLockSetupVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setAppLockSetupVisible(false)}
      >
        <AppLockScreen
          isSetup={true}
          onSetupComplete={async (pin: string) => {
            const success = await enableAppLock(pin);
            if (success) {
              await loadAppLockStatus();
              setAppLockSetupVisible(false);
              Alert.alert('Success', 'App lock has been enabled.');
            } else {
              Alert.alert('Error', 'Failed to enable app lock. Please try again.');
            }
          }}
          onUnlock={() => {}} // Not used in setup mode
        />
      </Modal>

      {/* App Lock Change PIN Modal */}
      <Modal
        visible={appLockChangePinVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setAppLockChangePinVisible(false)}
      >
        <AppLockScreen
          isSetup={true}
          onSetupComplete={async (newPin: string) => {
            // For changing PIN, we need the old PIN first
            // This is a simplified version - you might want a two-step process
            Alert.alert(
              'Change PIN',
              'To change your PIN, please disable and re-enable app lock.',
              [
                {
                  text: 'OK',
                  onPress: () => setAppLockChangePinVisible(false),
                },
              ]
            );
          }}
          onUnlock={() => {}} // Not used in setup mode
        />
      </Modal>
    </ScrollView>
  );
};

export default SettingsScreen; 