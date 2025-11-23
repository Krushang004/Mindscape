# How to View APK Logs

## Method 1: Using ADB (Android Debug Bridge) - Recommended

### Step 1: Install Android SDK Platform Tools

1. Download Android SDK Platform Tools from:
   https://developer.android.com/tools/releases/platform-tools

2. Extract to a folder (e.g., `C:\Android\platform-tools`)

3. Add to PATH:
   - Open System Properties → Environment Variables
   - Add `C:\Android\platform-tools` to PATH
   - Restart terminal

### Step 2: View Logs

```bash
# Connect your device via USB and enable USB debugging
# Then run:

# Clear previous logs
adb logcat -c

# View all logs (filtered by your app)
adb logcat | findstr "com.mentalhealthtracker"

# Or view React Native logs specifically
adb logcat *:S ReactNative:V ReactNativeJS:V

# View all logs with timestamps
adb logcat -v time

# Save logs to file
adb logcat > app_logs.txt
```

## Method 2: Using Expo Logs (If using Expo Go or Development Build)

```bash
# In your project directory
npx expo start

# Logs will appear in the terminal
# Press 'j' to open debugger
# Press 'm' to toggle menu
```

## Method 3: Using React Native Log Viewer

```bash
# Install react-native-log-viewer globally
npm install -g react-native-log-viewer

# Then run
npx react-native log-android
```

## Method 4: Using a Log Viewer App on Device

1. Install a log viewer app from Play Store:
   - **Log Viewer** by Scott Warner
   - **aLogcat** (Root required)
   - **Logcat Reader**

2. Open the app and filter by package name: `com.mentalhealthtracker`

## Method 5: Remote Logging (Recommended for Production Debugging)

Add remote logging to your app to send logs to a server or service.

### Quick Setup with Console Logging

Your app already has console.log statements. To see them:

1. **Using Chrome DevTools:**
   ```bash
   # Connect device
   adb devices
   
   # Forward port
   adb reverse tcp:8081 tcp:8081
   
   # Open Chrome and go to:
   chrome://inspect
   ```

2. **Using Flipper (Facebook's Debugging Tool):**
   - Install Flipper: https://fbflipper.com/
   - Connect device
   - View logs in Flipper interface

## Method 6: View Logs from EAS Build

If you built with EAS, you can view build logs:

```bash
# View build logs
eas build:view

# Or check online at:
# https://expo.dev/accounts/krushang_04/projects/mental-health-tracker/builds
```

## Filtering Logs

### Common Filters:

```bash
# React Native specific
adb logcat | findstr "ReactNative"

# JavaScript errors
adb logcat | findstr "ReactNativeJS"

# Your app's console.log
adb logcat | findstr "console"

# Errors only
adb logcat *:E

# Warnings and errors
adb logcat *:W

# All levels
adb logcat *:V
```

### Filter by Tag:

```bash
# Filter by your app package
adb logcat | findstr "com.mentalhealthtracker"

# Filter by React Native
adb logcat | findstr "ReactNative"
```

## Enable USB Debugging on Android Device

1. Go to Settings → About Phone
2. Tap "Build Number" 7 times to enable Developer Options
3. Go to Settings → Developer Options
4. Enable "USB Debugging"
5. Connect device via USB
6. Accept the USB debugging prompt on your device

## Troubleshooting

### "adb: command not found"
- Install Android SDK Platform Tools (see Method 1)
- Add to PATH environment variable

### "No devices found"
- Enable USB Debugging on device
- Install USB drivers for your device
- Try different USB cable/port
- Check `adb devices` to see if device is listed

### "Device unauthorized"
- Check device screen for authorization prompt
- Click "Allow" or "Always allow from this computer"

## Quick Reference Commands

```bash
# Check connected devices
adb devices

# Clear logs
adb logcat -c

# View logs (all)
adb logcat

# View logs (filtered by app)
adb logcat | findstr "com.mentalhealthtracker"

# View logs (React Native only)
adb logcat *:S ReactNative:V ReactNativeJS:V

# Save logs to file
adb logcat > logs_$(date +%Y%m%d_%H%M%S).txt

# View logs with timestamps
adb logcat -v time

# View only errors
adb logcat *:E
```

