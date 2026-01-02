# Socket Event Reference Guide

## Backend → Frontend Events

| Event Name      | When Emitted                      | Data Structure                                     | Frontend Handler                           |
| --------------- | --------------------------------- | -------------------------------------------------- | ------------------------------------------ |
| `incoming-call` | When recipient receives a call    | `{ callId: string, from: string, title?: string }` | Shows incoming call modal, prepares WebRTC |
| `call-started`  | After backend creates call record | `{ callId: string, to: string, title?: string }`   | Stores callId, initiates WebRTC connection |
| `call-active`   | When call is accepted             | `{ callId: string }`                               | Updates state to "connected"               |
| `call-declined` | When recipient rejects call       | `{ callId: string }`                               | Ends call, shows declined message          |
| `call-ended`    | When either party ends call       | `{ callId: string }`                               | Cleans up, returns to idle state           |
| `webrtc-offer`  | WebRTC offer from caller          | `{ roomId: string, offer: any }`                   | Processes offer, creates answer            |
| `webrtc-answer` | WebRTC answer from callee         | `{ roomId: string, answer: any }`                  | Processes answer, connects stream          |
| `ice-candidate` | ICE candidate discovery           | `{ roomId: string, candidate: any }`               | Adds ICE candidate to peer connection      |

## Frontend → Backend Events

| Event Name      | When Sent                  | Data Structure                                                    | Backend Action                               |
| --------------- | -------------------------- | ----------------------------------------------------------------- | -------------------------------------------- |
| `start-call`    | User initiates call        | `{ hostUserId: string, recipientUserId: string, title?: string }` | Creates call record, notifies recipient      |
| `accept-call`   | User accepts incoming call | `{ callId: string, callerId: string }`                            | Updates status to ACTIVE, notifies caller    |
| `decline-call`  | User rejects incoming call | `{ callId: string }`                                              | Updates status to DECLINED, notifies caller  |
| `end-call`      | User ends active call      | `{ callId: string, callerId: string, receiverId: string }`        | Updates status to END, notifies both parties |
| `webrtc-offer`  | Caller creates offer       | `{ roomId: string, offer: any, receiverId: string }`              | Forwards to recipient                        |
| `webrtc-answer` | Callee creates answer      | `{ roomId: string, answer: any, callerId: string }`               | Forwards to caller                           |
| `ice-candidate` | ICE candidate found        | `{ roomId: string, candidate: any, targetUserId: string }`        | Forwards to target user                      |

## Event Flow Diagram

### Successful Call Flow

```
Caller (User A)                Backend                     Callee (User B)
      |                          |                               |
      |--[start-call]----------->|                               |
      |                          |----[incoming-call]----------->|
      |                          |                               | (Shows modal)
      |<---[call-started]--------|                               |
      |                          |                               |
      | (Initiates WebRTC)       |                               |
      |--[webrtc-offer]--------->|----[webrtc-offer]------------>|
      |                          |                               |
      |                          |                               | (User accepts)
      |                          |<----[accept-call]-------------|
      |<---[call-active]---------|----[call-active]------------->|
      |                          |                               |
      |<---[webrtc-answer]-------|<----[webrtc-answer]----------|
      |                          |                               |
      | <== ICE Candidates Exchange ==>                         |
      |                          |                               |
      | <<<===== CONNECTED =====>>>                             |
      |                          |                               |
      |--[end-call]------------->|                               |
      |                          |----[call-ended]-------------->|
      |<---[call-ended]----------|                               |
```

### Declined Call Flow

```
Caller (User A)                Backend                     Callee (User B)
      |                          |                               |
      |--[start-call]----------->|                               |
      |                          |----[incoming-call]----------->|
      |<---[call-started]--------|                               | (Shows modal)
      |                          |                               |
      | (Initiates WebRTC)       |                               | (User declines)
      |--[webrtc-offer]--------->|----[webrtc-offer]------------>|
      |                          |<----[decline-call]-----------|
      |<---[call-declined]-------|----[call-declined]-----------|
      |                          |                               |
      | (Cleanup)                                            (Cleanup)
```

### Missed Call Flow

```
Caller (User A)                Backend                     Callee (User B)
      |                          |                               |
      |--[start-call]----------->|                               X (Offline)
      |<---[call-started]--------|
      |                          |
      | (Initiates WebRTC)       | (No response)
      |--[webrtc-offer]--------->| (30s timeout)
      |                          |
      |                          | (Auto mark MISSED)
      |<---[call-ended]----------|
      |                          |
      | (Cleanup)
```

## Socket Namespace

**URL**: `${EXPO_PUBLIC_BASE_API}/call`

**Authentication**: JWT token in header

```typescript
Authorization: "Bearer <token>";
```

**Connection Options**:

```typescript
{
  auth: { token },
  extraHeaders: { Authorization: `Bearer ${token}` },
  transports: ["websocket"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
}
```

## Common Issues & Solutions

### Issue: Call never connects

**Cause**: WebRTC initiated before receiving `call-started` event
**Solution**: ✅ Fixed - WebRTC now waits for `call-started` with valid `callId`

### Issue: Incoming call not showing

**Cause**: `incoming-call` listener was commented out
**Solution**: ✅ Fixed - Event listener now active

### Issue: Call doesn't end properly

**Cause**: Listening to wrong event name (`end-call` instead of `call-ended`)
**Solution**: ✅ Fixed - Correct event name used

### Issue: Socket not connecting

**Cause**: Missing or invalid JWT token
**Solution**: Ensure token is available before initializing socket

### Issue: ICE candidates not exchanging

**Cause**: Wrong targetUserId or roomId
**Solution**: Ensure `roomId` matches `callId` and `targetUserId` is correct

## Testing Socket Events

You can test socket events using the browser console or a socket.io client:

```javascript
import io from "socket.io-client";

const socket = io("http://your-backend/call", {
  extraHeaders: {
    Authorization: "Bearer YOUR_TOKEN",
  },
});

// Listen to all events
socket.onAny((eventName, ...args) => {
  console.log(`Event: ${eventName}`, args);
});

// Start a test call
socket.emit("start-call", {
  hostUserId: "user-id-1",
  recipientUserId: "user-id-2",
  title: "Test Call",
});
```

## Backend Socket Event Handlers

Reference for backend implementation:

```typescript
// CallGateway.ts
@SubscribeMessage('start-call')
async startCall(@MessageBody() data: { hostUserId, recipientUserId, title })

@SubscribeMessage('accept-call')
async acceptCall(@MessageBody() data: { callId, callerId })

@SubscribeMessage('decline-call')
async declineCall(@MessageBody() data: { callId })

@SubscribeMessage('end-call')
async endCall(@MessageBody() data: { callId, callerId, receiverId })

@SubscribeMessage('webrtc-offer')
handleOffer(@MessageBody() data: { roomId, offer, receiverId })

@SubscribeMessage('webrtc-answer')
handleAnswer(@MessageBody() data: { roomId, answer, callerId })

@SubscribeMessage('ice-candidate')
handleIceCandidate(@MessageBody() data: { roomId, candidate, targetUserId })
```
