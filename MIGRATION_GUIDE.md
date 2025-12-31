# WebRTC Migration Guide

## Quick Start

### What Changed?

Your WebRTC implementation has been refactored to properly integrate with your NestJS backend. The main changes are:

1. **New Socket Connection**: Separate socket for calls (`/call` namespace)
2. **Simplified API**: WebRTC Manager no longer makes HTTP calls
3. **Backend Integration**: All call events now go through Socket.IO
4. **User Authentication**: Uses Redux auth state automatically

### Files Modified

- ✨ **NEW**: `app/hooks/useCallSocket.ts` - Call socket management
- 🔄 **UPDATED**: `app/services/webRTCManager.ts` - Refactored for backend integration
- 🔄 **UPDATED**: `app/hooks/useWebRTC.ts` - Simplified and backend-integrated
- 🔄 **UPDATED**: `app/(chat-detail)/call-screen.tsx` - Minor prop updates
- 📝 **DOCS**: `WEBRTC_REFACTOR_DOCUMENTATION.md` - Full documentation

### No Changes Needed To

- ✅ `app/components/IncomingCallModal.tsx` - Works as-is
- ✅ Your existing UI components
- ✅ Your Redux setup
- ✅ Your authentication flow

## Step-by-Step Setup

### 1. Verify Environment Variables

Ensure your `.env` or `app.config.js` has:

```env
EXPO_PUBLIC_BASE_API=http://your-backend-url:3000
```

### 2. Test Socket Connection

Add this to any component to test:

```typescript
import { useCallSocket } from "@/app/hooks/useCallSocket";

function TestComponent() {
  const { isConnected, error } = useCallSocket();

  console.log("Call Socket Connected:", isConnected);
  console.log("Call Socket Error:", error);

  return null;
}
```

### 3. Update Your Call Initiation Code

**Before**:

```typescript
// If you had custom call initiation
initiateCall(conversationId, type);
```

**After**:

```typescript
// Now requires recipientUserId directly
initiateCall(recipientUserId, type, "John Doe"); // title is optional
```

### 4. Backend Requirements

Your backend **must** emit these events (which you already have!):

- `incoming-call` - When someone calls
- `call-started` - When call begins
- `call-active` - When call accepted
- `call-declined` - When call declined
- `call-ended` - When call ends
- `webrtc-offer` - WebRTC offer
- `webrtc-answer` - WebRTC answer
- `ice-candidate` - ICE candidates

Your backend **must** listen for these events (which you already have!):

- `start-call` - User initiates call
- `accept-call` - User accepts call
- `decline-call` - User declines call
- `end-call` - User ends call
- `webrtc-offer` - WebRTC offer from client
- `webrtc-answer` - WebRTC answer from client
- `ice-candidate` - ICE candidate from client

## Testing Your Implementation

### Test 1: Socket Connection

```typescript
// In any screen
const { isSocketConnected } = useWebRTC();

useEffect(() => {
  console.log("Call Socket Status:", isSocketConnected);
}, [isSocketConnected]);
```

**Expected**: `Call Socket Status: true`

### Test 2: Initiate Call

```typescript
const { initiateCall, callState } = useWebRTC();

const testCall = async () => {
  await initiateCall("recipient-user-id", "AUDIO", "Test User");
  console.log("Call State:", callState);
};
```

**Expected Flow**:

1. `callState` → `initiating`
2. Backend emits `call-started`
3. `callState` → `outgoing`
4. When recipient accepts → `connected`

### Test 3: Receive Call

1. Have another user call you
2. Check console for: `"Incoming call received:"`
3. `IncomingCallModal` should appear
4. Accept the call
5. `callState` should become `connected`

### Test 4: End Call

```typescript
const { endCall, callState } = useWebRTC();

// During active call
endCall();
// callState should become 'ended'
```

## Common Issues & Solutions

### Issue: Socket Not Connecting

**Symptoms**: `isSocketConnected` is always `false`

**Solutions**:

1. Check backend is running: `http://your-backend-url:3000/call`
2. Verify JWT token exists: Check Redux auth state
3. Check backend CORS settings allow socket connections
4. Look at backend logs for connection errors

### Issue: Calls Not Starting

**Symptoms**: `initiateCall` does nothing

**Solutions**:

1. Check `currentUserId` exists: `const { currentUserId } = useWebRTC()`
2. Verify socket is connected: `isSocketConnected === true`
3. Check backend receives `start-call` event
4. Look for errors in `error` state

### Issue: WebRTC Not Connecting

**Symptoms**: Call starts but no audio/video

**Solutions**:

1. Check permissions granted (camera, microphone)
2. Verify ICE candidates are exchanging (check console logs)
3. Test STUN servers are reachable
4. Check firewall settings

### Issue: Incoming Calls Not Showing

**Symptoms**: No `IncomingCallModal` appears

**Solutions**:

1. Ensure `IncomingCallModal` is rendered in your root layout
2. Check backend emits `incoming-call` event
3. Verify `useWebRTC` hook is initialized
4. Check console for: `"Incoming call received:"`

## Performance Tips

### 1. Single WebRTC Instance

The `useWebRTC` hook should only be used at the app level or in screens that need it. Don't create multiple instances.

**Good**:

```typescript
// In root layout or specific screens
function CallFeature() {
  const webrtc = useWebRTC();
  return <YourUI {...webrtc} />;
}
```

**Bad**:

```typescript
// Don't use in multiple child components
function Component1() {
  const webrtc = useWebRTC();
}
function Component2() {
  const webrtc = useWebRTC();
}
```

### 2. Socket Cleanup

The hooks automatically clean up connections. Don't manually disconnect unless needed.

### 3. State Management

Use the provided state from `useWebRTC` instead of creating your own:

```typescript
const {
  callState, // Use this for UI states
  localStream, // Use this for video display
  remoteStream, // Use this for video display
  isConnected, // Use this for connection status
} = useWebRTC();
```

## Debugging

### Enable Verbose Logging

All WebRTC operations now log to console. Look for:

- `"Call Socket connected:"`
- `"Initiating call to:"`
- `"WebRTC offer received:"`
- `"WebRTC answer received:"`
- `"ICE candidate received"`

### Check Backend Logs

Your backend should log:

- Socket connections to `/call` namespace
- `start-call` events received
- Call records created
- Events emitted to clients

### Network Inspection

Use React Native Debugger or Flipper to inspect:

- Socket.IO connections
- WebRTC peer connections
- ICE candidate gathering

## Rollback Plan

If you need to revert:

1. Keep backup of old files (you should have git history)
2. The old implementation used different event names
3. You'll need to restore previous `webRTCManager.ts` and `useWebRTC.ts`

But the new implementation is **better** because:

- ✅ Properly integrates with your backend
- ✅ Uses your existing socket events
- ✅ No hardcoded user IDs
- ✅ Better error handling
- ✅ Cleaner code organization
- ✅ ICE candidate queueing (prevents connection issues)

## Next Steps

1. ✅ Test socket connection
2. ✅ Test outgoing call
3. ✅ Test incoming call
4. ✅ Test call end
5. ✅ Test WebRTC connection
6. ✅ Test audio/video
7. ✅ Update UI components if needed
8. ✅ Deploy to staging
9. ✅ Test with real users

## Support

If you encounter issues:

1. Check console logs
2. Check backend logs
3. Review `WEBRTC_REFACTOR_DOCUMENTATION.md`
4. Check your backend event names match exactly
5. Verify JWT authentication is working

## Backend Optional Enhancements

Consider adding to your backend:

### 1. Call Type Support

```typescript
// In CallService
async createCall(
  hostUserId: string,
  recipientUserId: string,
  title?: string,
  type: 'AUDIO' | 'VIDEO' = 'AUDIO'  // Add this
) {
  return this.prisma.client.calling.create({
    data: {
      hostUserId,
      recipientUserId,
      title,
      type  // Add this
    },
  });
}
```

### 2. User Details in Events

```typescript
// In CallGateway
const hostUser = await this.userService.findOne(hostUserId);

this.server.to(receiverSocket).emit("incoming-call", {
  callId: call.id,
  from: data.hostUserId,
  caller: {
    name: hostUser.name,
    profilePicture: hostUser.profilePicture,
  },
  title: data.title,
  type: call.type,
});
```

### 3. Call Status API Enhancement

```typescript
// Add more details to getCallStatus
async getCallStatus(callId: string) {
  const call = await this.prisma.client.calling.findUnique({
    where: { id: callId },
    include: {
      host: {
        select: {
          id: true,
          name: true,
          profilePicture: true
        }
      },
      recipient: {
        select: {
          id: true,
          name: true,
          profilePicture: true
        }
      }
    }
  });

  return call;
}
```

---

**Quick Reference Card**:

```
🔌 Socket Namespace: /call
🔑 Auth: JWT in headers
📡 Events In: start-call, accept-call, decline-call, end-call
📡 Events Out: incoming-call, call-started, call-active, call-ended
🎥 WebRTC: offer, answer, ice-candidate (bidirectional)
👤 User ID: Auto from Redux auth state
```

Good luck with your implementation! 🚀
