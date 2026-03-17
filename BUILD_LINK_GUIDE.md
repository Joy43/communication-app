# How to Create Development Build Links for Testing

## The Issue
Due to spaces in your local project path, EAS Build CLI is having trouble uploading files. However, you can still create builds and get download links!

## Solution: Use Web Dashboard

### Method 1: Web-Based Build (Recommended)

1. Go to your EAS Builds Dashboard:
   ```
   https://expo.dev/accounts/ssjoy43/projects/communication-app/builds
   ```

2. Click **"Create a Build"** button

3. Select your build options:
   - **Platform**: Android
   - **Build Profile**: development
   - **Credentials**: Use existing

4. Click **"Create"** and the build will start

5. You'll get a build link like:
   ```
   https://expo.dev/accounts/ssjoy43/projects/communication-app/builds/BUILD_ID
   ```

### Method 2: Git-Based Push Build

Since your code is on GitHub, you can trigger builds through Expo's Git integration:

1. Push your latest code to GitHub:
   ```bash
   cd "/Users/ssjoy/Desktop/joy workplace/react native/communication-app"
   git add -A
   git commit -m "Development updates"
   git push origin main
   ```

2. Go to https://expo.dev/accounts/ssjoy43

3. Find your project and click on it

4. Go to the **Builds** tab

5. Click **"Create a Build"** with your GitHub branch

6. Select:
   - Platform: **Android**
   - Profile: **development**
   - Branch: **main**

7. The build will start and give you the download link

## What You'll Get

After the build completes:

### Build Link Example:
```
https://expo.dev/accounts/ssjoy43/projects/communication-app/builds/abc123def456
```

### This link allows you to:
- Download the APK directly
- Share with team members
- View build logs
- See build status and progress
- Download artifacts once complete

## Quick Access Links

- **Your EAS Dashboard**: https://expo.dev/accounts/ssjoy43/projects/communication-app/builds
- **Project ID**: fd88d917-983a-46da-8c95-9f7af69274b5
- **GitHub Repo**: https://github.com/Joy43/communication-app

## Example Build Links for Testing

Your previous build (same format as new ones):
```
https://expo.dev/accounts/ssjoy43/projects/communication-app/builds/71d6d0f3-41aa-4d9e-9da5-d6f4c94c8631
```

## Fixing the Path Issue (Optional)

If you want to fix the CLI build issue permanently, you can:

1. Rename your folder to remove spaces:
   ```bash
   cd /Users/ssjoy/Desktop
   mv "joy workplace/react native/communication-app" joy-workplace-app
   ```

2. Then use the CLI normally:
   ```bash
   cd /Users/ssjoy/Desktop/joy-workplace-app
   npx eas build --platform android
   ```

## Steps to Get Your Download Link Today

1. **Open**: https://expo.dev/accounts/ssjoy43/projects/communication-app/builds

2. **Click**: "Create a Build" button

3. **Select**: 
   - Platform: Android
   - Profile: development

4. **Wait**: For build to complete (usually 10-15 minutes)

5. **Download**: Get your APK or IPA from the build details page

6. **Share**: Send the build link to anyone who needs to test

## Testing Your Build

### On Android:
1. Download the APK from the build link
2. Enable "Unknown Sources" in settings
3. Install the APK
4. Open and test
5. Rebuild when you make changes

### With Expo Go:
1. Use the build link QR code
2. Scan with your phone
3. Tap to download development client
4. Run your latest code

## Support

For more information:
- EAS Docs: https://docs.expo.dev/eas/builds/
- Troubleshooting: https://docs.expo.dev/eas/builds/troubleshooting/
