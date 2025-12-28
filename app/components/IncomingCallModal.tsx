// app/components/IncomingCallModal.tsx
import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
} from 'react-native';
import { Phone, PhoneOff, Video } from 'lucide-react-native';
// import { useWebRTC } from '../hooks/useWebRTC';
import { useRouter } from 'expo-router';
import { useWebRTC } from '../hooks/useWebRTC';

export const IncomingCallModal = () => {
  const router = useRouter();
  const { incomingCall, acceptCall, rejectCall } = useWebRTC();
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    if (incomingCall) {
      // Start vibration pattern
      Vibration.vibrate([0, 1000, 1000], true);

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      return () => {
        Vibration.cancel();
      };
    }
  }, [incomingCall]);

  const handleAccept = async () => {
    await acceptCall();
    router.push('/call-screen');
  };

  const handleReject = () => {
    rejectCall();
  };

  if (!incomingCall) return null;

  return (
    <Modal
      visible={!!incomingCall}
      transparent
      animationType="fade"
      onRequestClose={handleReject}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Caller Info */}
          <View style={styles.callerInfo}>
            <Animated.View
              style={[
                styles.avatar,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Text style={styles.avatarText}>
                {incomingCall.callerName.charAt(0).toUpperCase()}
              </Text>
            </Animated.View>

            <Text style={styles.callerName}>{incomingCall.callerName}</Text>
            
            <View style={styles.callTypeContainer}>
              {incomingCall.type === 'VIDEO' && (
                <Video size={20} color="#3B82F6" />
              )}
              <Text style={styles.callType}>
                {incomingCall.type === 'VIDEO' ? 'Video Call' : 'Voice Call'}
              </Text>
            </View>

            <Text style={styles.incomingText}>Incoming call...</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {/* Reject Button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleReject}
            >
              <PhoneOff size={32} color="#fff" />
              <Text style={styles.actionText}>Decline</Text>
            </TouchableOpacity>

            {/* Accept Button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={handleAccept}
            >
              <Phone size={32} color="#fff" />
              <Text style={styles.actionText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  callerInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: '600',
  },
  callerName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  callTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  callType: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  incomingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 20,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});