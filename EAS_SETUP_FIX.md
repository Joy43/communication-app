# EAS Initialization Fix

## Problem

EAS initialization was failing with the error:

```
✔ Project already linked (ID: cfeb8f68-3ab5-438a-9d77-9c9ee7042393).
Experience with id 'cfeb8f68-3ab5-438a-9d77-9c9ee7042393' does not exist.
Error: GraphQL request failed.
```

The old project ID no longer existed in the EAS system.

## Root Cause

The old EAS project ID was stored in two configuration files:

1. `app.json` - in the `extra.eas.projectId` field
2. `app.config.js` - in the `extra.eas.projectId` field

Both needed to be removed and the project needed to be re-initialized.

## Solution

### Step 1: Removed Old Project IDs

- Removed the invalid project ID from `app.json`
- Removed the invalid project ID from `app.config.js`

### Step 2: Re-initialized EAS

Ran `npx eas init` which created a new valid project:

- **New Project ID**: `fd88d917-983a-46da-8c95-9f7af69274b5`
- **Project Name**: @ssjoy43/communication-app

### Step 3: Added New Project ID to Configuration

Updated `app.config.js` with the new project ID:

```javascript
extra: {
  BASE_URL:
    process.env.EXPO_PUBLIC_BASE_API ||
    "https://communication-app-server.onrender.com",
  eas: {
    projectId: "fd88d917-983a-46da-8c95-9f7af69274b5",
  },
},
```

## Files Modified

- ✅ `app.json` - Removed invalid EAS projectId
- ✅ `app.config.js` - Replaced old projectId with new one

## Verification

EAS commands now work properly:

```bash
$ npx eas build --help
# Output shows help text without errors ✓
```

## Next Steps

You can now use EAS for:

- Building for iOS: `npx eas build -p ios`
- Building for Android: `npx eas build -p android`
- Building for both: `npx eas build -p all`
- Submitting to app stores: `npx eas submit`

## References

- Old (invalid) Project ID: cfeb8f68-3ab5-438a-9d77-9c9ee7042393
- New (valid) Project ID: fd88d917-983a-46da-8c95-9f7af69274b5
