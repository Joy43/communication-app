// app/hooks/useWebRTC.ts
import { useEffect, useRef, useState } from 'react';
import { MediaStream } from 'react-native-webrtc';
import { useSocket } from './useSocket';
import { CallState, CallType, WebRTCManager } from '../services/webRTCManager';
// import { CallState, CallType, WebRTCManager } from '../services/WebRTCManager';

export const useWebRTC = () => {
  const { socket } = useSocket();
  const webRTCManagerRef = useRef<WebRTCManager | null>(null);

  const [callState, setCallState] = useState<CallState>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [incomingCall, setIncomingCall] = useState<{
    callId: string;
    callerId: string;
    callerName: string;
    type: CallType;
  } | null>(null);

  useEffect(() => {
    if (!socket) return;

    // Initialize WebRTC Manager
    webRTCManagerRef.current = new WebRTCManager({
      socket,
      onStateChange: (state) => {
        setCallState(state);
        if (state === 'ended') {
          setLocalStream(null);
          setRemoteStream(null);
          setIncomingCall(null);
          setIsMuted(false);
          setIsVideoOff(false);
        }
      },
      onRemoteStream: (stream) => {
        setRemoteStream(stream);
      },
      onLocalStream: (stream) => {
        setLocalStream(stream);
      },
      onError: (err) => {
        setError(err);
      },
    });

    // Listen for incoming calls
    socket.on('call:incoming', (data: {
      callId: string;
      callerId: string;
      type: CallType;
      conversationId: string;
    }) => {
      // You would need to fetch caller info here
      setIncomingCall({
        callId: data.callId,
        callerId: data.callerId,
        callerName: 'Unknown', // Fetch from your user service
        type: data.type,
      });
    });

    return () => {
      webRTCManagerRef.current?.destroy();
      socket.off('call:incoming');
    };
  }, [socket]);

  const initiateCall = async (conversationId: string, type: CallType) => {
    try {
      setError(null);
      await webRTCManagerRef.current?.initiateCall(conversationId, type);
    } catch (err) {
      setError(err as Error);
    }
  };

  const acceptCall = async () => {
    try {
      setError(null);
      setIncomingCall(null);
      await webRTCManagerRef.current?.acceptCall();
    } catch (err) {
      setError(err as Error);
    }
  };

  const rejectCall = () => {
    webRTCManagerRef.current?.rejectCall();
    setIncomingCall(null);
  };

  const endCall = () => {
    webRTCManagerRef.current?.endCall();
  };

  const toggleMute = () => {
    const muted = webRTCManagerRef.current?.toggleMute();
    setIsMuted(muted ?? false);
  };

  const toggleVideo = () => {
    const videoOff = webRTCManagerRef.current?.toggleCamera();
    setIsVideoOff(videoOff ?? false);
  };

  const switchCamera = async () => {
    await webRTCManagerRef.current?.switchCamera();
  };

  return {
    // State
    callState,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    error,
    incomingCall,

    // Actions
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    switchCamera,

    // Utilities
    isCallActive: callState !== 'idle' && callState !== 'ended',
    isConnected: callState === 'connected',
  };
};