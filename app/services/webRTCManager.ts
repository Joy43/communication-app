import {
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from "react-native-webrtc";

export type CallType = "AUDIO" | "VIDEO";
export type CallState =
  | "idle"
  | "initiating"
  | "outgoing"
  | "incoming"
  | "connecting"
  | "connected"
  | "ended";

interface WebRTCManagerConfig {
  currentUserId: string;
  onStateChange: (state: CallState) => void;
  onRemoteStream: (stream: MediaStream) => void;
  onLocalStream: (stream: MediaStream) => void;
  onError: (error: Error) => void;
  // WebRTC signaling callbacks
  onSendOffer: (data: {
    roomId: string;
    offer: any;
    receiverId: string;
  }) => void;
  onSendAnswer: (data: {
    roomId: string;
    answer: any;
    callerId: string;
  }) => void;
  onSendIceCandidate: (data: {
    roomId: string;
    candidate: any;
    targetUserId: string;
  }) => void;
}

export class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private currentUserId: string;
  private remoteUserId: string | null = null;
  private callId: string | null = null;
  private callType: CallType = "AUDIO";
  private state: CallState = "idle";
  private iceCandidatesQueue: RTCIceCandidateInit[] = [];
  private pendingOffer: { roomId: string; offer: any } | null = null;

  private onStateChange: (state: CallState) => void;
  private onRemoteStream: (stream: MediaStream) => void;
  private onLocalStream: (stream: MediaStream) => void;
  private onError: (error: Error) => void;
  private onSendOffer: (data: {
    roomId: string;
    offer: any;
    receiverId: string;
  }) => void;
  private onSendAnswer: (data: {
    roomId: string;
    answer: any;
    callerId: string;
  }) => void;
  private onSendIceCandidate: (data: {
    roomId: string;
    candidate: any;
    targetUserId: string;
  }) => void;

  private iceServers = {
    iceServers: [
      // Google's public STUN servers (for NAT traversal)
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },

      // Free TURN servers from Metered (Open Relay Project)
      // These work for most scenarios including symmetric NAT
      {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443?transport=tcp",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
    ],
    iceCandidatePoolSize: 10, // Pre-gather ICE candidates for faster connection
  };

  constructor(config: WebRTCManagerConfig) {
    this.currentUserId = config.currentUserId;
    this.onStateChange = config.onStateChange;
    this.onRemoteStream = config.onRemoteStream;
    this.onLocalStream = config.onLocalStream;
    this.onError = config.onError;
    this.onSendOffer = config.onSendOffer;
    this.onSendAnswer = config.onSendAnswer;
    this.onSendIceCandidate = config.onSendIceCandidate;
  }

  // Getter for callId to allow checking from outside
  get hasActiveCall(): boolean {
    return this.callId !== null;
  }

  get activeCallId(): string | null {
    return this.callId;
  }

  private setState(state: CallState) {
    this.state = state;
    this.onStateChange(state);
  }

  async initiateCall(
    callId: string,
    recipientUserId: string,
    type: CallType
  ): Promise<void> {
    try {
      this.setState("initiating");
      this.callId = callId;
      this.remoteUserId = recipientUserId;
      this.callType = type;

      console.log("Initiating call:", { callId, recipientUserId, type });

      await this.setupLocalMedia(type);
      await this.setupPeerConnection();

      const offer = await this.peerConnection!.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: type === "VIDEO",
      });

      await this.peerConnection!.setLocalDescription(offer);

      console.log("📤 Sending WebRTC offer:", {
        callId,
        recipientUserId,
        offerType: offer.type,
        offerLength: offer.sdp?.length,
        peerConnectionState: this.peerConnection?.connectionState,
        iceGatheringState: this.peerConnection?.iceGatheringState,
      });

      this.onSendOffer({
        roomId: callId,
        offer: offer.sdp,
        receiverId: recipientUserId,
      });

      console.log("✅ WebRTC offer sent successfully");
      this.setState("outgoing");
    } catch (error) {
      console.error("Error initiating call:", error);
      this.onError(error as Error);
      this.setState("ended");
      this.cleanup();
      throw error;
    }
  }

  async prepareForIncomingCall(
    callId: string,
    callerId: string,
    type: CallType
  ): Promise<void> {
    try {
      this.callId = callId;
      this.remoteUserId = callerId;
      this.callType = type;
      this.setState("incoming");

      console.log("Prepared for incoming call:", { callId, callerId, type });
    } catch (error) {
      console.error("Error preparing for incoming call:", error);
      this.onError(error as Error);
      throw error;
    }
  }

  async acceptCall(): Promise<void> {
    if (!this.callId) {
      throw new Error("No active call to accept");
    }

    try {
      this.setState("connecting");

      console.log("Accepting call:", this.callId);

      await this.setupLocalMedia(this.callType);
      await this.setupPeerConnection();
      await this.processQueuedIceCandidates();

      console.log("Waiting for WebRTC offer from caller...");
    } catch (error) {
      console.error("Error accepting call:", error);
      this.onError(error as Error);
      this.endCall();
      throw error;
    }
  }

  async handleWebRTCOffer(data: { roomId: string; offer: any }): Promise<void> {
    console.log("📥 handleWebRTCOffer called:", {
      receivedRoomId: data.roomId,
      expectedCallId: this.callId,
      hasPeerConnection: !!this.peerConnection,
      currentState: this.state,
    });

    if (data.roomId !== this.callId) {
      console.warn("❌ Received offer for different call:", {
        received: data.roomId,
        expected: this.callId,
      });
      return;
    }

    // If peer connection isn't ready yet, queue the offer
    if (!this.peerConnection) {
      console.log("⏸️ Peer connection not ready yet - queuing offer for later");
      this.pendingOffer = data;
      return;
    }

    try {
      console.log("✅ Processing WebRTC offer for correct call");

      console.log("Creating RTCSessionDescription from offer");
      const offer = new RTCSessionDescription({
        type: "offer",
        sdp: data.offer,
      });

      console.log("Setting remote description...");
      await this.peerConnection.setRemoteDescription(offer);
      console.log("✅ Remote description set successfully");

      console.log("Processing queued ICE candidates...");
      await this.processQueuedIceCandidates();

      console.log("Creating answer...");
      const answer = await this.peerConnection.createAnswer();
      console.log("✅ Answer created successfully");

      console.log("Setting local description...");
      await this.peerConnection.setLocalDescription(answer);
      console.log("✅ Local description set successfully");

      console.log("📤 Sending WebRTC answer via socket");

      this.onSendAnswer({
        roomId: this.callId!,
        answer: answer.sdp,
        callerId: this.remoteUserId!,
      });

      console.log(
        "✅ WebRTC negotiation complete - setting state to connected"
      );
      this.setState("connected");
    } catch (error) {
      console.error("❌ Error handling offer:", error);
      this.onError(error as Error);
      this.endCall();
    }
  }

  async handleWebRTCAnswer(data: {
    roomId: string;
    answer: any;
  }): Promise<void> {
    if (data.roomId !== this.callId) {
      console.warn("Received answer for different call:", data.roomId);
      return;
    }

    try {
      console.log("Handling WebRTC answer");

      if (!this.peerConnection) {
        console.error("Peer connection not setup");
        throw new Error("Peer connection not setup");
      }

      const answer = new RTCSessionDescription({
        type: "answer",
        sdp: data.answer,
      });

      await this.peerConnection.setRemoteDescription(answer);
      await this.processQueuedIceCandidates();

      this.setState("connected");
      console.log("WebRTC connection established");
    } catch (error) {
      console.error("Error handling answer:", error);
      this.onError(error as Error);
      this.endCall();
    }
  }

  async handleIceCandidate(data: {
    roomId: string;
    candidate: any;
  }): Promise<void> {
    if (data.roomId !== this.callId) {
      return;
    }

    try {
      if (!data.candidate || !data.candidate.candidate) {
        return;
      }

      const candidate = new RTCIceCandidate({
        candidate: data.candidate.candidate,
        sdpMid: data.candidate.sdpMid,
        sdpMLineIndex: data.candidate.sdpMLineIndex,
      });

      if (!this.peerConnection?.remoteDescription) {
        console.log("Queueing ICE candidate");
        this.iceCandidatesQueue.push(candidate);
      } else if (this.peerConnection) {
        console.log("Adding ICE candidate");
        await this.peerConnection.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  }

  private async processQueuedIceCandidates(): Promise<void> {
    if (this.iceCandidatesQueue.length === 0 || !this.peerConnection) {
      return;
    }

    console.log(
      `Processing ${this.iceCandidatesQueue.length} queued ICE candidates`
    );

    for (const candidate of this.iceCandidatesQueue) {
      try {
        await this.peerConnection.addIceCandidate(candidate);
      } catch (error) {
        console.error("Error adding queued ICE candidate:", error);
      }
    }

    this.iceCandidatesQueue = [];
  }

  rejectCall() {
    console.log("Rejecting call");
    this.cleanup();
  }

  endCall() {
    console.log("Ending call");
    this.cleanup();
  }

  toggleMute(): boolean {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      console.log("Audio muted:", !audioTrack.enabled);
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

      if (this.localStream) {
        this.localStream.addTrack(videoTrack);
      } else {
        this.localStream = videoStream;
      }

      this.peerConnection.addTrack(videoTrack, this.localStream);
      this.callType = "VIDEO";
      this.onLocalStream(this.localStream);

      if (this.callId && this.remoteUserId) {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        this.onSendOffer({
          roomId: this.callId,
          offer: offer.sdp,
          receiverId: this.remoteUserId,
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
      console.log("Video enabled:", videoTrack.enabled);
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
      console.log("Camera switched");
    }
  }

  private async setupLocalMedia(type: CallType) {
    try {
      console.log("Setting up local media:", type);

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

      console.log("Local media setup complete");
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
      console.log("🔧 Setting up peer connection with ICE servers:", {
        stunServers: this.iceServers.iceServers.filter((s: any) =>
          s.urls.includes("stun")
        ).length,
        turnServers: this.iceServers.iceServers.filter((s: any) =>
          s.urls.includes("turn")
        ).length,
        totalServers: this.iceServers.iceServers.length,
      });

      this.peerConnection = new RTCPeerConnection(this.iceServers);

      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          console.log("Adding local track:", track.kind);
          this.peerConnection!.addTrack(track, this.localStream!);
        });
      }

      // @ts-ignore - react-native-webrtc event handlers
      this.peerConnection.onicecandidate = (event: any) => {
        if (event.candidate && this.callId && this.remoteUserId) {
          console.log("Sending ICE candidate");
          this.onSendIceCandidate({
            roomId: this.callId,
            candidate: {
              candidate: event.candidate.candidate,
              sdpMid: event.candidate.sdpMid,
              sdpMLineIndex: event.candidate.sdpMLineIndex,
            },
            targetUserId: this.remoteUserId,
          });
        }
      };

      // @ts-ignore - react-native-webrtc event handlers
      this.peerConnection.ontrack = (event: any) => {
        console.log("Received remote track:", event.track.kind);
        if (event.streams && event.streams[0]) {
          this.remoteStream = event.streams[0];
          if (this.remoteStream) {
            this.onRemoteStream(this.remoteStream);
          }
        }
      };

      // @ts-ignore - react-native-webrtc event handlers
      this.peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection?.connectionState;
        console.log("Connection state changed:", state);

        if (state === "connected") {
          this.setState("connected");
        } else if (state === "failed" || state === "disconnected") {
          this.onError(new Error("Connection failed"));
          this.endCall();
        }
      };

      console.log("Peer connection setup complete");

      // Process pending offer if one arrived early
      if (this.pendingOffer) {
        console.log("🔄 Processing pending offer that arrived early");
        const offer = this.pendingOffer;
        this.pendingOffer = null;
        await this.handleWebRTCOffer(offer);
      }
    } catch (error) {
      console.error("Failed to setup peer connection:", error);
      this.onError(new Error("Failed to setup connection. Please try again."));
      throw error;
    }
  }

  private cleanup() {
    console.log("Cleaning up WebRTC resources...");

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
        console.log("Stopped track:", track.kind);
      });
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.callId = null;
    this.remoteUserId = null;
    this.iceCandidatesQueue = [];
    this.setState("idle");
  }

  destroy() {
    console.log("Destroying WebRTC manager...");
    this.cleanup();
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

  getRemoteUserId(): string | null {
    return this.remoteUserId;
  }
}
