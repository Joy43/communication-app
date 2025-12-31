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
}

export const useCallSocket = (callbacks?: CallSocketCallbacks) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = useAppSelector(selectaccessToken);
  const currentUser = useAppSelector(selectUser);

  useEffect(() => {
    if (!token) {
      console.warn("No token available for call socket connection");
      return;
    }

    console.log("Initializing call socket connection...");

    // Initialize socket connection to /call namespace
    const socket = io(`${process.env.EXPO_PUBLIC_BASE_API}/call`, {
      auth: { token },
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    console.log('connecting to socket', socket.id);
    socketRef.current = socket;

    // Connection events
    socket.on("connect", () => {
      console.log("Call socket connected:", socket.id);
      setIsConnected(true);
      setError(null);
    });

    socket.on("disconnect", (reason) => {
      console.log("Call socket disconnected:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Call socket connection error:", err.message);
      setError(err.message);
      setIsConnected(false);
    });

    // Call lifecycle events
    socket.on(
      "incoming-call",
      (data: { callId: string; from: string; title?: string }) => {
        console.log("Incoming call:", data);
        callbacks?.onIncomingCall?.(data);
      }
    );

    socket.on(
      "call-started",
      (data: { callId: string; to: string; title?: string }) => {
        console.log("Call started:", data);
        callbacks?.onCallStarted?.(data);
      }
    );

    socket.on("call-active", (data: { callId: string }) => {
      console.log("Call active:", data);
      callbacks?.onCallActive?.(data);
    });

    socket.on("call-declined", (data: { callId: string }) => {
      console.log("Call declined:", data);
      callbacks?.onCallDeclined?.(data);
    });

    socket.on("call-ended", (data: { callId: string }) => {
      console.log("Call ended:", data);
      callbacks?.onCallEnded?.(data);
    });

    // WebRTC signaling events
    socket.on("webrtc-offer", (data: { roomId: string; offer: any }) => {
      console.log("WebRTC offer received:", data.roomId);
      callbacks?.onWebRTCOffer?.(data);
    });

    socket.on("webrtc-answer", (data: { roomId: string; answer: any }) => {
      console.log("WebRTC answer received:", data.roomId);
      callbacks?.onWebRTCAnswer?.(data);
    });

    socket.on("ice-candidate", (data: { roomId: string; candidate: any }) => {
      console.log("ICE candidate received");
      callbacks?.onIceCandidate?.(data);
    });

    // Error handling
    socket.on("error", (error: any) => {
      console.error("Call socket error:", error);
      setError(error.message || "Socket error occurred");
    });

    // Cleanup
    return () => {
      console.log("Disconnecting call socket...");
      socket.off("connect");
      socket.off("disconnect");
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
  }, [token]);

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
    socketRef.current.emit("start-call", data);
  };

  const acceptCall = (data: { callId: string; callerId: string }) => {
    if (!socketRef.current?.connected) {
      console.error("Socket not connected");
      throw new Error("Socket not connected");
    }
    console.log("Emitting accept-call:", data);
    socketRef.current.emit("accept-call", data);
  };

  const declineCall = (data: { callId: string }) => {
    if (!socketRef.current?.connected) {
      console.error("Socket not connected");
      throw new Error("Socket not connected");
    }
    console.log("Emitting decline-call:", data);
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
    socketRef.current.emit("end-call", data);
  };

  // WebRTC signaling helpers
  const sendWebRTCOffer = (data: {
    roomId: string;
    offer: any;
    receiverId: string;
  }) => {
    if (!socketRef.current?.connected) {
      console.error("Socket not connected");
      throw new Error("Socket not connected");
    }
    console.log("Emitting webrtc-offer to roomId:", data.roomId);
    socketRef.current.emit("webrtc-offer", data);
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
      return; // Don't throw error for ICE candidates
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
