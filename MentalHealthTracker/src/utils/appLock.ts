import AsyncStorage from '@react-native-async-storage/async-storage';

const APP_LOCK_ENABLED_KEY = 'app_lock_enabled';
const APP_LOCK_PIN_KEY = 'app_lock_pin';
const APP_LOCK_LAST_UNLOCK_KEY = 'app_lock_last_unlock';

// Check if app lock is enabled
export const isAppLockEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await AsyncStorage.getItem(APP_LOCK_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    console.error('Error checking app lock status:', error);
    return false;
  }
};

// Enable app lock with PIN
export const enableAppLock = async (pin: string): Promise<boolean> => {
  try {
    if (pin.length < 4) {
      throw new Error('PIN must be at least 4 digits');
    }
    await AsyncStorage.setItem(APP_LOCK_ENABLED_KEY, 'true');
    await AsyncStorage.setItem(APP_LOCK_PIN_KEY, pin);
    await AsyncStorage.setItem(APP_LOCK_LAST_UNLOCK_KEY, new Date().toISOString());
    return true;
  } catch (error) {
    console.error('Error enabling app lock:', error);
    return false;
  }
};

// Disable app lock
export const disableAppLock = async (): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(APP_LOCK_ENABLED_KEY, 'false');
    await AsyncStorage.removeItem(APP_LOCK_PIN_KEY);
    return true;
  } catch (error) {
    console.error('Error disabling app lock:', error);
    return false;
  }
};

// Change PIN
export const changeAppLockPin = async (oldPin: string, newPin: string): Promise<boolean> => {
  try {
    const isValid = await validatePin(oldPin);
    if (!isValid) {
      throw new Error('Current PIN is incorrect');
    }
    if (newPin.length < 4) {
      throw new Error('PIN must be at least 4 digits');
    }
    await AsyncStorage.setItem(APP_LOCK_PIN_KEY, newPin);
    return true;
  } catch (error) {
    console.error('Error changing app lock PIN:', error);
    return false;
  }
};

// Validate PIN
export const validatePin = async (pin: string): Promise<boolean> => {
  try {
    const storedPin = await AsyncStorage.getItem(APP_LOCK_PIN_KEY);
    if (!storedPin) {
      return false;
    }
    return pin === storedPin;
  } catch (error) {
    console.error('Error validating PIN:', error);
    return false;
  }
};

// Record successful unlock
export const recordUnlock = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(APP_LOCK_LAST_UNLOCK_KEY, new Date().toISOString());
  } catch (error) {
    console.error('Error recording unlock:', error);
  }
};

// Check if app should be locked (e.g., after app goes to background)
export const shouldLockApp = async (): Promise<boolean> => {
  try {
    const enabled = await isAppLockEnabled();
    if (!enabled) {
      return false;
    }
    
    // For now, always require PIN when app lock is enabled
    // You can add logic here to check time since last unlock, etc.
    return true;
  } catch (error) {
    console.error('Error checking if app should be locked:', error);
    return false;
  }
};

