# Troubleshooting Guide

## If you still see warnings/errors after the fixes:

### 1. Clear all caches and rebuild

```bash
npm run clean  # Uses the existing clean script
npm install
npm run prebuild  # Regenerate native code
```

### 2. If Firebase module error still appears:

```bash
# iOS (macOS)
cd ios && pod install && cd ..

# Android
./gradlew clean  # in android folder
```

### 3. If import errors appear:

1. Check if you're importing from the correct path
2. Make sure the file exists in the `src/` directory
3. The relative path count matters:
   - From `app/_layout.tsx` → use `../src/...` (one level up)
   - From `app/(auth)/sign-in.tsx` → use `../../src/...` (two levels up)

### 4. Clear Metro bundler cache:

```bash
npx expo start --clear
```

### 5. Verify folder structure:

```bash
# Check that shared code is NOT in app folder
ls app/
# Should only show: _layout.tsx, index.tsx, global.css, (auth)/, (chat-detail)/, (posts)/, (root)/, (start)/

# Check that src folder exists with all shared code
ls src/
# Should show: components/, constants/, contexts/, hooks/, redux/, services/, types/, utils/
```

## Common Import Errors and Fixes

### Error: "Cannot find module '../redux/hook'"

- You're in a route file and importing with old path
- **Fix**: Add `../../src/` before the import path

  ```typescript
  // ❌ Wrong
  import { useAppDispatch } from "../redux/hook";

  // ✅ Correct
  import { useAppDispatch } from "../../src/redux/hook";
  ```

### Error: "RNFBAppModule not found"

- Firebase native modules not properly linked
- **Fix**:
  ```bash
  npm run clean
  npm install
  npm run prebuild
  npm start
  ```

### Warning: "Route is missing the required default export"

- A file in the `app/` folder doesn't export a React component
- **Fix**: Move the file to `src/` and update import paths
  - Check if the file should be a route (if not, move it to `src/`)
  - If it should be a route, ensure it exports a default React component

## File Location Checklist

✅ **Should be in `app/`:**

- Route files (screens)
- `_layout.tsx` files
- Global styles (`global.css`)

✅ **Should be in `src/`:**

- React components (that aren't route files)
- Custom hooks
- Context providers
- Redux store and slices
- Service utilities
- Type definitions
- Constants
- Utils/helpers

## Testing

After applying fixes, test with:

```bash
# Start dev server
npm start

# Test specific platforms
npm run android
npm run ios
npm run web
```

Look for these in the terminal output:

- ✅ No "WARN Route" messages
- ✅ No "ERROR Native module RNFBAppModule not found"
- ✅ "Metro Bundler finished building" or similar success message
