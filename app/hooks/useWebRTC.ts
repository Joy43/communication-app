import Constants from "expo-constants";
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
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCallerRef = useRef<boolean>(false);

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
    onIncomingCall: async (data) => {
      console.log("useWebRTC: 📞 Incoming call callback triggered:", data);
      const incomingCallData = {
        callId: data.callId,
        callerId: data.from,
        callerName: data.title || "Unknown User",
        type: "AUDIO" as CallType, // Default to AUDIO, can be updated when offer is received
        title: data.title,
      };
      console.log("useWebRTC: Setting incoming call state:", incomingCallData);
      setIncomingCall(incomingCallData);
      if (webRTCManagerRef.current && currentUserId) {
        try {
          console.log("useWebRTC: Preparing WebRTC manager for incoming call");
          await webRTCManagerRef.current.prepareForIncomingCall(
            data.callId,
            data.from,
            "AUDIO"
          );
          console.log("useWebRTC: ✅ WebRTC manager prepared successfully");
        } catch (err) {
          console.error(
            "useWebRTC: ❌ Error preparing for incoming call:",
            err
          );
          setError(err as Error);
        }
      } else {
        console.warn(
          "useWebRTC: Cannot prepare for call - missing WebRTC manager or user ID"
        );
      }
    },
    onCallStarted: (data) => {
      console.log("📞 onCallStarted received:", {
        callId: data.callId,
        to: data.to,
        currentUserId,
      });
      console.log("🎯 Setting this device as CALLER");
      isCallerRef.current = true; // Mark as caller
      setCallInfo({
        callId: data.callId,
        recipientId: data.to,
        startTime: Date.now(),
      });

      // Caller: Initiate WebRTC after backend confirms call creation
      if (webRTCManagerRef.current && currentUserId && callType) {
        console.log(
          "📤 CALLER: Now initiating WebRTC and sending offer to recipient"
        );
        webRTCManagerRef.current
          .initiateCall(data.callId, data.to, callType)
          .catch((err) => {
            console.error("❌ CALLER: Error initiating WebRTC:", err);
            setError(err);
          });
      } else {
        console.error(
          "❌ CALLER: Cannot initiate - missing manager, userId, or callType"
        );
      }
    },
    onCallActive: (data) => {
      console.log("📞 onCallActive received:", {
        callId: data.callId,
        isCaller: isCallerRef.current,
        hasWebRTCManager: !!webRTCManagerRef.current,
        currentCallState: callState,
      });

      // This is called on CALLER's side when recipient accepts
      // Caller should now send WebRTC offer
      if (isCallerRef.current && webRTCManagerRef.current) {
        console.log(
          "✅ This device is CALLER - offer was already sent in initiateCall"
        );
        // The offer should have already been sent in initiateCall
        // Just update state
        setCallState("connecting");
      } else {
        console.log(
          "⏳ This device is RECIPIENT - waiting for offer from caller"
        );
        // Timeout is already started in acceptCall after peer connection is ready
        // Just ensure state is connecting if not already
        if (callState !== "connecting" && callState !== "connected") {
          setCallState("connecting");
        }
      }
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
      // Clear connection timeout since offer arrived
      clearConnectionTimeout();
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
    onSocketDisconnected: (reason) => {
      console.error("useWebRTC: Socket disconnected during call:", reason);
      if (callState !== "idle" && callState !== "ended") {
        setError(
          new Error("Connection lost. Call ended due to network issue.")
        );
        // End the call after a short delay to show error message
        setTimeout(() => {
          endCall();
        }, 2000);
      }
    },
    onSocketReconnected: () => {
      console.warn(
        "useWebRTC: Socket reconnected, but call signaling may be lost"
      );
      // Don't automatically end - let timeout handle it
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

        if (state === "connected") {
          // Clear connection timeout when connected
          clearConnectionTimeout();
        }

        if (state === "ended") {
          clearConnectionTimeout();
          setLocalStream(null);
          setRemoteStream(null);
          setIncomingCall(null);
          setIsMuted(false);
          setIsVideoOff(false);
          setCallInfo(null);
          isCallerRef.current = false;
        }
      },
      onRemoteStream: (stream) => {
        console.log("Remote stream received - clearing timeout");
        clearConnectionTimeout();
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

  // Connection timeout helpers
  const startConnectionTimeout = () => {
    clearConnectionTimeout();
    console.log("Starting connection timeout (30 seconds)");
    connectionTimeoutRef.current = setTimeout(() => {
      console.error("Connection timeout - no WebRTC offer received");
      setError(
        new Error(
          "Connection timeout. The other user may have connectivity issues."
        )
      );
      endCall();
    }, 30000); // 30 seconds timeout
  };

  const clearConnectionTimeout = () => {
    if (connectionTimeoutRef.current) {
      console.log("Clearing connection timeout");
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
  };

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
        console.warn("acceptCall: No incoming call to accept");
        return;
      }
      if (!callSocket.isConnected) {
        throw new Error("Socket not connected");
      }
      if (!webRTCManagerRef.current) {
        throw new Error("WebRTC manager not initialized");
      }

      console.log("🎯 Setting this device as RECIPIENT");
      console.log("📱 RECIPIENT: Accepting call:", incomingCall.callId);
      console.log(
        "📱 RECIPIENT: WebRTC manager has active call:",
        webRTCManagerRef.current.hasActiveCall
      );
      console.log(
        "📱 RECIPIENT: WebRTC manager callId:",
        webRTCManagerRef.current.activeCallId
      );

      // Mark as recipient (not caller)
      isCallerRef.current = false;

      // Ensure WebRTC manager has the call ID set
      if (!webRTCManagerRef.current.hasActiveCall) {
        console.log(
          "acceptCall: WebRTC manager callId not set, preparing now..."
        );
        await webRTCManagerRef.current.prepareForIncomingCall(
          incomingCall.callId,
          incomingCall.callerId,
          incomingCall.type
        );
        console.log(
          "acceptCall: ✅ WebRTC manager prepared with callId:",
          webRTCManagerRef.current.activeCallId
        );
      }

      setError(null);

      // Notify backend that call is accepted
      console.log("acceptCall: Notifying backend of acceptance");
      callSocket.acceptCall({
        callId: incomingCall.callId,
        callerId: incomingCall.callerId,
      });

      // Accept the call in WebRTC manager
      console.log("acceptCall: Calling WebRTC manager acceptCall()");
      await webRTCManagerRef.current.acceptCall();

      // Start timeout waiting for WebRTC offer
      startConnectionTimeout();

      setCallInfo({
        callId: incomingCall.callId,
        recipientId: incomingCall.callerId,
        recipientName: incomingCall.callerName,
        startTime: Date.now(),
      });
      console.log(
        "acceptCall: ✅ Call accepted successfully, waiting for offer..."
      );
      setIncomingCall(null);
    } catch (err) {
      console.error("acceptCall: ❌ Error accepting call:", err);
      setError(err as Error);
      clearConnectionTimeout();
      // Don't clear incoming call on error so user can try again
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
    console.log("endCall: Ending call");
    clearConnectionTimeout();

    if (!callInfo?.callId) {
      console.warn("No active call to end");
      // Still clean up local state
      webRTCManagerRef.current?.endCall();
      setCallInfo(null);
      isCallerRef.current = false;
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
      const baseUrl = Constants.expoConfig?.extra?.BASE_URL || "";
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
