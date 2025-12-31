# WebRTC Quick Reference Card

## 🔌 Connection Details

```
Socket Namespace: /call
Base URL: ${EXPO_PUBLIC_BASE_API}/call
Auth: JWT in headers.authorization
Transport: WebSocket
```

## 📡 Socket Events

### Frontend → Backend (Emit)

| Event           | Payload                                   | Purpose              |
| --------------- | ----------------------------------------- | -------------------- |
| `start-call`    | `{ hostUserId, recipientUserId, title? }` | Initiate new call    |
| `accept-call`   | `{ callId, callerId }`                    | Accept incoming call |
| `decline-call`  | `{ callId }`                              | Decline call         |
| `end-call`      | `{ callId, callerId, receiverId }`        | End active call      |
| `webrtc-offer`  | `{ roomId, offer, receiverId }`           | Send WebRTC offer    |
| `webrtc-answer` | `{ roomId, answer, callerId }`            | Send WebRTC answer   |
| `ice-candidate` | `{ roomId, candidate, targetUserId }`     | Send ICE candidate   |

### Backend → Frontend (Listen)

| Event           | Payload                    | Purpose                     |
| --------------- | -------------------------- | --------------------------- |
| `incoming-call` | `{ callId, from, title? }` | Notify of incoming call     |
| `call-started`  | `{ callId, to, title? }`   | Call initiated successfully |
| `call-active`   | `{ callId }`               | Call is now active          |
| `call-declined` | `{ callId }`               | Call was declined           |
| `call-ended`    | `{ callId }`               | Call has ended              |
| `webrtc-offer`  | `{ roomId, offer }`        | Receive WebRTC offer        |
| `webrtc-answer` | `{ roomId, answer }`       | Receive WebRTC answer       |
| `ice-candidate` | `{ roomId, candidate }`    | Receive ICE candidate       |

## 🎣 Hook API

### useWebRTC()

#### State

```typescript
{
  // Call States
  callState: 'idle' | 'initiating' | 'outgoing' | 'incoming' | 'connecting' | 'connected' | 'ended'
  callType: 'AUDIO' | 'VIDEO'

  // Media Streams
  localStream: MediaStream | null
  remoteStream: MediaStream | null

  // Controls
  isMuted: boolean
  isVideoOff: boolean

  // Status
  error: Error | null
  isSocketConnected: boolean
  socketError: string | null
  isCallActive: boolean
  isConnected: boolean

  // Call Info
  incomingCall: {
    callId: string
    callerId: string
    callerName: string
    type: CallType
    title?: string
  } | null

  callInfo: {
    callId?: string
    recipientId?: string
    recipientName?: string
    startTime?: number
  } | null

  // User
  currentUserId: string
}
```

#### Methods

```typescript
{
  // Call Actions
  initiateCall: (recipientUserId: string, type: CallType, title?: string) => Promise<void>
  acceptCall: () => Promise<void>
  rejectCall: () => void
  endCall: () => void

  // Controls
  toggleMute: () => void
  toggleVideo: () => void
  enableVideo: () => Promise<void>
  switchCamera: () => Promise<void>

  // API
  getCallStatus: (callId: string) => Promise<any>
}
```

## 📋 Common Patterns

### Start a Call

```typescript
const { initiateCall } = useWebRTC();
await initiateCall(userId, "AUDIO", "John");
```

### Accept a Call

```typescript
const { acceptCall, incomingCall } = useWebRTC();
if (incomingCall) {
  await acceptCall();
}
```

### End a Call

```typescript
const { endCall } = useWebRTC();
endCall();
```

### Check Call Status

```typescript
const { callState, isConnected } = useWebRTC();
// callState: current state
// isConnected: true if connected
```

### Display Video

```typescript
const { localStream, remoteStream } = useWebRTC();

<RTCView streamURL={remoteStream?.toURL()} />
<RTCView streamURL={localStream?.toURL()} mirror />
```

## 🔍 Debugging Commands

### Check Socket

```typescript
const { isSocketConnected, socketError, currentUserId } = useWebRTC();
console.log({ isSocketConnected, socketError, currentUserId });
```

### Check Call

```typescript
const { callState, callInfo, error } = useWebRTC();
console.log({ callState, callInfo, error });
```

### Check Media

```typescript
const { localStream, remoteStream } = useWebRTC();
console.log({
  local: localStream?.getTracks(),
  remote: remoteStream?.getTracks(),
});
```

## 🎯 Call State Flow

```
Outgoing Call:
idle → initiating → outgoing → connected → ended

Incoming Call:
idle → incoming → connecting → connected → ended

Declined Call:
idle → incoming → ended
OR
idle → initiating → outgoing → ended
```

## 🔐 Authentication

```typescript
// User ID automatically from Redux:
import { selectUser } from "../redux/auth/auth.slice";
const currentUser = useAppSelector(selectUser);
const currentUserId = currentUser?.id;

// JWT automatically added to socket:
headers: {
  Authorization: `Bearer ${token}`;
}
```

## ⚡ Quick Test

```typescript
// Test Component
function TestCall() {
  const {
    initiateCall,
    acceptCall,
    endCall,
    callState,
    isSocketConnected,
    incomingCall
  } = useWebRTC();

  return (
    <View>
      <Text>Socket: {isSocketConnected ? '✅' : '❌'}</Text>
      <Text>State: {callState}</Text>

      <Button
        title="Call Test User"
        onPress={() => initiateCall('test-user-id', 'AUDIO')}
      />

      {incomingCall && (
        <Button title="Accept" onPress={acceptCall} />
      )}

      <Button title="End" onPress={endCall} />
    </View>
  );
}
```

## 📊 Backend Status Codes

| HTTP | Meaning           |
| ---- | ----------------- |
| 200  | Success           |
| 401  | Not authenticated |
| 404  | Call not found    |
| 500  | Server error      |

## 🚨 Common Errors

| Error                  | Cause                | Fix                          |
| ---------------------- | -------------------- | ---------------------------- |
| "Socket not connected" | Socket disconnected  | Check backend, check token   |
| "Not authenticated"    | No user ID           | Ensure user logged in        |
| "No active call"       | Call info missing    | Check call flow              |
| "Permission denied"    | No camera/mic access | Request permissions          |
| "Connection failed"    | WebRTC failed        | Check STUN servers, firewall |

## 📦 Dependencies

```json
{
  "react-native-webrtc": "^latest",
  "socket.io-client": "^latest",
  "@react-native-async-storage/async-storage": "^latest"
}
```

## 🌐 STUN Servers

```typescript
{
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ];
}
```

## 📱 Permissions Required

### iOS (Info.plist)

```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access for video calls</string>
<key>NSMicrophoneUsageDescription</key>
<string>We need microphone access for calls</string>
```

### Android (AndroidManifest.xml)

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
```

## 🎨 UI Components

### Call Button

```typescript
<TouchableOpacity onPress={() => initiateCall(userId, 'AUDIO')}>
  <Phone size={24} />
</TouchableOpacity>
```

### Video Button

```typescript
<TouchableOpacity onPress={() => initiateCall(userId, 'VIDEO')}>
  <Video size={24} />
</TouchableOpacity>
```

### Mute Button

```typescript
<TouchableOpacity onPress={toggleMute}>
  {isMuted ? <MicOff /> : <Mic />}
</TouchableOpacity>
```

### Video Toggle

```typescript
<TouchableOpacity onPress={toggleVideo}>
  {isVideoOff ? <VideoOff /> : <Video />}
</TouchableOpacity>
```

### End Call

```typescript
<TouchableOpacity onPress={endCall}>
  <PhoneOff color="red" />
</TouchableOpacity>
```

## 🔄 State Management

### Local Component State

```typescript
const [isRinging, setIsRinging] = useState(false);
const { incomingCall } = useWebRTC();

useEffect(() => {
  setIsRinging(!!incomingCall);
}, [incomingCall]);
```

### Redux (if needed)

```typescript
// Current user is already in Redux
const currentUser = useAppSelector(selectUser);
const currentUserId = currentUser?.id;
```

## 📞 Example Flows

### Basic Audio Call

```typescript
// User A
initiateCall(userB.id, 'AUDIO', userB.name);

// User B receives
incomingCall → { callId, callerId, callerName }

// User B accepts
acceptCall();

// Both connected
callState === 'connected'

// Either ends
endCall();
```

### Video Call with Upgrade

```typescript
// Start audio call
initiateCall(userId, "AUDIO");

// During call, enable video
await enableVideo();

// Now it's a video call
callType === "VIDEO";
```

## 💾 Storage

### Token Storage (Automatic)

```typescript
// Handled by auth slice
import { selectaccessToken } from "../redux/auth/auth.slice";
const token = useAppSelector(selectaccessToken);
```

## 🧪 Testing

### Unit Test

```typescript
import { renderHook } from "@testing-library/react-hooks";
import { useWebRTC } from "@/app/hooks/useWebRTC";

test("useWebRTC initializes", () => {
  const { result } = renderHook(() => useWebRTC());
  expect(result.current.callState).toBe("idle");
});
```

### Integration Test

```typescript
// Test full call flow
initiateCall(userId, "AUDIO");
expect(callState).toBe("initiating");

// Mock backend response
mockSocket.emit("call-started", { callId: "123" });
expect(callState).toBe("outgoing");
```

## 🎯 Production Checklist

- [ ] Environment variables set
- [ ] Backend deployed and accessible
- [ ] Socket namespace `/call` working
- [ ] JWT authentication working
- [ ] STUN servers accessible
- [ ] Permissions granted
- [ ] Error tracking enabled
- [ ] Logs reviewed
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Tested on real network
- [ ] Load tested

---

**Print this card** and keep it handy while developing! 📋

**Last Updated**: December 31, 2025
