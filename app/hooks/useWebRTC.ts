import { useEffect, useRef, useState } from "react";
import { MediaStream } from "react-native-webrtc";
import { CallState, CallType, WebRTCManager } from "../services/webRTCManager";
import { useSocket } from "./useSocket";

export const useWebRTC = () => {
  const { socket } = useSocket();
  const webRTCManagerRef = useRef<WebRTCManager | null>(null);

  const [callState, setCallState] = useState<CallState>("idle");
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
  const [callInfo, setCallInfo] = useState<{
    conversationId: string;
    participantName?: string;
    participantId?: string;
    startTime?: number;
  } | null>(null);
  const [callType, setCallType] = useState<CallType | null>(null);

  useEffect(() => {
    if (!socket) return;

    // Initialize WebRTC Manager
    webRTCManagerRef.current = new WebRTCManager({
      socket,
      onStateChange: (state) => {
        setCallState(state);
        if (state === "ended") {
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
    socket.on(
      "call:incoming",
      (data: {
        callId: string;
        callerId: string;
        type: CallType;
        conversationId: string;
      }) => {
        // You would need to fetch caller info here
        setIncomingCall({
          callId: data.callId,
          callerId: data.callerId,
          callerName: "Unknown",
          type: data.type,
        });
      }
    );

    return () => {
      webRTCManagerRef.current?.destroy();
      socket.off("call:incoming");
    };
  }, [socket]);

  const initiateCall = async (conversationId: string, type: CallType) => {
    try {
      setCallType(type);
      setError(null);
      const callId = await webRTCManagerRef.current?.initiateCall(
        conversationId,
        type
      );

      // Set call info
      setCallInfo({
        conversationId,
        startTime: Date.now(),
      });

      return callId;
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
    setCallInfo(null);
  };

  const toggleMute = () => {
    const muted = webRTCManagerRef.current?.toggleMute();
    setIsMuted(muted ?? false);
  };

  const toggleVideo = () => {
    if (webRTCManagerRef.current) {
      const videoOff = webRTCManagerRef.current.toggleCamera();
      setIsVideoOff(videoOff);
    }
  };

  const enableVideo = async () => {
    if (!webRTCManagerRef.current) return;

    try {
      console.log("Enabling video...");
      const success = await webRTCManagerRef.current.enableVideo();

      if (success) {
        setCallType("VIDEO");
        setIsVideoOff(false);
        console.log("Video enabled successfully");
      }
    } catch (error) {
      console.error("Failed to enable video:", error);
      throw error;
    }
  };

  const switchCamera = async () => {
    await webRTCManagerRef.current?.switchCamera();
  };

  const isCallActive = callState !== "idle" && callState !== "ended";

  return {
    // State
    callState,
    callType: callType || webRTCManagerRef.current?.getCallType() || "AUDIO",
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    error,
    incomingCall,
    callInfo,

    // Actions
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    enableVideo,
    switchCamera,

    // Utilities
    isCallActive,
    isConnected: callState === "connected",
  };
};
