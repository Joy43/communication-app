// app/services/WebRTCManager.ts
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';
import { Socket } from 'socket.io-client';

export type CallType = 'AUDIO' | 'VIDEO';
export type CallState = 'idle' | 'initiating' | 'ringing' | 'connecting' | 'connected' | 'ended';

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
  private callType: CallType = 'AUDIO';
  private state: CallState = 'idle';

  private onStateChange: (state: CallState) => void;
  private onRemoteStream: (stream: MediaStream) => void;
  private onLocalStream: (stream: MediaStream) => void;
  private onError: (error: Error) => void;

  private iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
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

  private setupSocketListeners() {
    // Incoming call
    this.socket.on('call:incoming', this.handleIncomingCall.bind(this));

    // Call accepted
    this.socket.on('call:accepted', this.handleCallAccepted.bind(this));

    // Call rejected
    this.socket.on('call:rejected', this.handleCallRejected.bind(this));

    // Call ended
    this.socket.on('call:ended', this.handleCallEnded.bind(this));

    // Call missed
    this.socket.on('call:missed', this.handleCallMissed.bind(this));

    // WebRTC signaling
    this.socket.on('call:offer', this.handleOffer.bind(this));
    this.socket.on('call:answer', this.handleAnswer.bind(this));
    this.socket.on('call:ice-candidate', this.handleIceCandidate.bind(this));

    // Participant disconnected
    this.socket.on('call:participant-disconnected', this.handleParticipantDisconnected.bind(this));
  }

  async initiateCall(conversationId: string, type: CallType): Promise<string> {
    try {
      this.setState('initiating');
      this.callType = type;

      // Get local media
      await this.setupLocalMedia(type);

      // Setup peer connection
      await this.setupPeerConnection();

      // Create offer
      const offer = await this.peerConnection!.createOffer();
      await this.peerConnection!.setLocalDescription(offer);

      // Call API to initiate call
      const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_API}/calls/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add your auth token here if needed
          // 'Authorization': `Bearer YOUR_TOKEN`,
        },
        body: JSON.stringify({
          conversationId,
          type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate call');
      }

      const data = await response.json();
      this.callId = data.callId;

      // Send offer via socket
      this.socket.emit('call:offer', {
        callId: this.callId,
        sdp: offer.sdp,
      });

      this.setState('ringing');
      return data.callId;
    } catch (error) {
      this.onError(error as Error);
      this.setState('ended');
      this.cleanup();
      throw error;
    }
  }

  async acceptCall() {
    if (!this.callId) {
      throw new Error('No active call to accept');
    }

    try {
      this.setState('connecting');

      // Setup local media
      await this.setupLocalMedia(this.callType);

      // Setup peer connection
      await this.setupPeerConnection();

      // Emit accept via socket - wait for offer from caller
      this.socket.emit('call:accept', { callId: this.callId });

      // The offer will come via handleOffer, and we'll create answer there
    } catch (error) {
      this.onError(error as Error);
      this.endCall();
      throw error;
    }
  }

  rejectCall() {
    if (!this.callId) return;

    this.socket.emit('call:reject', { callId: this.callId });
    this.cleanup();
  }

  endCall() {
    if (!this.callId) return;

    this.socket.emit('call:end', { callId: this.callId });
    this.cleanup();
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

  toggleCamera(): boolean {
    if (!this.localStream || this.callType !== 'VIDEO') return false;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return !videoTrack.enabled;
    }
    return false;
  }

  async switchCamera() {
    if (!this.localStream || this.callType !== 'VIDEO') return;

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
        video: type === 'VIDEO' ? {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        } : false,
      };

      this.localStream = await mediaDevices.getUserMedia(constraints);
      this.onLocalStream(this.localStream);
    } catch (error) {
      this.onError(new Error('Failed to access camera/microphone'));
      throw error;
    }
  }

  private async setupPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.iceServers);

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });
    }

    // Note: Remote stream handling not available through event handlers in react-native-webrtc
    // Remote streams will be handled through other mechanisms

    // Note: ICE candidate handling not available through event handlers in react-native-webrtc
    // ICE candidates will be handled through socket events

    // Note: Connection state monitoring not available in react-native-webrtc
    // State changes will be handled through socket events and manual state management
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
    this.setState('ringing');
  }

  private async handleCallAccepted(data: { callId: string; userId: string }) {
    if (data.callId !== this.callId) return;

    this.setState('connecting');
    
    // If peer connection not setup, set it up
    if (!this.peerConnection) {
      await this.setupPeerConnection();
      
      // Create and send offer
      const offer = await this.peerConnection!.createOffer();
      await this.peerConnection!.setLocalDescription(offer);

      this.socket.emit('call:offer', {
        callId: this.callId,
        sdp: offer.sdp,
      });
    }
  }

  private handleCallRejected(data: { callId: string; userId: string }) {
    if (data.callId !== this.callId) return;

    this.setState('ended');
    this.cleanup();
  }

  private handleCallEnded(data: { callId: string; userId: string }) {
    if (data.callId !== this.callId) return;

    this.setState('ended');
    this.cleanup();
  }

  private handleCallMissed(data: { callId: string }) {
    if (data.callId !== this.callId) return;

    this.setState('ended');
    this.cleanup();
  }

  private async handleOffer(data: { callId: string; userId: string; offer: string }) {
    if (data.callId !== this.callId) return;

    try {
      if (!this.peerConnection) {
        await this.setupPeerConnection();
      }

      const offer = new RTCSessionDescription({ type: 'offer', sdp: data.offer });
      await this.peerConnection!.setRemoteDescription(offer);

      const answer = await this.peerConnection!.createAnswer();
      await this.peerConnection!.setLocalDescription(answer);

      this.socket.emit('call:answer', {
        callId: this.callId,
        sdp: answer.sdp,
      });
    } catch (error) {
      this.onError(error as Error);
      this.endCall();
    }
  }

  private async handleAnswer(data: { callId: string; userId: string; answer: string }) {
    if (data.callId !== this.callId) return;

    try {
      const answer = new RTCSessionDescription({ type: 'answer', sdp: data.answer });
      await this.peerConnection!.setRemoteDescription(answer);
      this.setState('connected');
    } catch (error) {
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
      console.error('Error adding ICE candidate:', error);
    }
  }

  private handleParticipantDisconnected(data: { callId: string; userId: string }) {
    if (data.callId !== this.callId) return;

    this.setState('ended');
    this.cleanup();
  }

  private cleanup() {
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.callId = null;
    this.setState('idle');
  }

  destroy() {
    this.cleanup();
    this.socket.off('call:incoming');
    this.socket.off('call:accepted');
    this.socket.off('call:rejected');
    this.socket.off('call:ended');
    this.socket.off('call:missed');
    this.socket.off('call:offer');
    this.socket.off('call:answer');
    this.socket.off('call:ice-candidate');
    this.socket.off('call:participant-disconnected');
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