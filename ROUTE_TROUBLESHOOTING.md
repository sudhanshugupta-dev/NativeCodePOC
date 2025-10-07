# Route Navigation Troubleshooting Guide

## Issues Fixed ✅

### 1. **TypeScript Configuration**
- Fixed syntax error in `tsconfig.json` (trailing comma issue)
- Added proper path mapping for better module resolution
- Added `baseUrl` and improved `paths` configuration

### 2. **Import Path Issues**
- Fixed imports in `app/(register)/index.tsx` and `app/(verify)/index.tsx`
- Changed from direct file imports to index exports:
  ```typescript
  // ❌ BEFORE
  import RegisterContainer from '../../src/screens/register/RegisterContainer';
  
  // ✅ AFTER  
  import RegisterContainer from '../../src/screens/register';
  ```

### 3. **Component Export Issues**
- Fixed function name mismatch in `RegisterContainer.tsx`
- Changed from `RegisterScreen` to `RegisterContainer` to match file name

### 4. **Route Layout Configuration**
- Improved route ordering in `_layout.tsx`
- Added explicit presentation mode for register/verify screens
- Set proper screen options

## Current File Structure ✅

All required files exist:
```
app/
├── _layout.tsx
├── index.tsx
├── (register)/
│   └── index.tsx
├── (verify)/
│   └── index.tsx
└── ...other routes

src/
└── screens/
    ├── register/
    │   ├── index.ts
    │   └── RegisterContainer.tsx
    └── verify/
        ├── index.ts
        └── VerifyContainer.tsx
```

## How to Test and Troubleshoot

### 1. **Clear Cache and Rebuild**
```bash
# Clear Expo cache
npx expo start -c

# Or clear React Native cache
npx react-native start --reset-cache

# Clean Android build
cd android && ./gradlew clean && cd ..

# Rebuild the app
npx expo run:android
```

### 2. **Test Route Navigation**
You can use the debug index file created at `app/debug-index.tsx`:

1. Temporarily rename your `app/index.tsx` to `app/index-backup.tsx`
2. Rename `app/debug-index.tsx` to `app/index.tsx`
3. Run the app and test the navigation buttons
4. Check the console logs for any navigation errors

### 3. **Check for Common Issues**

#### Metro Bundler Issues:
```bash
# Kill any running Metro processes
pkill -f metro

# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Expo cache
npx expo start -c
```

#### Expo Router Issues:
```bash
# Check Expo Router version
npm list expo-router

# If outdated, update:
npx expo install expo-router@latest
```

### 4. **Debug Console Logs**
When testing navigation, look for these in your console:

**Successful navigation:**
```
Attempting to navigate to: /(register)
[Navigation successful]
```

**Failed navigation:**
```
Navigation error for /(register): [Error details]
```

## Possible Remaining Issues

### 1. **Metro Configuration**
If routes still don't work, create/update `metro.config.js`:

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable symlinks
config.resolver.unstable_enableSymlinks = true;

// Add src to watched folders
config.watchFolders = [
  ...config.watchFolders,
  require('path').resolve(__dirname, 'src')
];

module.exports = config;
```

### 2. **Expo Development Build**
If using custom native modules (like FaceRecognizer), ensure you're using a development build, not Expo Go:

```bash
# Create development build
eas build --profile development --platform android

# Or run local development build
npx expo run:android
```

### 3. **TypeScript Path Resolution**
If imports still fail, you can try absolute imports:

```typescript
// Instead of relative imports
import RegisterContainer from '../../src/screens/register';

// Use absolute imports with @ alias
import RegisterContainer from '@/src/screens/register';
```

## Testing Steps

1. **Start the development server:**
   ```bash
   npx expo start -c
   ```

2. **Run on Android:**
   ```bash
   npx expo run:android
   ```

3. **Test navigation:**
   - Tap "Register Face" and "Verify Face" buttons
   - Check if screens load properly
   - Verify console logs for any errors

4. **Check specific functionality:**
   - Camera permissions (for image capture)
   - Navigation between screens
   - FaceAPI module availability

## Quick Fix Commands

Run these commands in sequence if routes are still not working:

```bash
# 1. Clean everything
rm -rf node_modules .expo android/build android/.gradle
npm install

# 2. Clear Metro cache
npx expo start -c --clear

# 3. Rebuild native code
npx expo run:android

# 4. If still issues, reset Expo
npx expo install --fix
```

## Final Notes

- Ensure you're not using Expo Go for testing (custom native modules require development build)
- Check device/emulator logs for additional error information
- Verify camera permissions are properly configured in `app.json`

The routes should now work properly after the fixes applied! 🚀
