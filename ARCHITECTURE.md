# Firebase FCM Architecture Overview

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    REACT NATIVE APP (Client)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │   App Root Layout    │
                    │   (_layout.tsx)      │
                    └──────────────────────┘
                              │
                              ▼
                    ┌──────────────────────────────────┐
                    │  useFirebaseMessaging Hook      │
                    │ (app/hooks/useFirebaseMessaging)│
                    └──────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   ┌────────────┐       ┌────────────┐       ┌──────────────┐
   │ Initialize │       │ Request    │       │ Setup        │
   │ Firebase   │       │ Permission │       │ Handlers     │
   │ App        │       │ (iOS)      │       │              │
   └────────────┘       └────────────┘       └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
         ┌────────────────────────────────────┐
         │  Firebase Cloud Messaging (FCM)   │
         │  - Get Device Token               │
         │  - Handle Notifications           │
         │  - Manage Topics                  │
         └────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
         ┌──────────┐  ┌──────────┐  ┌──────────┐
         │ Firebase │  │ Get FCM  │  │ Listen   │
         │ Services │  │ Token    │  │ for New  │
         │          │  │          │  │ Messages │
         └──────────┘  └──────────┘  └──────────┘
                │             │             │
                └─────────────┼─────────────┘
                              │
                              ▼
         ┌────────────────────────────────────┐
         │  Firebase Cloud Messaging Server  │
         │  (Google Infrastructure)          │
         └────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         ┌─────────┐    ┌─────────┐    ┌─────────┐
         │ Android │    │   iOS   │    │   Web   │
         │ Push    │    │ APN/FCM │    │ (future)│
         │ Service │    │ Service │    │         │
         └─────────┘    └─────────┘    └─────────┘
```

## Component Interaction Diagram

```
┌──────────────────────────────────┐
│     App Initialization           │
│  (useFirebaseMessaging Hook)     │
└──────────┬───────────────────────┘
           │
           ├─→ initializeFirebaseMessaging()
           │       │
           │       ├─→ Request Permissions (iOS)
           │       │
           │       └─→ Get Device Token (FCM Token)
           │
           ├─→ setupForegroundNotificationHandler()
           │       │
           │       └─→ Listen for notifications when app is active
           │
           ├─→ setupBackgroundNotificationHandler()
           │       │
           │       └─→ Handle notifications when app is backgrounded
           │
           └─→ setupTokenRefresh()
                   │
                   └─→ Listen for new tokens (periodic refresh)
```

## Data Flow: Notification Delivery

```
1. User Sends Message
   ↓
┌─────────────────┐
│   Your Backend  │
│   (Node.js)     │
└────────┬────────┘
         │
         │ Store message + get recipient FCM token
         │
         ▼
┌─────────────────────────────────┐
│ Firebase Admin SDK              │
│ (send notification to token)    │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Firebase Cloud Messaging Server │
└────────┬────────────────────────┘
         │
         ├─→ Android: Google Cloud Messaging Service
         │   └─→ Android Device (foreground/background)
         │
         └─→ iOS: Apple Push Notification Service (APNs)
             └─→ iOS Device (foreground/background)

2. React Native App Receives Notification
   ↓
   Notification Handler Triggered
   ↓
   ├─→ Foreground? → Show custom UI
   │
   └─→ Background? → Show system notification
       ↓
       User Taps → Deep Link Handler → Navigate to screen
```

## Firebase Messaging Service Methods

```
app/services/firebaseMessaging.ts
│
├─ initializeFirebaseMessaging()
│  └─ Returns: string | null (FCM Token)
│     └─ Requests permission
│     └─ Gets device token
│
├─ getFCMToken()
│  └─ Returns: string | null
│     └─ Gets current device token
│
├─ setupForegroundNotificationHandler()
│  └─ Returns: unsubscribe function
│     └─ Listens for messages when app is foreground
│
├─ setupBackgroundNotificationHandler()
│  └─ Returns: Promise<void>
│     └─ Sets up background message handler
│
├─ setupTokenRefresh()
│  └─ Returns: unsubscribe function
│     └─ Listens for token refresh events
│
├─ subscribeToNotifications(topic)
│  └─ Returns: Promise<void>
│     └─ Subscribes device to topic
│
└─ unsubscribeFromNotifications(topic)
   └─ Returns: Promise<void>
      └─ Unsubscribes device from topic
```

## Redux State Management

```
Redux Store
└─ auth slice
   ├─ user: TUser | null
   │  ├─ id: string
   │  ├─ name: string
   │  ├─ email: string
   │  ├─ role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
   │  ├─ status: 'ACTIVE' | 'INACTIVE' | 'BANNED'
   │  └─ ... (other fields)
   │
   └─ accessToken: string | null
      └─ Used for API authentication

Sign In Flow:
1. loginUserWithEmail(email, password)
   ↓
2. API returns user + token
   ↓
3. dispatch(setUser({ user, accessToken }))
   ↓
4. Redux state updated
   ↓
5. Navigate to app
```

## File Structure & Dependencies

```
app/
│
├─ services/
│  └─ firebaseMessaging.ts
│     └─ imports: @react-native-firebase/messaging
│
├─ hooks/
│  └─ useFirebaseMessaging.ts
│     └─ imports: firebaseMessaging.ts
│
├─ (auth)/
│  └─ sign-in.tsx
│     └─ imports: firebaseMessaging.ts
│
├─ (root)/
│  ├─ _layout.tsx
│  │  └─ imports: useFirebaseMessaging
│  │
│  └─ (tabs)/
│     └─ [tab screens]
│
└─ redux/
   ├─ auth/
   │  ├─ auth.api.ts
   │  │  └─ API endpoints
   │  └─ auth.slice.ts
   │     └─ Redux state management
   │
   ├─ store.ts
   └─ hook.ts

Dependencies:
├─ @react-native-firebase/app
├─ @react-native-firebase/messaging
└─ react (for hooks)
```

## Token Lifecycle

```
App Start
  │
  ▼
Request Notification Permission (iOS)
  │
  ▼
Get FCM Token from Firebase
  │
  ├─ Token exists? → Use it
  │  └─ Store in app state
  │  └─ Send to backend (optional)
  │
  └─ Token is null? → Retry or warn user
     └─ Check permissions
     └─ Check internet connection

During App Usage
  │
  ├─ Token refresh event fires
  │  └─ Unsubscribe hook called
  │  └─ Update backend with new token
  │
  └─ App needs token
     └─ Call getFCMToken()

App Cleanup
  │
  ├─ Foreground handler unsubscribed
  ├─ Token refresh listener unsubscribed
  └─ App ready to close
```

## API Request/Response Flow

```
Client (React Native)
   │
   ▼
POST /auth/login
{
  email: "user@example.com",
  password: "password123"
}
   │
   ▼
Backend (Node.js/Express)
   │
   ├─ Validate credentials
   ├─ Create session
   └─ Return user data + token
   │
   ▼
Response
{
  message: "Login successful",
  data: {
    user: {
      id: "user_123",
      email: "user@example.com",
      name: "John Doe",
      role: "USER",
      status: "ACTIVE",
      ... (other fields)
    },
    token: "eyJhbGciOiJIUzI1NiIs..." // JWT token
  }
}
   │
   ▼
Redux State Updated
   │
   ├─ auth.user = user data
   └─ auth.accessToken = token
   │
   ▼
Navigate to Main App
```

## Push Notification Flow (Backend → Client)

```
Backend Service
(receives user message)
      │
      ▼
Fetch recipient FCM token
from database
      │
      ▼
Call Firebase Admin SDK
      │
      ├─ admin.messaging().send({
      │   token: "FCM_TOKEN",
      │   notification: { title, body },
      │   data: { custom data }
      │ })
      │
      ▼
Firebase Cloud Messaging
(processes notification)
      │
      ├─ Android: Google GCM
      │  └─ Delivers to device
      │
      └─ iOS: Apple APNs
         └─ Delivers to device

      ▼
React Native App
      │
      ├─ If foreground
      │  └─ Trigger foregroundMessageHandler
      │
      └─ If background
         └─ System notification displayed
         └─ User tap triggers notification handler

```

This architecture ensures reliable, scalable, and secure push notifications for your communication app!
