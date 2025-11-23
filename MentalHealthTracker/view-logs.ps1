# PowerShell script to view APK logs
# Usage: .\view-logs.ps1

Write-Host "=== Mental Health Tracker - Log Viewer ===" -ForegroundColor Cyan
Write-Host ""

# Check if ADB is available
$adbPath = Get-Command adb -ErrorAction SilentlyContinue

if (-not $adbPath) {
    Write-Host "ADB (Android Debug Bridge) is not installed or not in PATH." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To install ADB:" -ForegroundColor Cyan
    Write-Host "1. Download Android SDK Platform Tools from:" -ForegroundColor White
    Write-Host "   https://developer.android.com/tools/releases/platform-tools" -ForegroundColor Green
    Write-Host ""
    Write-Host "2. Extract to a folder (e.g., C:\Android\platform-tools)" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Add to PATH:" -ForegroundColor White
    Write-Host "   - Open System Properties → Environment Variables" -ForegroundColor White
    Write-Host "   - Add C:\Android\platform-tools to PATH" -ForegroundColor White
    Write-Host "   - Restart terminal" -ForegroundColor White
    Write-Host ""
    Write-Host "Alternatively, you can:" -ForegroundColor Cyan
    Write-Host "- Use Chrome DevTools (chrome://inspect)" -ForegroundColor White
    Write-Host "- Use a log viewer app on your device" -ForegroundColor White
    Write-Host "- Check the VIEW_APK_LOGS.md file for more options" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "ADB found! Checking for connected devices..." -ForegroundColor Green
Write-Host ""

# Check for connected devices
$devices = adb devices
Write-Host $devices

if ($devices -notmatch "device$") {
    Write-Host ""
    Write-Host "No devices found!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Cyan
    Write-Host "1. Your Android device is connected via USB" -ForegroundColor White
    Write-Host "2. USB Debugging is enabled (Settings → Developer Options)" -ForegroundColor White
    Write-Host "3. You've accepted the USB debugging prompt on your device" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Device connected! Choose an option:" -ForegroundColor Green
Write-Host ""
Write-Host "1. View all logs (filtered by app)" -ForegroundColor Cyan
Write-Host "2. View React Native logs only" -ForegroundColor Cyan
Write-Host "3. View errors only" -ForegroundColor Cyan
Write-Host "4. View logs with timestamps" -ForegroundColor Cyan
Write-Host "5. Save logs to file" -ForegroundColor Cyan
Write-Host "6. Clear logs and start fresh" -ForegroundColor Cyan
Write-Host ""

$choice = Read-Host "Enter your choice (1-6)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Viewing logs filtered by app..." -ForegroundColor Green
        Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
        Write-Host ""
        adb logcat | Select-String "com.mentalhealthtracker|ReactNative|ReactNativeJS"
    }
    "2" {
        Write-Host ""
        Write-Host "Viewing React Native logs..." -ForegroundColor Green
        Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
        Write-Host ""
        adb logcat *:S ReactNative:V ReactNativeJS:V
    }
    "3" {
        Write-Host ""
        Write-Host "Viewing errors only..." -ForegroundColor Green
        Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
        Write-Host ""
        adb logcat *:E
    }
    "4" {
        Write-Host ""
        Write-Host "Viewing logs with timestamps..." -ForegroundColor Green
        Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
        Write-Host ""
        adb logcat -v time | Select-String "com.mentalhealthtracker|ReactNative|ReactNativeJS"
    }
    "5" {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $filename = "app_logs_$timestamp.txt"
        Write-Host ""
        Write-Host "Saving logs to $filename..." -ForegroundColor Green
        Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
        Write-Host ""
        adb logcat | Select-String "com.mentalhealthtracker|ReactNative|ReactNativeJS" | Tee-Object -FilePath $filename
        Write-Host ""
        Write-Host "Logs saved to $filename" -ForegroundColor Green
    }
    "6" {
        Write-Host ""
        Write-Host "Clearing logs..." -ForegroundColor Green
        adb logcat -c
        Write-Host "Logs cleared! Now viewing new logs..." -ForegroundColor Green
        Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
        Write-Host ""
        adb logcat | Select-String "com.mentalhealthtracker|ReactNative|ReactNativeJS"
    }
    default {
        Write-Host "Invalid choice!" -ForegroundColor Red
    }
}

