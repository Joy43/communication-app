import React, { createContext, ReactNode, useContext } from "react";
import { MediaStream } from "react-native-webrtc";
import { useWebRTC } from "../hooks/useWebRTC";
import { selectaccessToken, selectUser } from "../redux/auth/auth.slice";
import { useAppSelector } from "../redux/hook";
import { CallState, CallType } from "../services/webRTCManager";

interface WebRTCContextType {
  callState: CallState;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  error: Error | null;
  incomingCall: {
    callId: string;
    callerId: string;
    callerName: string;
    type: CallType;
    title?: string;
  } | null;
  callInfo: {
    callId?: string;
    recipientId?: string;
    recipientName?: string;
    startTime?: number;
  } | null;
  callType: CallType | null;
  isSocketConnected: boolean;
  initiateCall: (
    recipientUserId: string,
    type: CallType,
    title?: string
  ) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  switchCamera: () => Promise<void>;
}

const WebRTCContext = createContext<WebRTCContextType | undefined>(undefined);

interface WebRTCProviderProps {
  children: ReactNode;
}

export const WebRTCProvider = ({ children }: WebRTCProviderProps) => {
  const currentUser = useAppSelector(selectUser);
  const token = useAppSelector(selectaccessToken);

  // Debug: Log authentication status
  React.useEffect(() => {
    console.log("WebRTCProvider: Auth status", {
      hasUser: !!currentUser,
      hasToken: !!token,
      userId: currentUser?.id,
    });
  }, [currentUser, token]);

  const webRTCValues = useWebRTC();

  // Debug logging for socket connection
  React.useEffect(() => {
    console.log(
      "WebRTCProvider: Socket connected:",
      webRTCValues.isSocketConnected
    );
  }, [webRTCValues.isSocketConnected]);

  // Debug logging for incoming calls
  React.useEffect(() => {
    if (webRTCValues.incomingCall) {
      console.log("WebRTCProvider: Incoming call detected!", {
        callId: webRTCValues.incomingCall.callId,
        from: webRTCValues.incomingCall.callerId,
        callerName: webRTCValues.incomingCall.callerName,
      });
    }
  }, [webRTCValues.incomingCall]);

  return (
    <WebRTCContext.Provider value={webRTCValues}>
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTCContext = () => {
  const context = useContext(WebRTCContext);
  if (context === undefined) {
    throw new Error("useWebRTCContext must be used within a WebRTCProvider");
  }
  return context;
};
