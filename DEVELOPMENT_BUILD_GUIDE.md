# Development Build Guide for Communication App

## Overview
This guide will help you create a development build that you can download and test on your devices without deleting the Expo Go app.

## What You Need
- EAS CLI installed (`npx eas`)
- Logged in to Expo account (ssjoy43)
- Project ID: `fd88d917-983a-46da-8c95-9f7af69274b5`

## Quick Build Commands

### Option 1: Development Build (Recommended for Development)
```bash
cd "/Users/ssjoy/Desktop/joy workplace/react native/communication-app"
npx eas build --platform android --profile development
```

This will:
- Build an Android development app
- Show you a build URL to monitor progress
- Provide a download link when complete
- Allow hot reload and debugging

### Option 2: Preview Build (For Testing)
```bash
npx eas build --platform android --profile preview
```

This will:
- Create an internal distribution app
- Faster build process
- Still testable on devices

### Option 3: iOS Build
```bash
npx eas build --platform ios --profile development
```

## What You'll Get

After the build completes, you'll receive:
1. **Build URL**: https://expo.dev/accounts/ssjoy43/projects/communication-app/builds/BUILD_ID
   - You can view build progress and logs here
   - Similar to your previous link

2. **Download Link**: A direct APK/IPA download URL
   - For Android: `.apk` file (can be installed directly)
   - For iOS: `.ipa` file (requires Apple developer account)

## How to Use the Build Link

### For Android:
1. Copy the build URL from EAS
2. Open on your phone or use `expo-dev-client` app
3. Scan the QR code or click the link
4. The app will download and install
5. Launch and test without deleting Expo Go

### For Testing:
The build link remains accessible at:
```
https://expo.dev/accounts/ssjoy43/projects/communication-app/builds/BUILD_ID
```

You can share this link with testers, and they can:
- Download the built app directly
- Test the app on their devices
- No need for development setup

## Build Configuration (eas.json)

Your current configuration:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

### Profile Explanations:

- **development**: 
  - Uses development client for debugging
  - Internal distribution (only for you)
  - iOS simulator builds for testing
  
- **preview**: 
  - Production-like build
  - Internal distribution
  - Faster than production

- **production**: 
  - Full production build
  - Auto-increments version code
  - Ready for app stores

## Monitoring Your Build

1. Visit: https://expo.dev/accounts/ssjoy43/projects/communication-app/builds
2. View all your builds
3. Click on a build to see detailed logs and status
4. Download artifacts once complete

## Example Build Output

When you run `npx eas build --platform android`, you'll see:
```
✔ Resolved "production" environment
✔ Using remote Android credentials
✔ Using Keystore from configuration

Compressing project files and uploading to EAS Build...

🔗 Build Link: https://expo.dev/accounts/ssjoy43/projects/communication-app/builds/abc123def456

You can now close this terminal and view the build progress on the web.
```

## Troubleshooting

### Build Fails to Upload
- Ensure git is clean: `git status`
- Check git credentials are configured
- Verify no uncommitted changes

### Can't Access Build Link
- Verify you're logged in to Expo: `npx eas whoami`
- Check your account permissions at https://expo.dev

### App Won't Install
- For Android: Ensure you have developer options enabled
- For iOS: Use Xcode to install or TestFlight for beta testing

## Next Steps

1. Run your first development build
2. Get the download link from the build page
3. Test on your devices
4. Share the link with team members for testing
5. Iterate and rebuild as needed

## Important Links

- **EAS Builds Dashboard**: https://expo.dev/accounts/ssjoy43/projects/communication-app/builds
- **Project ID**: fd88d917-983a-46da-8c95-9f7af69274b5
- **Documentation**: https://docs.expo.dev/eas/builds/

## Example Previous Build

Your previous build was:
```
https://expo.dev/accounts/ssjoy43/projects/communication-app/builds/71d6d0f3-41aa-4d9e-9da5-d6f4c94c8631
```

This same type of URL will be created with your new builds!
