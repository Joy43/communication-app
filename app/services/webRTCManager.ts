import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from "react-native-webrtc";
import { Socket } from "socket.io-client";

export type CallType = "AUDIO" | "VIDEO";
export type CallState =
  | "idle"
  | "initiating"
  | "ringing"
  | "connecting"
  | "connected"
  | "ended";

interface WebRTCManagerConfig {
  socket: Socket;
  onStateChange: (state: CallState) => void;
  onRemoteStream: (stream: MediaStream) => void;
  onLocalStream: (stream: MediaStream) => void;
  onError: (error: Error) => void;
}

export class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private socket: Socket;
  private callId: string | null = null;
  private callType: CallType = "AUDIO";
  private state: CallState = "idle";

  private onStateChange: (state: CallState) => void;
  private onRemoteStream: (stream: MediaStream) => void;
  private onLocalStream: (stream: MediaStream) => void;
  private onError: (error: Error) => void;

  private iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ],
  };

  constructor(config: WebRTCManagerConfig) {
    this.socket = config.socket;
    this.onStateChange = config.onStateChange;
    this.onRemoteStream = config.onRemoteStream;
    this.onLocalStream = config.onLocalStream;
    this.onError = config.onError;

    this.setupSocketListeners();
  }

  private setState(state: CallState) {
    this.state = state;
    this.onStateChange(state);
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      // Try multiple possible token keys
      let token = await AsyncStorage.getItem("authToken");

      if (!token) {
        token = await AsyncStorage.getItem("token");
      }

      if (!token) {
        token = await AsyncStorage.getItem("userToken");
      }

      if (!token) {
        console.warn("No auth token found in AsyncStorage");
      }

      return token;
    } catch (error) {
      console.error("Failed to get auth token:", error);
      return null;
    }
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await this.getAuthToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log("Auth headers prepared with token");
    } else {
      console.error("No token available for auth headers");
    }

    return headers;
  }

  private setupSocketListeners() {
    // Incoming call
    this.socket.on("call:incoming", this.handleIncomingCall.bind(this));

    // Call accepted
    this.socket.on("call:accepted", this.handleCallAccepted.bind(this));

    // Call rejected
    this.socket.on("call:rejected", this.handleCallRejected.bind(this));

    // Call ended
    this.socket.on("call:ended", this.handleCallEnded.bind(this));

    // Call missed
    this.socket.on("call:missed", this.handleCallMissed.bind(this));

    // WebRTC signaling
    this.socket.on("call:offer", this.handleOffer.bind(this));
    this.socket.on("call:answer", this.handleAnswer.bind(this));
    this.socket.on("call:ice-candidate", this.handleIceCandidate.bind(this));

    // Participant disconnected
    this.socket.on(
      "call:participant-disconnected",
      this.handleParticipantDisconnected.bind(this)
    );

    // Error handling
    this.socket.on("call:error", this.handleCallError.bind(this));
  }

  async initiateCall(conversationId: string, type: CallType): Promise<string> {
    try {
      this.setState("initiating");
      this.callType = type;

      // Check socket connection
      if (!this.socket.connected) {
        throw new Error(
          "Socket is not connected. Please check your internet connection."
        );
      }

      // Verify token before proceeding
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }

      // Get local media
      await this.setupLocalMedia(type);

      // Setup peer connection
      await this.setupPeerConnection();

      // Create offer
      const offer = await this.peerConnection!.createOffer();
      await this.peerConnection!.setLocalDescription(offer);

      // Get auth headers
      const headers = await this.getAuthHeaders();

      console.log(
        "Initiating call to:",
        `${process.env.EXPO_PUBLIC_BASE_API}/calls/initiate`
      );

      // Call API to initiate call
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_API}/calls/initiate`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            conversationId,
            type,
          }),
        }
      );

      console.log("Call initiate response status:", response.status);

      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Call initiate error:", errorData);
        throw new Error(
          errorData.message || `Failed to initiate call (${response.status})`
        );
      }

      const data = await response.json();
      this.callId = data.callId;

      console.log("Call initiated successfully:", this.callId);

      // Send offer via socket
      this.socket.emit("call:offer", {
        callId: this.callId,
        sdp: offer.sdp,
      });

      this.setState("ringing");
      return data.callId;
    } catch (error) {
      console.error("Error initiating call:", error);
      this.onError(error as Error);
      this.setState("ended");
      this.cleanup();
      throw error;
    }
  }

  async acceptCall() {
    if (!this.callId) {
      throw new Error("No active call to accept");
    }

    try {
      this.setState("connecting");

      // Check socket connection
      if (!this.socket.connected) {
        throw new Error("Socket is not connected");
      }

      // Verify token before proceeding
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }

      // Setup local media
      await this.setupLocalMedia(this.callType);

      // Setup peer connection
      await this.setupPeerConnection();

      // Get auth headers
      const headers = await this.getAuthHeaders();

      // Call API to accept call
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_API}/calls/${this.callId}/accept`,
        {
          method: "POST",
          headers,
        }
      );

      if (response.status === 401) {
        throw new Error("Unauthorized: Please login again");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to accept call (${response.status})`
        );
      }

      // Emit accept via socket - wait for offer from caller
      this.socket.emit("call:accept", { callId: this.callId });

      // The offer will come via handleOffer, and we'll create answer there
    } catch (error) {
      console.error("Error accepting call:", error);
      this.onError(error as Error);
      this.endCall();
      throw error;
    }
  }

  async rejectCall() {
    if (!this.callId) return;

    try {
      // Get auth headers
      const headers = await this.getAuthHeaders();

      // Call API to reject call
      await fetch(
        `${process.env.EXPO_PUBLIC_BASE_API}/calls/${this.callId}/reject`,
        {
          method: "POST",
          headers,
        }
      ).catch((err) => console.error("Failed to call reject API:", err));

      this.socket.emit("call:reject", { callId: this.callId });
      this.cleanup();
    } catch (error) {
      console.error("Error rejecting call:", error);
      this.cleanup();
    }
  }

  async endCall() {
    if (!this.callId) return;

    try {
      // Get auth headers
      const headers = await this.getAuthHeaders();

      // Call API to end call
      await fetch(
        `${process.env.EXPO_PUBLIC_BASE_API}/calls/${this.callId}/end`,
        {
          method: "POST",
          headers,
        }
      ).catch((err) => console.error("Failed to call end API:", err));

      this.socket.emit("call:end", { callId: this.callId });
      this.cleanup();
    } catch (error) {
      console.error("Error ending call:", error);
      this.cleanup();
    }
  }

  toggleMute(): boolean {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return !audioTrack.enabled;
    }
    return false;
  }

  async enableVideo(): Promise<boolean> {
    if (!this.peerConnection) {
      console.error("No peer connection available");
      return false;
    }

    try {
      console.log("Getting video stream...");

      // Get video track
      const videoStream = await mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
      });

      const videoTrack = videoStream.getVideoTracks()[0];

      if (!videoTrack) {
        throw new Error("No video track available");
      }

      // Add video track to existing local stream
      if (this.localStream) {
        this.localStream.addTrack(videoTrack);
      } else {
        this.localStream = videoStream;
      }

      // Add track to peer connection
      this.peerConnection.addTrack(videoTrack, this.localStream);

      // Update call type
      this.callType = "VIDEO";

      // Notify about local stream update
      this.onLocalStream(this.localStream);

      // Send updated offer to peer
      if (this.callId) {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        this.socket.emit("call:offer", {
          callId: this.callId,
          sdp: offer.sdp,
        });
      }

      console.log("Video enabled successfully");
      return true;
    } catch (error) {
      console.error("Failed to enable video:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (errorMessage.includes("Permission denied")) {
        this.onError(
          new Error(
            "Camera permission denied. Please enable camera permissions."
          )
        );
      } else {
        this.onError(new Error("Failed to enable video. Please try again."));
      }
      return false;
    }
  }

  toggleCamera(): boolean {
    if (!this.localStream || this.callType !== "VIDEO") return false;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return !videoTrack.enabled;
    }
    return false;
  }

  async switchCamera() {
    if (!this.localStream || this.callType !== "VIDEO") return;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      // @ts-ignore
      videoTrack._switchCamera();
    }
  }

  private async setupLocalMedia(type: CallType) {
    try {
      const constraints = {
        audio: true,
        video:
          type === "VIDEO"
            ? {
                facingMode: "user",
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 30 },
              }
            : false,
      };

      this.localStream = await mediaDevices.getUserMedia(constraints);
      this.onLocalStream(this.localStream);
    } catch (error) {
      console.error("Failed to access camera/microphone:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (errorMessage.includes("Permission denied")) {
        this.onError(
          new Error(
            "Camera/Microphone permission denied. Please enable permissions in settings."
          )
        );
      } else if (errorMessage.includes("NotFoundError")) {
        this.onError(new Error("No camera or microphone found on device."));
      } else {
        this.onError(
          new Error("Failed to access camera/microphone. Please try again.")
        );
      }
      throw error;
    }
  }

  private async setupPeerConnection() {
    try {
      this.peerConnection = new RTCPeerConnection(this.iceServers);

      // Add local stream tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          this.peerConnection!.addTrack(track, this.localStream!);
        });
      }

      // Note: ICE candidate handling not available through event handlers in react-native-webrtc
      // ICE candidates will be handled through socket events

      // Note: Remote stream and connection state monitoring not available in react-native-webrtc
      // These will be handled through socket events
    } catch (error) {
      console.error("Failed to setup peer connection:", error);
      this.onError(new Error("Failed to setup connection. Please try again."));
      throw error;
    }
  }

  private async handleIncomingCall(data: {
    callId: string;
    callerId: string;
    recipientId: string;
    type: CallType;
    conversationId: string;
  }) {
    this.callId = data.callId;
    this.callType = data.type;
    this.setState("ringing");
  }

  private async handleCallAccepted(data: { callId: string; userId: string }) {
    if (data.callId !== this.callId) return;

    this.setState("connecting");

    // If peer connection not setup, set it up
    if (!this.peerConnection) {
      await this.setupPeerConnection();

      // Create and send offer
      const offer = await this.peerConnection!.createOffer();
      await this.peerConnection!.setLocalDescription(offer);

      this.socket.emit("call:offer", {
        callId: this.callId,
        sdp: offer.sdp,
      });
    }
  }

  private handleCallRejected(data: { callId: string; userId: string }) {
    if (data.callId !== this.callId) return;

    this.setState("ended");
    this.cleanup();
  }

  private handleCallEnded(data: { callId: string; userId: string }) {
    if (data.callId !== this.callId) return;

    this.setState("ended");
    this.cleanup();
  }

  private handleCallMissed(data: { callId: string }) {
    if (data.callId !== this.callId) return;

    this.setState("ended");
    this.cleanup();
  }

  private async handleOffer(data: {
    callId: string;
    userId: string;
    offer: string;
  }) {
    if (data.callId !== this.callId) return;

    try {
      if (!this.peerConnection) {
        await this.setupPeerConnection();
      }

      const offer = new RTCSessionDescription({
        type: "offer",
        sdp: data.offer,
      });
      await this.peerConnection!.setRemoteDescription(offer);

      const answer = await this.peerConnection!.createAnswer();
      await this.peerConnection!.setLocalDescription(answer);

      this.socket.emit("call:answer", {
        callId: this.callId,
        sdp: answer.sdp,
      });

      this.setState("connecting");
    } catch (error) {
      console.error("Error handling offer:", error);
      this.onError(error as Error);
      this.endCall();
    }
  }

  private async handleAnswer(data: {
    callId: string;
    userId: string;
    answer: string;
  }) {
    if (data.callId !== this.callId) return;

    try {
      const answer = new RTCSessionDescription({
        type: "answer",
        sdp: data.answer,
      });
      await this.peerConnection!.setRemoteDescription(answer);
      // State will be updated when track is received
    } catch (error) {
      console.error("Error handling answer:", error);
      this.onError(error as Error);
      this.endCall();
    }
  }

  private async handleIceCandidate(data: {
    callId: string;
    userId: string;
    candidate: {
      candidate: string;
      sdpMid: string | null;
      sdpMLineIndex: number | null;
    };
  }) {
    if (data.callId !== this.callId) return;

    try {
      if (this.peerConnection && data.candidate && data.candidate.candidate) {
        const candidate = new RTCIceCandidate({
          candidate: data.candidate.candidate,
          sdpMid: data.candidate.sdpMid,
          sdpMLineIndex: data.candidate.sdpMLineIndex,
        });
        await this.peerConnection.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  }

  private handleParticipantDisconnected(data: {
    callId: string;
    userId: string;
  }) {
    if (data.callId !== this.callId) return;

    this.setState("ended");
    this.cleanup();
  }

  private handleCallError(data: { callId: string; error: string }) {
    if (data.callId !== this.callId) return;

    console.error("Call error received:", data.error);
    this.onError(new Error(data.error));
    this.cleanup();
  }

  private cleanup() {
    console.log("Cleaning up WebRTC resources...");

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
        console.log("Stopped track:", track.kind);
      });
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.callId = null;
    this.setState("idle");
  }

  destroy() {
    console.log("Destroying WebRTC manager...");
    this.cleanup();
    this.socket.off("call:incoming");
    this.socket.off("call:accepted");
    this.socket.off("call:rejected");
    this.socket.off("call:ended");
    this.socket.off("call:missed");
    this.socket.off("call:offer");
    this.socket.off("call:answer");
    this.socket.off("call:ice-candidate");
    this.socket.off("call:participant-disconnected");
    this.socket.off("call:error");
  }

  getState(): CallState {
    return this.state;
  }

  getCallId(): string | null {
    return this.callId;
  }

  getCallType(): CallType {
    return this.callType;
  }
}
