# React Native Communication App - Build & Deployment Guide

## 🔴 Current Build Issues Summary

Your Android EAS build is failing at the Gradle compilation phase with:
```
Gradle build failed with unknown error. See logs for the "Run gradlew" phase
```

## 🔧 Fixes Applied

### 1. ✅ Lock File Synchronization
- Generated `package-lock.json` for npm ci compatibility
- EAS uses npm in CI/CD, but you use pnpm locally
- Both lock files now in sync

### 2. ✅ Gradle Configuration Updates
- **android/build.gradle**: Added missing ext block with SDK versions
  - compileSdk: 34
  - minSdk: 24
  - targetSdk: 34
  - buildToolsVersion: 34.0.0

- **Gradle classpath versions**:
  - gradle: 8.1.2
  - react-native-gradle-plugin: 0.73.4
  - kotlin-gradle-plugin: 1.9.10

### 3. ✅ Hermes Engine Disabled
Changed in `android/gradle.properties`:
```properties
hermesEnabled=false
```
**Reason**: Hermes compilation can fail on free tier builds. JSC is used as fallback.

### 4. ✅ Memory Optimization
Reduced JVM heap for EAS free tier:
```properties
# Before: -Xmx2048m -XX:MaxMetaspaceSize=512m
# After: -Xmx1536m -XX:MaxMetaspaceSize=384m
org.gradle.jvmargs=-Xmx1536m -XX:MaxMetaspaceSize=384m
```

---

## 🚀 Next Steps to Try

### Option 1: Wait for Current Build (Recommended)
The build is now queued. Free tier builds can take 5-15 minutes.

**Status**: Monitor at https://expo.dev/accounts/ssjoy43/projects/communication-app/builds

### Option 2: Retry with Current Config
```bash
eas build --platform android --profile preview
```

### Option 3: Local Test Build (If Android SDK installed)
```bash
eas build --platform android --profile preview --local
```

### Option 4: Switch to Release Build
Update `eas.json` profile to use production signing:
```json
"preview": {
  "distribution": "internal",
  "android": {
    "buildType": "apk",
    "gradleCommand": ":app:assembleDebug"
  }
}
```

---

## 🏗️ Development Workflow

### Add Dependencies
```bash
pnpm add package-name
npm install --package-lock-only  # Sync for EAS
git add package.json pnpm-lock.yaml package-lock.json
```

### Test Locally
```bash
npm run start  # Start Expo dev server
```

### Build APK for Testing
```bash
eas build --platform android --profile preview
```

### Deploy to Production
```bash
eas build --platform android --profile production
eas submit --platform android --latest
```

---

## 📋 Gradle Configuration Details

### android/build.gradle
```groovy
ext {
  buildToolsVersion = "34.0.0"
  minSdkVersion = 24
  compileSdkVersion = 34
  targetSdkVersion = 34
  ndkVersion = "26.1.10909125"
}
```

### android/gradle.properties (Key Settings)
```properties
# Memory
org.gradle.jvmargs=-Xmx1536m -XX:MaxMetaspaceSize=384m

# Architectures
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64

# Features
newArchEnabled=true
hermesEnabled=false           # Disabled (was: true)
edgeToEdgeEnabled=true
expo.gif.enabled=true
expo.webp.enabled=true
expo.webp.animated=false

# Packaging
expo.useLegacyPackaging=false

# Development
EX_DEV_CLIENT_NETWORK_INSPECTOR=true
```

---

## 🔍 If Build Still Fails

### Check EAS Build Logs
1. Go to https://expo.dev/accounts/ssjoy43/projects/communication-app/builds
2. Click on failed build
3. Download full logs
4. Look for:
   - Gradle errors (`FAILURE`)
   - Native compilation errors
   - Missing dependencies
   - Memory issues

### Common Gradle Errors

**Error**: `Compilation failed for app`
- **Cause**: Native module compilation issue
- **Fix**: Disable that module temporarily

**Error**: `Out of memory`
- **Cause**: JVM heap too small
- **Fix**: Already optimized (Xmx1536m)

**Error**: `Cannot resolve dependency`
- **Cause**: npm/pnpm lock out of sync
- **Fix**: Already fixed (generated package-lock.json)

---

## 📱 Testing the APK

Once build succeeds:

1. **Download APK** from EAS dashboard
2. **Install on device**:
   ```bash
   adb install -r app.apk
   ```
3. **Test Features**:
   - ✅ Login (with empty FCM token in dev)
   - ✅ Navigation
   - ✅ WebRTC calls
   - ✅ Messaging
   - ⚠️ Push notifications (requires production Firebase setup)

---

## 🎯 Path to Production

### Phase 1: Get Build Working
- [x] Fix lock files
- [x] Fix Gradle config
- [ ] **Successful build** (in progress)

### Phase 2: Test on Device
- [ ] Download APK
- [ ] Install on Android device
- [ ] Test core functionality

### Phase 3: Firebase Setup (Production)
- [ ] Verify FCM tokens are retrieved
- [ ] Test push notifications
- [ ] Verify device records created

### Phase 4: Production Release
- [ ] Configure signing keys
- [ ] Build production APK
- [ ] Submit to Google Play Store

---

## 🆘 Support Resources

- **Expo Docs**: https://docs.expo.dev
- **React Native**: https://reactnative.dev
- **Firebase**: https://firebase.google.com/docs
- **EAS Docs**: https://docs.expo.dev/eas/

---

**Last Updated**: April 6, 2026
**Status**: Build fixes applied, awaiting build result
**Next Check**: Monitor EAS dashboard for build status
