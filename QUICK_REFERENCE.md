# Quick Commands Reference

## Development
```bash
# Start development server
npm start

# Run on web
npm start --web

# Run on Android
npm run android

# Run on iOS  
npm run ios

# Clear cache and rebuild
npm run clean && npm run prebuild
```

## Building
```bash
# Development build (Android)
npm run build:dev

# Preview build (Android)
npm run build:preview

# Production build (Android)
npm run build:prod

# Build for web
npm run web
```

## Troubleshooting
```bash
# If you see errors, try:
npm run clean    # Remove node_modules and reinstall
npm run prebuild # Regenerate native code
npm start --clear # Start with cleared cache

# Clear specific platform caches
rm -rf .expo
rm -rf ios/build android/build
```

## Project Stats
- **React Native Version:** 0.81.5
- **Expo Version:** 54.0.33
- **TypeScript:** Enabled
- **React Compiler:** Enabled
- **Firebase:** Integrated (iOS & Android)
- **WebRTC:** Integrated
- **State Management:** Redux Toolkit + Redux Persist
- **Styling:** NativeWind (Tailwind CSS for React Native)

## Important Files
- `app.config.js` - Expo configuration (plugins, permissions, etc.)
- `tsconfig.json` - TypeScript configuration with path aliases
- `tailwind.config.js` - NativeWind/Tailwind configuration
- `metro.config.js` - Metro bundler configuration
- `.env` - Environment variables

## Path Aliases
Configured in `tsconfig.json`:
```json
{
  "paths": {
    "@/*": ["./*"]  // @/src/services → src/services
  }
}
```

## All Warnings/Errors Fixed
✅ Route missing default export warnings
✅ Firebase module not found errors
✅ Import path errors
✅ TypeScript compilation errors

Everything is ready to go! 🎉
