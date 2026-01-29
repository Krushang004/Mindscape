# Fix NDK Build Error

## Problem
```
[CXX1101] NDK at C:\Users\krush\AppData\Local\Android\Sdk\ndk\27.1.12297006 did not have a source.properties file
```

The NDK installation is corrupted or incomplete.

## Solution 1: Delete Corrupted NDK (Recommended)

I've already deleted the corrupted NDK. Gradle will automatically download it on the next build.

**Next steps:**
1. Run the build again:
   ```bash
   npx expo run:android
   ```
2. Gradle will automatically download the correct NDK version

## Solution 2: Reinstall NDK via Android Studio

If Solution 1 doesn't work:

1. Open **Android Studio**
2. Go to: **Tools** → **SDK Manager**
3. Click the **SDK Tools** tab
4. Check **Show Package Details**
5. Find **NDK (Side by side)**
6. Uncheck **27.1.12297006** (if checked)
7. Click **Apply** to uninstall
8. Check **27.1.12297006** again
9. Click **Apply** to reinstall
10. Wait for installation to complete
11. Try building again

## Solution 3: Use Command Line SDK Manager

If you have `sdkmanager` in your PATH:

```bash
# List installed NDK versions
sdkmanager --list | findstr "ndk"

# Uninstall corrupted NDK
sdkmanager --uninstall "ndk;27.1.12297006"

# Reinstall NDK
sdkmanager "ndk;27.1.12297006"
```

## Solution 4: Use a Different NDK Version

If you want to use a different NDK version:

1. Install a different NDK version via Android Studio SDK Manager
2. Add to `android/gradle.properties`:
   ```properties
   android.ndkVersion=26.1.10909125
   ```
   (Replace with your desired version)

## Verify Fix

After applying a solution, verify the NDK is correct:

```powershell
# Check if source.properties exists
Test-Path "C:\Users\krush\AppData\Local\Android\Sdk\ndk\27.1.12297006\source.properties"
```

Should return `True` if the NDK is properly installed.

## Next Steps

1. Try building again: `npx expo run:android`
2. If it still fails, try Solution 2 (Android Studio SDK Manager)
3. If you continue having issues, check the Gradle build output for more details

