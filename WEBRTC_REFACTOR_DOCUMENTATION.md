# WebRTC Implementation Refactor - Backend Integration

## Overview

This refactor integrates your React Native WebRTC implementation with your NestJS backend, ensuring proper call signaling and state management between frontend and backend.

## Changes Made

### 1. New Call Socket Hook (`app/hooks/useCallSocket.ts`)

**Purpose**: Dedicated socket connection to the `/call` namespace on your backend.

**Features**:

- Connects to `${EXPO_PUBLIC_BASE_API}/call` namespace
- Handles JWT authentication via socket headers
- Manages all call lifecycle events from backend:
  - `incoming-call` - When receiving a call
  - `call-started` - When call is initiated
  - `call-active` - When call is accepted and active
  - `call-declined` - When call is declined
  - `call-ended` - When call ends
  - `webrtc-offer` - WebRTC offer from peer
  - `webrtc-answer` - WebRTC answer from peer
  - `ice-candidate` - ICE candidates for connection

**Socket Emit Methods**:

```typescript
startCall({ hostUserId, recipientUserId, title });
acceptCall({ callId, callerId });
declineCall({ callId });
endCall({ callId, callerId, receiverId });
sendWebRTCOffer({ roomId, offer, receiverId });
sendWebRTCAnswer({ roomId, answer, callerId });
sendIceCandidate({ roomId, candidate, targetUserId });
```

### 2. Refactored WebRTC Manager (`app/services/webRTCManager.ts`)

**Key Changes**:

- Removed direct socket dependency (now uses callbacks)
- Removed API calls (backend handles this via socket events)
- Added proper ICE candidate queueing
- Improved state management with new states:
  - `idle` → `initiating` → `outgoing` → `connected`
  - `idle` → `incoming` → `connecting` → `connected`

**New Methods**:

```typescript
initiateCall(callId, recipientUserId, type); // Start call as caller
prepareForIncomingCall(callId, callerId, type); // Prepare for incoming call
acceptCall(); // Accept incoming call
handleWebRTCOffer(data); // Handle WebRTC offer
handleWebRTCAnswer(data); // Handle WebRTC answer
handleIceCandidate(data); // Handle ICE candidate
```

**Constructor Changes**:
Now requires callbacks for socket communication instead of direct socket instance:

```typescript
new WebRTCManager({
  currentUserId,
  onStateChange,
  onRemoteStream,
  onLocalStream,
  onError,
  onSendOffer, // Callback to send offer via socket
  onSendAnswer, // Callback to send answer via socket
  onSendIceCandidate, // Callback to send ICE candidate via socket
});
```

### 3. Updated useWebRTC Hook (`app/hooks/useWebRTC.ts`)

**Key Changes**:

- Integrates `useCallSocket` for backend communication
- Gets current user ID from Redux auth state
- Connects WebRTC Manager with Call Socket
- Properly handles call flow:

**Call Flow - Outgoing Call**:

1. User calls `initiateCall(recipientUserId, type, title)`
2. Hook emits `start-call` to backend via socket
3. Backend creates call record and emits `call-started`
4. Hook receives `call-started` with `callId`
5. WebRTC Manager initiates peer connection
6. WebRTC offer is sent to recipient via backend socket
7. When recipient accepts, WebRTC answer comes back
8. Call becomes `connected`

**Call Flow - Incoming Call**:

1. Backend emits `incoming-call` event
2. Hook displays incoming call UI
3. User calls `acceptCall()`
4. Hook emits `accept-call` to backend
5. WebRTC Manager sets up peer connection
6. Waits for WebRTC offer from caller
7. Sends WebRTC answer back
8. Call becomes `connected`

**New State Properties**:

```typescript
{
  // ... existing properties
  isSocketConnected: boolean,  // Call socket connection status
  socketError: string | null,  // Call socket errors
  currentUserId: string,  // Current authenticated user
  callInfo: {  // Updated structure
    callId?: string,
    recipientId?: string,
    recipientName?: string,
    startTime?: number
  }
}
```

### 4. Updated Call Screen (`app/(chat-detail)/call-screen.tsx`)

**Changes**:

- Updated to use new `callInfo` structure
- Changed `callInfo.participantName` → `callInfo.recipientName`
- Changed `callInfo.conversationId` → `callInfo.recipientId`

## Backend Integration Points

### Your Backend Events (NestJS)

Your backend emits these events via Socket.IO:

**Call Lifecycle**:

```typescript
// When call is initiated
socket.emit("call-started", { callId, to, title });

// When incoming call arrives
socket.emit("incoming-call", { callId, from, title });

// When call is accepted
socket.emit("call-active", { callId });

// When call is declined
socket.emit("call-declined", { callId });

// When call ends
socket.emit("call-ended", { callId });
```

**WebRTC Signaling**:

```typescript
// Send WebRTC offer to recipient
socket.emit("webrtc-offer", { roomId, offer });

// Send WebRTC answer to caller
socket.emit("webrtc-answer", { roomId, answer });

// Send ICE candidate to peer
socket.emit("ice-candidate", { roomId, candidate });
```

### Frontend to Backend Communication

Your frontend now sends:

**Call Actions**:

```typescript
socket.emit("start-call", { hostUserId, recipientUserId, title });
socket.emit("accept-call", { callId, callerId });
socket.emit("decline-call", { callId });
socket.emit("end-call", { callId, callerId, receiverId });
```

**WebRTC Signaling**:

```typescript
socket.emit("webrtc-offer", { roomId, offer, receiverId });
socket.emit("webrtc-answer", { roomId, answer, callerId });
socket.emit("ice-candidate", { roomId, candidate, targetUserId });
```

## Usage Example

### Initiating a Call

```typescript
import { useWebRTC } from '@/app/hooks/useWebRTC';

function ChatScreen() {
  const { initiateCall, callState } = useWebRTC();

  const handleCall = async () => {
    await initiateCall(
      recipientUserId,  // ID of user to call
      'AUDIO',  // or 'VIDEO'
      'John Doe'  // Optional title/name
    );
  };

  return (
    <Button onPress={handleCall}>Call</Button>
  );
}
```

### Handling Incoming Calls

```typescript
import { IncomingCallModal } from '@/app/components/IncomingCallModal';

function App() {
  // IncomingCallModal automatically uses useWebRTC hook
  // It will show when incomingCall is not null
  return (
    <>
      <YourApp />
      <IncomingCallModal />
    </>
  );
}
```

### During a Call

```typescript
function CallScreen() {
  const {
    callState,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo,
    endCall,
    switchCamera
  } = useWebRTC();

  return (
    <View>
      <RTCView streamURL={remoteStream?.toURL()} />
      <RTCView streamURL={localStream?.toURL()} />

      <Button onPress={toggleMute}>
        {isMuted ? 'Unmute' : 'Mute'}
      </Button>

      <Button onPress={toggleVideo}>
        {isVideoOff ? 'Enable Video' : 'Disable Video'}
      </Button>

      <Button onPress={endCall}>End Call</Button>

      {callType === 'VIDEO' && (
        <Button onPress={switchCamera}>Switch Camera</Button>
      )}
    </View>
  );
}
```

## Environment Variables Required

Make sure you have in your `.env` or app.config.js:

```
EXPO_PUBLIC_BASE_API=http://your-backend-url:port
```

## Backend Recommendations

### 1. Add CallType to Calling Model

Update your Prisma schema to include call type:

```prisma
model Calling {
  // ... existing fields
  type CallType @default(AUDIO)  // Add this
}

enum CallType {
  AUDIO
  VIDEO
}
```

### 2. Update Call Events to Include Type

In your `CallGateway`:

```typescript
@SubscribeMessage("start-call")
async startCall(
  @MessageBody()
  data: {
    hostUserId: string;
    recipientUserId: string;
    title?: string;
    type?: 'AUDIO' | 'VIDEO';  // Add this
  },
) {
  const call = await this.callService.createCall(
    data.hostUserId,
    data.recipientUserId,
    data.title,
    data.type || 'AUDIO'  // Pass type
  );

  // Include type in events
  this.server.to(receiverSocket).emit("incoming-call", {
    callId: call.id,
    from: data.hostUserId,
    title: data.title,
    type: data.type || 'AUDIO'  // Add this
  });
}
```

### 3. Handle User Information

Consider adding user information to call events:

```typescript
// Instead of just title, include user details
this.server.to(receiverSocket).emit("incoming-call", {
  callId: call.id,
  from: data.hostUserId,
  caller: {
    id: hostUser.id,
    name: hostUser.name,
    profilePicture: hostUser.profilePicture,
  },
  type: data.type,
});
```

## Testing Checklist

- [ ] Socket connection to `/call` namespace works
- [ ] JWT authentication works for call socket
- [ ] Outgoing call flow works (initiate → started → active → connected)
- [ ] Incoming call flow works (incoming → accept → connecting → connected)
- [ ] Call decline works
- [ ] Call end works (from both sides)
- [ ] WebRTC offer/answer exchange works
- [ ] ICE candidates are exchanged
- [ ] Audio works in calls
- [ ] Video works in calls
- [ ] Video can be enabled during audio call
- [ ] Mute/unmute works
- [ ] Video on/off works
- [ ] Camera switch works
- [ ] Call state updates correctly in UI
- [ ] Multiple calls are handled correctly
- [ ] Reconnection after network loss

## Troubleshooting

### Socket Not Connecting

- Check `EXPO_PUBLIC_BASE_API` is set correctly
- Verify backend is running and `/call` namespace is active
- Check JWT token is valid and not expired
- Look at backend logs for authentication errors

### WebRTC Not Connecting

- Check STUN server connectivity
- Verify ICE candidates are being exchanged
- Check firewall/network settings
- Enable verbose logging in WebRTCManager

### Call States Not Updating

- Check backend is emitting all required events
- Verify socket callbacks are properly connected
- Check Redux auth state has current user ID
- Look for errors in console

### Audio/Video Issues

- Verify permissions are granted (camera, microphone)
- Check device has camera/microphone
- Test getUserMedia separately
- Check track enabled states

## Future Improvements

1. **Add Call History**: Store call records and display call history
2. **Add Group Calls**: Extend to support multiple participants
3. **Add Screen Sharing**: Implement screen sharing capability
4. **Add Call Quality Indicators**: Show connection quality, bandwidth
5. **Add Push Notifications**: Notify users of incoming calls when app is closed
6. **Add Call Recording**: Optional call recording feature
7. **Add Call Statistics**: Track call duration, quality metrics
8. **Add Reconnection Logic**: Handle temporary network issues during calls

## Notes

- The current implementation uses a setTimeout hack to wait for callId from backend. In production, consider using a Promise-based approach or event-driven flow.
- ICE candidate queueing ensures candidates received before remote description is set are not lost.
- The WebRTC Manager is now completely decoupled from socket implementation, making it more testable and maintainable.
- All user IDs now come from Redux auth state, eliminating hardcoded values.

---

**Generated**: December 31, 2025
**Project**: Communication App - React Native + NestJS
**Version**: 1.0
