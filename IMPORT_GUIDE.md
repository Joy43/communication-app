# Quick Reference: Import Path Changes

## When importing from `/src` in route files (files in `app/` directory):

### From routes in `app/(auth)/`, `app/(root)/`, etc.

```typescript
// ❌ OLD (wrong - file doesn't exist in app anymore)
import { Button } from "../components/Button";

// ✅ NEW (correct - shared code is in src)
import { Button } from "../../src/components/Button";
```

### From `app/_layout.tsx` (root level)

```typescript
// ❌ OLD
import { setUser } from "./redux/auth/auth.slice";

// ✅ NEW
import { setUser } from "../src/redux/auth/auth.slice";
```

## Path aliases (using `@/` in tsconfig.json)

```typescript
// ❌ OLD
import { TUser } from "@/app/types/user.type";

// ✅ NEW
import { TUser } from "@/src/types/user.type";
```

## Internal imports within `/src` (stay the same)

```typescript
// ✅ These don't change - use relative paths within src
import { reducer } from "../store";
import { useHook } from "../../hooks/useHook";
```

## Summary of directory organization:

- **`app/`** = Only route files and layout files (Expo Router requirements)
- **`src/`** = All shared code (components, hooks, services, types, utils, etc.)
- **`assets/`** = Images, fonts, and other static assets
- **`android/`** = Android native code
- **`ios/`** = iOS native code
