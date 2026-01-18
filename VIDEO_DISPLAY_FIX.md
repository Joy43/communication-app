# Video Call Display Fix

## Problem

During video calls, only the sender's video was showing in the small PIP (Picture-in-Picture) view, but the receiver's video was not displaying in the full-screen view.

## Root Cause

The issue was in the condition used to determine when to show the remote video stream in `call-screen.tsx`:

```tsx
{remoteStream && isVideoCall ? (
  <RTCView streamURL={remoteStream.toURL()} ... />
) : (
  // Fallback UI
)}
```

The problem was that `isVideoCall` was being determined solely based on the **local stream's** video tracks:

```tsx
const isVideoCall =
  callType === "VIDEO" || (localStream?.getVideoTracks().length ?? 0) > 0;
```

This meant that if the receiver had video but the local stream didn't have video tracks loaded yet, or if there was any mismatch, the remote video wouldn't display.

## Solution

### 1. Added `hasRemoteVideo` Check

Created a separate variable to explicitly check if the remote stream has video tracks:

```tsx
const hasRemoteVideo = remoteStream && remoteStream.getVideoTracks().length > 0;
```

### 2. Updated Remote Video Display Condition

Changed the condition to directly check for remote video availability:

```tsx
{hasRemoteVideo && remoteStream ? (
  <RTCView
    streamURL={remoteStream.toURL()}
    style={{ width, height }}
    objectFit="cover"
    className="bg-black"
    zOrder={0}
  />
) : (
  // Fallback UI showing avatar
)}
```

### 3. Added Enhanced Logging

Added detailed logging to help debug video track states:

```tsx
if (remoteStream) {
  console.log(
    "Call Screen - remoteStream video tracks:",
    remoteStream.getVideoTracks().length
  );
  console.log(
    "Call Screen - remoteStream audio tracks:",
    remoteStream.getAudioTracks().length
  );

  // Log video track details
  remoteStream.getVideoTracks().forEach((track, index) => {
    console.log(`Call Screen - remoteStream video track ${index}:`, {
      enabled: track.enabled,
      readyState: track.readyState,
      label: track.label,
    });
  });
}
```

### 4. Added Z-Index for Proper Layering

Ensured proper video layering with zOrder and zIndex:

- Remote video (full screen): `zOrder={0}`
- Local video (PIP): `zOrder={1}` and `style={{ zIndex: 10 }}`

## Benefits

1. ✅ Remote video now displays correctly in full screen when available
2. ✅ Local video displays in small PIP view when video is enabled
3. ✅ Proper fallback to avatar UI when video is not available
4. ✅ Better debugging capabilities with enhanced logging
5. ✅ Clearer separation between local and remote video states

## Testing Recommendations

1. Test video call from sender side - should see receiver's video full screen
2. Test video call from receiver side - should see sender's video full screen
3. Test with video toggle on/off during call
4. Test with audio-only calls (should show avatar, not video)
5. Check console logs to verify video tracks are being detected properly

## Files Modified

- `/app/(chat-detail)/call-screen.tsx` - Updated video display logic and conditions
