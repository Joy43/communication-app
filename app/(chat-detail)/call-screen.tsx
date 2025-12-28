
import React, { useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { RTCView } from 'react-native-webrtc';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  SwitchCamera,
} from 'lucide-react-native';
// import { useWebRTC } from '../hooks/useWebRTC';
import { useRouter } from 'expo-router';
import { useWebRTC } from '@/app/hooks/useWebRTC';

const { width, height } = Dimensions.get('window');

export default function CallScreen() {
  const router = useRouter();
  const {
    callState,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    endCall,
    toggleMute,
    toggleVideo,
    switchCamera,
    isConnected,
  } = useWebRTC();

  useEffect(() => {
    // If call ends, go back
    if (callState === 'ended') {
      router.back();
    }
  }, [callState]);

  const handleEndCall = () => {
    endCall();
    router.back();
  };

  const getCallStateText = () => {
    switch (callState) {
      case 'initiating':
        return 'Initiating...';
      case 'ringing':
        return 'Ringing...';
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'Connected';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Remote Video (Full Screen) */}
      {remoteStream && isConnected ? (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.remoteVideo}
          objectFit="cover"
        />
      ) : (
        <View style={styles.placeholderVideo}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>U</Text>
          </View>
          <Text style={styles.callingText}>{getCallStateText()}</Text>
        </View>
      )}

      {/* Local Video (Picture in Picture) */}
      {localStream && !isVideoOff && (
        <View style={styles.localVideoContainer}>
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.localVideo}
            objectFit="cover"
            mirror={true}
          />
        </View>
      )}

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.controls}>
          {/* Mute Button */}
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={toggleMute}
          >
            {isMuted ? (
              <MicOff size={28} color="#fff" />
            ) : (
              <Mic size={28} color="#fff" />
            )}
          </TouchableOpacity>

          {/* End Call Button */}
          <TouchableOpacity
            style={styles.endCallButton}
            onPress={handleEndCall}
          >
            <PhoneOff size={32} color="#fff" />
          </TouchableOpacity>

          {/* Video Toggle Button */}
          <TouchableOpacity
            style={[styles.controlButton, isVideoOff && styles.controlButtonActive]}
            onPress={toggleVideo}
          >
            {isVideoOff ? (
              <VideoOff size={28} color="#fff" />
            ) : (
              <Video size={28} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Switch Camera Button (only for video calls) */}
        {localStream && !isVideoOff && (
          <TouchableOpacity
            style={styles.switchCameraButton}
            onPress={switchCamera}
          >
            <SwitchCamera size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Call Info Overlay */}
      <View style={styles.topOverlay}>
        <Text style={styles.userName}>John Doe</Text>
        <Text style={styles.callStatus}>{getCallStateText()}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  remoteVideo: {
    width: width,
    height: height,
    backgroundColor: '#000',
  },
  placeholderVideo: {
    width: width,
    height: height,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 48,
    color: '#fff',
    fontWeight: '600',
  },
  callingText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '500',
  },
  localVideoContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  endCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchCameraButton: {
    marginTop: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
  },
  callStatus: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});