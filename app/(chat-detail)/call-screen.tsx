import { useWebRTCContext } from "@/app/contexts/WebRTCContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Mic,
  MicOff,
  PhoneOff,
  SwitchCamera,
  Video,
  VideoOff,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RTCView } from "react-native-webrtc";

const { width, height } = Dimensions.get("window");

export default function CallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const {
    callState,
    callType,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    endCall,
    toggleMute,
    toggleVideo,
    switchCamera,
    isSocketConnected,
    callInfo,
  } = useWebRTCContext();

  // Get receiver info from params or callInfo
  const [receiverName, setReceiverName] = useState<string>("User");
  const [receiverAvatar, setReceiverAvatar] = useState<string>("U");
  const [callDuration, setCallDuration] = useState<string>("");

  // Determine if video call - check multiple sources
  const isVideoCall =
    callType === "VIDEO" || (localStream?.getVideoTracks().length ?? 0) > 0;

  const handleVideoToggle = async () => {
    toggleVideo();
  };

  useEffect(() => {
    console.log("Call Screen - callType:", callType);
    console.log("Call Screen - localStream:", localStream ? "exists" : "null");
    console.log(
      "Call Screen - remoteStream:",
      remoteStream ? "exists" : "null"
    );
    console.log("Call Screen - isVideoCall:", isVideoCall);
    console.log("Call Screen - callState:", callState);
    console.log("Call Screen - isSocketConnected:", isSocketConnected);

    if (remoteStream) {
      console.log(
        "Call Screen - remoteStream video tracks:",
        remoteStream.getVideoTracks().length
      );
      console.log(
        "Call Screen - remoteStream audio tracks:",
        remoteStream.getAudioTracks().length
      );
    }
  }, [
    callType,
    localStream,
    remoteStream,
    isVideoCall,
    callState,
    isSocketConnected,
  ]);

  useEffect(() => {
    // Try to get receiver info from params first
    if (params.userName) {
      setReceiverName(params.userName as string);
      setReceiverAvatar((params.userName as string).charAt(0).toUpperCase());
    }
    // Then try from callInfo
    else if (callInfo?.recipientName) {
      setReceiverName(callInfo.recipientName);
      setReceiverAvatar(callInfo.recipientName.charAt(0).toUpperCase());
    }
    // Fallback to callInfo data
    else if (callInfo?.recipientId) {
      setReceiverName("User");
      setReceiverAvatar("U");
    }
  }, [params, callInfo]);

  // Update call duration every second when connected
  useEffect(() => {
    let interval: number | undefined;

    if (callState === "connected" && callInfo?.startTime) {
      interval = setInterval(() => {
        const startTime = callInfo.startTime;
        if (startTime) {
          const duration = Math.floor((Date.now() - startTime) / 1000);
          const minutes = Math.floor(duration / 60);
          const seconds = duration % 60;
          setCallDuration(
            `${minutes.toString().padStart(2, "0")}:${seconds
              .toString()
              .padStart(2, "0")}`
          );
        }
      }, 1000) as number;
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState, callInfo?.startTime]);

  useEffect(() => {
    // If call ends, go back
    if (callState === "ended") {
      setTimeout(() => {
        router.back();
      }, 500);
    }
  }, [callState]);

  const handleEndCall = () => {
    endCall();
    setTimeout(() => {
      router.back();
    }, 300);
  };

  const getCallStateText = () => {
    switch (callState) {
      case "initiating":
        return "Initiating...";
      case "outgoing":
        return "Ringing...";
      case "incoming":
        return "Incoming...";
      case "connecting":
        return "Connecting...";
      case "connected":
        return "Connected";
      case "ended":
        return "Call Ended";
      default:
        return "";
    }
  };

  const getCallDuration = () => {
    return callDuration || getCallStateText();
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <SafeAreaView className="flex-1 bg-[#1a1a1a]">
        {/* Remote Video (Full Screen) */}
        {remoteStream && isVideoCall ? (
          <RTCView
            streamURL={remoteStream.toURL()}
            style={{ width, height }}
            objectFit="cover"
            className="bg-black"
          />
        ) : (
          <View
            style={{ width, height }}
            className="bg-[#2a2a2a] justify-center items-center"
          >
            <View className="w-30 h-30 rounded-full bg-blue-500 justify-center items-center mb-5">
              <Text className="text-white text-5xl font-semibold">
                {receiverAvatar}
              </Text>
            </View>
            <Text className="text-white text-3xl font-semibold mb-2">
              {receiverName}
            </Text>
            <Text className="text-white/70 text-lg">{getCallStateText()}</Text>
          </View>
        )}

        {/* Local Video (Picture in Picture) */}
        {localStream && isVideoCall && !isVideoOff && (
          <View className="absolute top-[60px] right-5 w-[120px] h-[160px] rounded-xl overflow-hidden border-2 border-white">
            <RTCView
              streamURL={localStream.toURL()}
              style={{ width: "100%", height: "100%" }}
              objectFit="cover"
              mirror={true}
            />
          </View>
        )}

        {/* Call Info Overlay */}
        <View
          className="absolute left-0 right-0 items-center"
          style={{
            top:
              Platform.OS === "android"
                ? (StatusBar.currentHeight || 0) + 20
                : 60,
          }}
        >
          <Text className="text-white text-2xl font-semibold mb-1">
            {receiverName}
          </Text>
          <Text className="text-white/80 text-base">
            {callState === "connected" ? getCallDuration() : getCallStateText()}
          </Text>
          {isVideoCall && (
            <View className="flex-row items-center bg-blue-500/30 px-3 py-1 rounded-xl mt-2">
              <Video size={14} color="#fff" />
              <Text className="text-white text-xs font-medium ml-1">
                Video Call
              </Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View className="absolute bottom-12 left-0 right-0 items-center">
          {/* Switch Camera Button (only for video calls) */}
          {localStream && isVideoCall && !isVideoOff && (
            <TouchableOpacity
              className="absolute -top-20 w-12 h-12 rounded-full bg-white/20 justify-center items-center"
              onPress={switchCamera}
              activeOpacity={0.8}
            >
              <SwitchCamera size={24} color="#fff" />
            </TouchableOpacity>
          )}

          <View className="flex-row justify-center items-center gap-5">
            {/* Mute Button */}
            <TouchableOpacity
              className={`w-20 h-20 rounded-full justify-center items-center ${
                isMuted ? "bg-red-500/80" : "bg-white/20"
              }`}
              onPress={toggleMute}
              activeOpacity={0.8}
            >
              {isMuted ? (
                <MicOff size={28} color="#fff" />
              ) : (
                <Mic size={28} color="#fff" />
              )}
            </TouchableOpacity>

            {/* End Call Button */}
            <TouchableOpacity
              className="w-[50px] h-[50px] rounded-full bg-red-500 justify-center items-center"
              onPress={handleEndCall}
              activeOpacity={0.8}
            >
              <PhoneOff size={30} color="#fff" />
            </TouchableOpacity>

            {/* Video Toggle Button */}
            <TouchableOpacity
              className={`w-15 h-15 rounded-full justify-center items-center ${
                isVideoOff ? "bg-red-500/80" : "bg-green-500/20"
              }`}
              onPress={handleVideoToggle}
              activeOpacity={0.8}
            >
              {isVideoOff ? (
                <VideoOff size={28} color="#fff" />
              ) : (
                <Video size={28} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
