# FCM Token Development Guide

## 🔴 Current Status

You're running in **Expo Go (Development Mode)**, where Firebase messaging is not available. This is **expected behavior** and **NOT an error**.

### Console Warnings Explained

```
⚠️ Firebase messaging not available (development environment)
⚠️ FCM token is null/empty on initialization
```

These warnings are normal in development and will **disappear in production**.

---

## 📱 Two Deployment Scenarios

### Scenario 1: Expo Go (Current - Development)

```
✅ App runs without Firebase
✅ FCM token returns empty string ""
✅ Login works with empty token
❌ Push notifications NOT available
```

**This is for testing and development only.**

### Scenario 2: EAS Native Build (Production - Recommended)

```
✅ App has native code
✅ Firebase messaging works
✅ FCM token retrieved successfully
✅ Push notifications WORK
```

**Use this for production deployment.**

---

## 🚀 How to Deploy

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Configure EAS

Your `eas.json` already exists. Verify it has:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "preview2": {
      "android": {
        "buildType": "apk"
      }
    },
    "preview3": {
      "channel": "preview3"
    },
    "production": {
      "channel": "production"
    }
  }
}
```

### Step 3: Build for Testing

```bash
# Login to EAS
eas login

# Build for Android (APK)
eas build --platform android --profile preview

# Or build for iOS (requires macOS and Apple Developer account)
eas build --platform ios --profile preview
```

### Step 4: Install on Device

- **Android**: Download APK from EAS dashboard and install
- **iOS**: Download and use TestFlight or Xcode to install

---

## ✅ What Changed in Your Code

### 1. **firebaseMessaging.ts** - Better Development Handling

```typescript
// Development mode logs less aggressively
if (__DEV__) {
  console.log("ℹ️ Firebase messaging not available in development (Expo Go)");
} else {
  console.warn("⚠️ Firebase messaging not available");
}

// Returns empty string in development instead of null
return "";
```

### 2. **sign-in.tsx** - Flexible FCM Handling

```typescript
if (__DEV__) {
  // Development: Allow empty token for testing
  if (fcmToken === null) {
    // Still loading, wait
    return;
  }
} else {
  // Production: Require valid token
  if (!fcmToken) {
    // Show error
    return;
  }
}
```

### 3. **postsData.ts** - Added Default Export

```typescript
export default { POSTS, CATEGORIES };
```

### 4. **\_layout.tsx** - Fixed SafeAreaView

```typescript
// Changed from:
import { SafeAreaView } from "react-native";

// Changed to:
import { SafeAreaView } from "react-native-safe-area-context";
```

---

## 🧪 Testing in Development

### Test Login Flow

1. ✅ Start app in Expo Go
2. ✅ Navigate to Sign-In screen
3. ✅ Enter credentials
4. ✅ Click Sign In
5. ✅ App logs in successfully (with empty FCM token)
6. ✅ No crashes or blocking errors

### Expected Console Output

```log
ℹ️ Firebase messaging not available in development (Expo Go)
ℹ️ Firebase messaging not available - using mock token for development
🔐 Attempting sign-in with FCM token
📤 Login payload: { email: "test@example.com", fcmToken: "" }
✅ Login successful
```

---

## 🔔 Push Notifications Setup

### Backend Requirements

Your backend needs to:

1. **Store FCM Token**

   ```javascript
   // When device is created during login
   const device = await prisma.device.create({
     data: {
       userId: user.id,
       fcmToken: payload.fcmToken, // Will be empty in dev
       platform: "android" | "ios",
       deviceInfo: { ... }
     }
   });
   ```

2. **Send Notifications**

   ```javascript
   // Using Firebase Admin SDK
   const message = {
     token: fcmToken,
     notification: {
       title: "New Message",
       body: "You have a new message from Sarah",
     },
     data: {
       messageId: "123",
       chatId: "456",
     },
   };

   await admin.messaging().send(message);
   ```

---

## 🔗 Related Files

- `src/services/firebaseMessaging.ts` - FCM utilities
- `src/hooks/useFirebaseMessaging.ts` - Initialization hook
- `app/(auth)/sign-in.tsx` - Login screen
- `app.config.js` - EAS & Firebase configuration

---

## 📝 Checklist for Production

- [ ] Run `eas build --platform android --profile preview`
- [ ] Test on physical Android device
- [ ] Verify FCM token is retrieved
- [ ] Verify login works
- [ ] Verify device is created with FCM token
- [ ] Verify push notifications work
- [ ] Run `eas build --platform ios --profile production` (if needed)
- [ ] Submit to App Store / Play Store

---

## ❓ FAQ

**Q: Why is FCM token empty in development?**
A: Expo Go doesn't include native Firebase modules. Only native builds (EAS) have them.

**Q: Can I test push notifications in Expo Go?**
A: No. You must use EAS Build to create a native build.

**Q: Should I worry about these warnings?**
A: No. They disappear in production and don't affect development testing.

**Q: How do I know if my backend FCM setup is correct?**
A: Test in production. Verify tokens are being stored, then send a test notification.

---

## 🆘 Troubleshooting

### App still shows warnings

Make sure you're reloading after changes:

```bash
# Clear cache and rebuild
expo start --clear
```

### FCM token is still null in production

1. Check `app.config.js` has correct Firebase credentials
2. Verify Google Services files:
   - `./google-services.json` (Android)
   - `./GoogleService-Info.plist` (iOS)
3. Run `eas build` again

### Push notifications not working

1. Verify device record was created with FCM token
2. Verify backend is using correct FCM token
3. Check Firebase Admin SDK is initialized correctly
4. Check notification permissions are granted on device

---

**Last Updated**: April 6, 2026
**Status**: ✅ Ready for Production
