# Call System Fix Documentation

## Overview

This document outlines the fixes applied to align the React Native frontend with the backend call implementation.

## Issues Fixed

### 1. Socket Event Listeners Mismatch

**Problem**: The frontend had commented-out event listeners for `incoming-call` and `call-active`, and was listening to wrong event names (`decline-call` and `end-call` instead of `call-declined` and `call-ended`).

**Backend Events Emitted**:

- `incoming-call` - When recipient receives a call
- `call-started` - When call is created by host
- `call-active` - When call is accepted and active
- `call-declined` - When call is rejected
- `call-ended` - When call is terminated

**Fix Applied** (`useCallSocket.ts`):

- Enabled `incoming-call` listener
- Enabled `call-active` listener
- Changed `decline-call` → `call-declined`
- Changed `end-call` → `call-ended`

### 2. WebRTC Initialization Timing Issue

**Problem**: Frontend was trying to initiate WebRTC immediately after emitting `start-call`, before backend confirmed call creation. This caused race conditions and missing `callId`.

**Backend Flow**:

1. Client emits `start-call`
2. Backend creates call in database
3. Backend emits `call-started` to host with `callId`
4. Backend emits `incoming-call` to recipient with `callId`

**Fix Applied** (`useWebRTC.ts`):

- Modified `initiateCall()` to only emit socket event
- Moved WebRTC initialization to `onCallStarted` callback
- Now WebRTC starts only after receiving `call-started` event with valid `callId`

**Before**:

```typescript
const initiateCall = async (recipientUserId, type, title) => {
  callSocket.startCall({ hostUserId, recipientUserId, title });
  setTimeout(async () => {
    if (callInfo?.callId) {
      await webRTCManagerRef.current?.initiateCall(
        callInfo.callId,
        recipientUserId,
        type
      );
    }
  }, 1000); // Race condition!
};
```

**After**:

```typescript
const initiateCall = async (recipientUserId, type, title) => {
  setCallType(type); // Store type for later use
  callSocket.startCall({ hostUserId, recipientUserId, title });
  // WebRTC initialization happens in onCallStarted callback
};

const onCallStarted = (data) => {
  setCallInfo({ callId: data.callId, recipientId: data.to });
  // Now initiate WebRTC with confirmed callId
  webRTCManagerRef.current?.initiateCall(data.callId, data.to, callType);
};
```

### 3. Call Status Types Missing

**Problem**: Frontend didn't have proper TypeScript types matching backend's Prisma schema.

**Backend Schema**:

```prisma
enum CallStatus {
  CALLING
  RINING    // Typo in backend - should be RINGING
  ACTIVE
  END
  MISSED
  DECLINED
}

model CallParticipant {
  id        String
  callId    String
  socketId  String
  userName  String
  hasVideo  Boolean
  hasAudio  Boolean
  joinedAt  DateTime
  leftAt    DateTime?
}
```

**Fix Applied** (`types/chat.type.ts`):

- Added `CallStatus` type enum
- Added `CallType` type enum
- Added `CallParticipant` interface
- Added `Call` interface
- Updated `getCallStatus` return type to use `Call` interface

### 4. Call Active State Handling

**Problem**: Frontend wasn't properly updating call state when backend emitted `call-active`.

**Fix Applied** (`useWebRTC.ts`):

- Added `setCallState("connected")` in `onCallActive` callback
- Ensures UI reflects active call state

## Complete Call Flow

### Outgoing Call Flow

1. **User initiates call**: `initiateCall(recipientId, "AUDIO")`
2. **Frontend emits**: `start-call` event to backend
3. **Backend**:
   - Creates `Calling` record in database
   - Emits `call-started` to host
   - Emits `incoming-call` to recipient (if online)
4. **Host receives**: `call-started` event
   - Sets callInfo with callId
   - Initiates WebRTC with confirmed callId
   - Creates offer and sends via `webrtc-offer`
5. **Recipient receives**: `incoming-call` event
   - Shows incoming call modal
   - Prepares for incoming call

### Incoming Call Flow

1. **Recipient sees modal**: Incoming call from X
2. **Recipient accepts**: `acceptCall()`
3. **Frontend emits**: `accept-call` event
4. **Backend**:
   - Updates call status to `ACTIVE`
   - Emits `call-active` to both parties
5. **Frontend receives**: `call-active` event
   - Sets state to "connected"
   - WebRTC connection established
   - Audio/Video streams connected

### Call Termination Flow

1. **User ends call**: `endCall()`
2. **Frontend emits**: `end-call` event with callId, callerId, receiverId
3. **Backend**:
   - Updates call status to `END`
   - Sets `endedAt` timestamp
   - Emits `call-ended` to both parties
4. **Frontend receives**: `call-ended` event
   - Cleans up WebRTC connections
   - Resets all state
   - Closes call screen

## API Endpoints

### GET `/call/:callId/status`

**Purpose**: Fetch call details and status from backend

**Response**:

```typescript
{
  id: string;
  status: CallStatus;
  startedAt?: string;
  endedAt?: string;
  hostUserId: string;
  recipientUserId?: string;
  title?: string;
}
```

**Frontend Implementation**: Updated to use proper authentication token and return typed `Call` object.

## Backend Considerations

### Known Issues in Backend

1. **Typo in CallStatus enum**: `RINING` should be `RINGING`
2. **CallParticipant records**: Backend has this model but CallGateway doesn't create/manage participants

### Recommendations for Backend Improvements

1. Fix the `RINING` → `RINGING` typo in Prisma schema
2. Implement CallParticipant management in CallGateway:
   ```typescript
   // When call is accepted
   await this.prisma.callParticipant.create({
     data: {
       callId: data.callId,
       socketId: client.id,
       userName: userData.name,
       hasVideo: false,
       hasAudio: true,
     },
   });
   ```
3. Add socket disconnect handler to update participants' `leftAt` timestamp
4. Consider adding `GET /call/:callId/participants` endpoint

## Testing Checklist

- [ ] Outgoing audio call connects successfully
- [ ] Outgoing video call connects successfully
- [ ] Incoming call notification appears
- [ ] Accepting incoming call works
- [ ] Declining incoming call works
- [ ] Ending active call works
- [ ] Call status API returns correct data
- [ ] Missed call status set when recipient offline
- [ ] Missed call status set when ring timeout expires
- [ ] WebRTC offer/answer exchange works
- [ ] ICE candidates exchange properly
- [ ] Audio mute/unmute works
- [ ] Video on/off works
- [ ] Camera switching works (for video calls)

## Environment Variables Required

```env
EXPO_PUBLIC_BASE_API=http://your-backend-url
```

## Files Modified

1. `app/hooks/useCallSocket.ts` - Fixed event listeners
2. `app/hooks/useWebRTC.ts` - Fixed call initialization flow
3. `app/types/chat.type.ts` - Added Call-related types

## Breaking Changes

None - All changes are backward compatible and fix existing issues.

## Migration Notes

No migration needed. Just update the code and restart the app.
