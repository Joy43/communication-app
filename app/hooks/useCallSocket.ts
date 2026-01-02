import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { selectaccessToken, selectUser } from "../redux/auth/auth.slice";
import { useAppSelector } from "../redux/hook";

interface CallSocketCallbacks {
  onIncomingCall?: (data: {
    callId: string;
    from: string;
    title?: string;
  }) => void;
  onCallStarted?: (data: {
    callId: string;
    to: string;
    title?: string;
  }) => void;
  onCallActive?: (data: { callId: string }) => void;
  onCallDeclined?: (data: { callId: string }) => void;
  onCallEnded?: (data: { callId: string }) => void;
  onWebRTCOffer?: (data: { roomId: string; offer: any }) => void;
  onWebRTCAnswer?: (data: { roomId: string; answer: any }) => void;
  onIceCandidate?: (data: { roomId: string; candidate: any }) => void;
  onSocketDisconnected?: (reason: string) => void;
  onSocketReconnected?: () => void;
}

export const useCallSocket = (callbacks?: CallSocketCallbacks) => {
  const socketRef = useRef<Socket | null>(null);
  const callbacksRef = useRef<CallSocketCallbacks | undefined>(callbacks);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasActiveCallRef = useRef<boolean>(false);

  const token = useAppSelector(selectaccessToken);
  const currentUser = useAppSelector(selectUser);

  // Update callbacks ref when callbacks change
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    console.log("useCallSocket: Checking auth", {
      hasToken: !!token,
      hasUser: !!currentUser,
      userId: currentUser?.id,
    });

    if (!token) {
      console.warn(
        "useCallSocket: No token available for call socket connection"
      );
      return;
    }

    if (!currentUser?.id) {
      console.warn("useCallSocket: No current user ID available");
      return;
    }

    console.log(
      "useCallSocket: Initializing call socket connection for user:",
      currentUser.id
    );

    // Initialize socket connection to /call namespace
    const baseUrl = "https://unwritable-israel-ecclesiological.ngrok-free.dev";
    console.log("useCallSocket: Call socket connecting to:", `${baseUrl}/call`);
    const socket = io(`${baseUrl}/call`, {
      auth: { token },
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      timeout: 20000,
    });

    console.log(
      "useCallSocket: Socket instance created, waiting for connection..."
    );
    socketRef.current = socket;

    // Connection events
    socket.on("connect", () => {
      console.log("useCallSocket: ✅ Call socket connected:", socket.id);
      setIsConnected(true);
      setError(null);
    });

    socket.on("disconnect", (reason) => {
      console.log("useCallSocket: ❌ Call socket disconnected:", reason);
      console.warn("useCallSocket: Disconnect reason details:", {
        reason,
        wasConnected: isConnected,
        hasActiveCall: hasActiveCallRef.current,
        timestamp: new Date().toISOString(),
      });
      setIsConnected(false);

      // Notify about disconnection during active call
      if (hasActiveCallRef.current) {
        console.error(
          "useCallSocket: ⚠️ Socket disconnected during active call!"
        );
        callbacksRef.current?.onSocketDisconnected?.(reason);
      }

      // If disconnected due to timeout during a call, set error
      if (reason === "ping timeout" || reason === "transport close") {
        setError("Connection lost. Reconnecting...");
      }
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log(
        "useCallSocket: 🔄 Reconnected after",
        attemptNumber,
        "attempts"
      );
      setError(null);

      // Notify about reconnection
      if (hasActiveCallRef.current) {
        console.warn("useCallSocket: ⚠️ Reconnected but call may be disrupted");
        callbacksRef.current?.onSocketReconnected?.();
      }
    });

    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log("useCallSocket: 🔄 Reconnection attempt", attemptNumber);
    });

    socket.on("reconnect_failed", () => {
      console.error("useCallSocket: ❌ Reconnection failed");
      setError("Unable to reconnect. Please check your connection.");
    });

    socket.on("connect_error", (err) => {
      console.error(
        "useCallSocket: ❌ Call socket connection error:",
        err.message
      );
      setError(err.message);
      setIsConnected(false);
    });

    // Call lifecycle events
    socket.on(
      "incoming-call",
      (data: { callId: string; from: string; title?: string }) => {
        console.log("useCallSocket: 📞 Incoming call event received:", data);
        callbacksRef.current?.onIncomingCall?.(data);
      }
    );

    socket.on(
      "call-started",
      (data: { callId: string; to: string; title?: string }) => {
        console.log("Call started:", data);
        callbacksRef.current?.onCallStarted?.(data);
      }
    );

    socket.on("call-active", (data: { callId: string }) => {
      console.log("Call active:", data);
      callbacksRef.current?.onCallActive?.(data);
    });

    socket.on("call-declined", (data: { callId: string }) => {
      console.log("Call declined:", data);
      callbacksRef.current?.onCallDeclined?.(data);
    });

    socket.on("call-ended", (data: { callId: string }) => {
      console.log("Call ended:", data);
      callbacksRef.current?.onCallEnded?.(data);
    });

    // WebRTC signaling events
    socket.on("webrtc-offer", (data: { roomId: string; offer: any }) => {
      console.log("📥 WebRTC offer received from backend:", {
        roomId: data.roomId,
        offerLength: data.offer?.length,
        timestamp: new Date().toISOString(),
      });
      callbacksRef.current?.onWebRTCOffer?.(data);
    });

    socket.on("webrtc-answer", (data: { roomId: string; answer: any }) => {
      console.log("WebRTC answer received:", data.roomId);
      callbacksRef.current?.onWebRTCAnswer?.(data);
    });

    socket.on("ice-candidate", (data: { roomId: string; candidate: any }) => {
      console.log("ICE candidate received");
      callbacksRef.current?.onIceCandidate?.(data);
    });

    // Error handling
    socket.on("error", (error: any) => {
      console.error("Call socket error:", error);
      setError(error.message || "Socket error occurred");
    });

    // Cleanup
    return () => {
      console.log("useCallSocket: Disconnecting call socket...");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("reconnect");
      socket.off("reconnect_attempt");
      socket.off("reconnect_failed");
      socket.off("connect_error");
      socket.off("incoming-call");
      socket.off("call-started");
      socket.off("call-active");
      socket.off("call-declined");
      socket.off("call-ended");
      socket.off("webrtc-offer");
      socket.off("webrtc-answer");
      socket.off("ice-candidate");
      socket.off("error");
      socket.disconnect();
    };
  }, [token, currentUser?.id]); // Removed callbacks from dependencies

  // Socket emit helpers
  const startCall = (data: {
    hostUserId: string;
    recipientUserId: string;
    title?: string;
  }) => {
    if (!socketRef.current?.connected) {
      console.error("Socket not connected");
      throw new Error("Socket not connected");
    }
    console.log("Emitting start-call:", data);
    hasActiveCallRef.current = true;
    socketRef.current.emit("start-call", data);
  };

  const acceptCall = (data: { callId: string; callerId: string }) => {
    if (!socketRef.current?.connected) {
      console.error("Socket not connected");
      throw new Error("Socket not connected");
    }
    console.log("Emitting accept-call:", data);
    hasActiveCallRef.current = true;
    socketRef.current.emit("accept-call", data);
  };

  const declineCall = (data: { callId: string }) => {
    if (!socketRef.current?.connected) {
      console.error("Socket not connected");
      throw new Error("Socket not connected");
    }
    console.log("Emitting decline-call:", data);
    hasActiveCallRef.current = false;
    socketRef.current.emit("decline-call", data);
  };

  const endCall = (data: {
    callId: string;
    callerId: string;
    receiverId: string;
  }) => {
    if (!socketRef.current?.connected) {
      console.error("Socket not connected");
      throw new Error("Socket not connected");
    }
    console.log("Emitting end-call:", data);
    hasActiveCallRef.current = false;
    socketRef.current.emit("end-call", data);
  };

  // WebRTC signaling helpers
  const sendWebRTCOffer = (data: {
    roomId: string;
    offer: any;
    receiverId: string;
  }) => {
    console.log("📤 Attempting to send WebRTC offer:", {
      roomId: data.roomId,
      receiverId: data.receiverId,
      socketConnected: socketRef.current?.connected,
      socketId: socketRef.current?.id,
      offerLength: data.offer?.length,
    });

    if (!socketRef.current?.connected) {
      console.error("❌ sendWebRTCOffer: Socket not connected!");
      throw new Error("Socket not connected");
    }

    socketRef.current.emit("webrtc-offer", data);
    console.log("✅ WebRTC offer emitted to socket");
  };

  const sendWebRTCAnswer = (data: {
    roomId: string;
    answer: any;
    callerId: string;
  }) => {
    if (!socketRef.current?.connected) {
      console.error("Socket not connected");
      throw new Error("Socket not connected");
    }
    console.log("Emitting webrtc-answer to roomId:", data.roomId);
    socketRef.current.emit("webrtc-answer", data);
  };

  const sendIceCandidate = (data: {
    roomId: string;
    candidate: any;
    targetUserId: string;
  }) => {
    if (!socketRef.current?.connected) {
      console.error("Socket not connected");
      return;
    }
    socketRef.current.emit("ice-candidate", data);
  };

  return {
    socket: socketRef.current,
    isConnected,
    error,
    currentUserId: currentUser?.id,
    // Call actions
    startCall,
    acceptCall,
    declineCall,
    endCall,
    // WebRTC signaling
    sendWebRTCOffer,
    sendWebRTCAnswer,
    sendIceCandidate,
  };
};
