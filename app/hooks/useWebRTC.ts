import { useEffect, useRef, useState } from "react";
import { MediaStream } from "react-native-webrtc";
import { selectaccessToken, selectUser } from "../redux/auth/auth.slice";
import { useAppSelector } from "../redux/hook";
import { CallState, CallType, WebRTCManager } from "../services/webRTCManager";
import { Call } from "../types/chat.type";
import { useCallSocket } from "./useCallSocket";

export const useWebRTC = () => {
  const currentUser = useAppSelector(selectUser);
  const currentUserId = currentUser?.id;
  const accessToken = useAppSelector(selectaccessToken);

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
    title?: string;
  } | null>(null);
  const [callInfo, setCallInfo] = useState<{
    callId?: string;
    recipientId?: string;
    recipientName?: string;
    startTime?: number;
  } | null>(null);
  const [callType, setCallType] = useState<CallType | null>(null);

  const callSocket = useCallSocket({
    onIncomingCall: (data) => {
      console.log("Incoming call received:", data);
      setIncomingCall({
        callId: data.callId,
        callerId: data.from,
        callerName: data.title || "Unknown User",
        type: "AUDIO", // Default to AUDIO, can be updated when offer is received
        title: data.title,
      });
      if (webRTCManagerRef.current && currentUserId) {
        webRTCManagerRef.current
          .prepareForIncomingCall(data.callId, data.from, "AUDIO")
          .catch((err) => {
            console.error("Error preparing for incoming call:", err);
            setError(err);
          });
      }
    },
    onCallStarted: (data) => {
      console.log("Call started:", data);
      setCallInfo({
        callId: data.callId,
        recipientId: data.to,
        startTime: Date.now(),
      });

      // Now initiate WebRTC connection after backend confirms call creation
      if (webRTCManagerRef.current && currentUserId && callType) {
        webRTCManagerRef.current
          .initiateCall(data.callId, data.to, callType)
          .catch((err) => {
            console.error("Error initiating WebRTC after call-started:", err);
            setError(err);
          });
      }
    },
    onCallActive: (data) => {
      console.log("Call active:", data);
      setCallState("connected");
    },
    onCallDeclined: (data) => {
      console.log("Call declined:", data);
      setCallState("ended");
      setError(new Error("Call was declined"));
      setIncomingCall(null);
      webRTCManagerRef.current?.endCall();
    },
    onCallEnded: (data) => {
      console.log("Call ended:", data);
      setCallState("ended");
      setIncomingCall(null);
      setCallInfo(null);
      webRTCManagerRef.current?.endCall();
    },
    onWebRTCOffer: (data) => {
      console.log("WebRTC offer received:", data.roomId);
      webRTCManagerRef.current?.handleWebRTCOffer(data).catch((err) => {
        console.error("Error handling WebRTC offer:", err);
        setError(err);
      });
    },
    onWebRTCAnswer: (data) => {
      console.log("WebRTC answer received:", data.roomId);
      webRTCManagerRef.current?.handleWebRTCAnswer(data).catch((err) => {
        console.error("Error handling WebRTC answer:", err);
        setError(err);
      });
    },
    onIceCandidate: (data) => {
      webRTCManagerRef.current?.handleIceCandidate(data).catch((err) => {
        console.error("Error handling ICE candidate:", err);
      });
    },
  });

  useEffect(() => {
    if (!currentUserId) {
      console.warn("No current user ID available");
      return;
    }
    console.log("Initializing WebRTC Manager for user:", currentUserId);
    webRTCManagerRef.current = new WebRTCManager({
      currentUserId,
      onStateChange: (state) => {
        console.log("WebRTC state changed:", state);
        setCallState(state);
        if (state === "ended") {
          setLocalStream(null);
          setRemoteStream(null);
          setIncomingCall(null);
          setIsMuted(false);
          setIsVideoOff(false);
          setCallInfo(null);
        }
      },
      onRemoteStream: (stream) => {
        console.log("Remote stream received");
        setRemoteStream(stream);
      },
      onLocalStream: (stream) => {
        console.log("Local stream ready");
        setLocalStream(stream);
      },
      onError: (err) => {
        console.error("WebRTC error:", err);
        setError(err);
      },
      onSendOffer: (data) => {
        console.log("Sending WebRTC offer via socket");
        callSocket.sendWebRTCOffer(data);
      },
      onSendAnswer: (data) => {
        console.log("Sending WebRTC answer via socket");
        callSocket.sendWebRTCAnswer(data);
      },
      onSendIceCandidate: (data) => {
        callSocket.sendIceCandidate(data);
      },
    });
    return () => {
      console.log("Cleaning up WebRTC Manager");
      webRTCManagerRef.current?.destroy();
    };
  }, [currentUserId]);

  const initiateCall = async (
    recipientUserId: string,
    type: CallType,
    title?: string
  ) => {
    try {
      if (!currentUserId) {
        throw new Error("Not authenticated");
      }
      if (!callSocket.isConnected) {
        throw new Error("Socket not connected");
      }
      console.log("Initiating call to:", recipientUserId);
      setCallType(type);
      setError(null);

      // Only emit the socket event - WebRTC will be initiated after call-started event
      callSocket.startCall({
        hostUserId: currentUserId,
        recipientUserId,
        title,
      });
    } catch (err) {
      console.error("Error initiating call:", err);
      setError(err as Error);
    }
  };

  const acceptCall = async () => {
    try {
      if (!incomingCall) {
        console.warn("No incoming call to accept");
        return;
      }
      if (!callSocket.isConnected) {
        throw new Error("Socket not connected");
      }
      console.log("Accepting call:", incomingCall.callId);
      setError(null);
      callSocket.acceptCall({
        callId: incomingCall.callId,
        callerId: incomingCall.callerId,
      });
      await webRTCManagerRef.current?.acceptCall();
      setCallInfo({
        callId: incomingCall.callId,
        recipientId: incomingCall.callerId,
        recipientName: incomingCall.callerName,
        startTime: Date.now(),
      });
      setIncomingCall(null);
    } catch (err) {
      console.error("Error accepting call:", err);
      setError(err as Error);
    }
  };

  const rejectCall = () => {
    if (!incomingCall) {
      console.warn("No incoming call to reject");
      return;
    }
    console.log("Rejecting call:", incomingCall.callId);
    callSocket.declineCall({
      callId: incomingCall.callId,
    });
    webRTCManagerRef.current?.rejectCall();
    setIncomingCall(null);
  };

  const endCall = () => {
    if (!callInfo?.callId) {
      console.warn("No active call to end");
      return;
    }
    if (!currentUserId) {
      console.warn("No current user ID");
      return;
    }
    console.log("Ending call:", callInfo.callId);
    const receiverId = callInfo.recipientId || "";
    if (callSocket.isConnected) {
      callSocket.endCall({
        callId: callInfo.callId,
        callerId: currentUserId,
        receiverId,
      });
    }
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

  const getCallStatus = async (callId: string): Promise<Call | null> => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_BASE_API || "";
      const response = await fetch(`${baseUrl}/call/${callId}/status`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get call status: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error("Error getting call status:", err);
      setError(err as Error);
      return null;
    }
  };

  const isCallActive = callState !== "idle" && callState !== "ended";

  return {
    callState,
    callType: callType || webRTCManagerRef.current?.getCallType() || "AUDIO",
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    error,
    incomingCall,
    callInfo,
    isSocketConnected: callSocket.isConnected,
    socketError: callSocket.error,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    enableVideo,
    switchCamera,
    getCallStatus,
    isCallActive,
    isConnected: callState === "connected",
    currentUserId,
  };
};
