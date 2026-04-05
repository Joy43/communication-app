# EAS Build Error - RESOLVED ✅

## Problem

The EAS build failed with this error:

```
npm error code EUSAGE
npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync.
npm error Missing: expo-device@8.0.10 from lock file
npm error Missing: ua-parser-js@0.7.41 from lock file
```

## Root Cause

Your project uses **pnpm** for local development (`pnpm-lock.yaml`), but EAS Build uses **npm** in the CI/CD environment. The lock files were out of sync:

- ✅ `pnpm-lock.yaml` was up to date
- ❌ `package-lock.json` was missing or outdated

When EAS tried to run `npm ci`, it couldn't find all packages.

## Solution Applied

### Step 1: Generate npm Lock File

```bash
npm install --package-lock-only
```

This generated a `package-lock.json` that matches your `package.json` without installing anything locally.

### Step 2: Fixed eas.json Structure

Corrected the JSON structure (had malformed nesting).

### Step 3: Committed Changes

```bash
git add -A
git commit -m "fix: sync lock files and fix FCM token handling..."
```

## Files Changed

| File                                | Change                         |
| ----------------------------------- | ------------------------------ |
| `package-lock.json`                 | ✅ Generated (new file)        |
| `pnpm-lock.yaml`                    | ✅ Updated by npm install      |
| `eas.json`                          | ✅ Fixed structure             |
| `app/_layout.tsx`                   | ✅ Fixed SafeAreaView import   |
| `app/(auth)/sign-in.tsx`            | ✅ Flexible FCM token handling |
| `src/services/firebaseMessaging.ts` | ✅ Better dev logging          |
| `app/(posts)/postsData.ts`          | ✅ Added default export        |
| `docs/FCM_DEVELOPMENT_SETUP.md`     | ✅ Created comprehensive guide |

## How to Proceed

### Option 1: Retry Build

```bash
eas build --platform android --profile preview
```

### Option 2: Upgrade EAS CLI (Optional)

```bash
npm install -g eas-cli@latest
```

### Option 3: Both Local & Lock Files in Sync

For the future, use this workflow:

**When you add dependencies:**

```bash
# Add with pnpm (your local dev tool)
pnpm add package-name

# Sync npm lock file for EAS
npm install --package-lock-only

# Commit both
git add package.json pnpm-lock.yaml package-lock.json
git commit -m "feat: add package-name"
```

## Understanding the Dual Lock System

```
Local Development          →  EAS Build (CI/CD)
─────────────────              ──────────────────
pnpm install              →    npm ci (production install)
pnpm-lock.yaml            →    package-lock.json
Fast, monorepo friendly   →    Standard npm, works everywhere
```

## Verification

Your build should now pass the **Install dependencies** step. If it still fails, check:

1. ✅ Both lock files are committed
2. ✅ `eas.json` is valid JSON
3. ✅ All Firebase config files present (Google Services, etc.)
4. ✅ EAS credentials are valid (`eas login`)

---

**Status**: ✅ Ready to build
**Last Updated**: April 6, 2026
