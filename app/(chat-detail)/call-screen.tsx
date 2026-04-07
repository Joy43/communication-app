
import { useWebRTCContext } from "@/src/contexts/WebRTCContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Mic,
  MicOff,
  PhoneOff,
  SwitchCamera,
  Video,
  VideoOff,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
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

  // -------------Get receiver info from params or callInfo -------------
  const [receiverName, setReceiverName] = useState<string>("User");
  const [receiverAvatar, setReceiverAvatar] = useState<string>("U");
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>("");
  const [callDuration, setCallDuration] = useState<string>("");

  // ----------- Determine if video call - check multiple sources -----------
  const isVideoCall =
    callType === "VIDEO" || (localStream?.getVideoTracks().length ?? 0) > 0;

  const handleVideoToggle = async () => {
    toggleVideo();
  };

  useEffect(() => {
    console.log("=== Call Screen Debug ===");
    console.log("callType:", callType);
    console.log("localStream:", localStream ? " exists" : "❌ null");
    console.log("remoteStream:", remoteStream ? " exists" : "❌ null");
    console.log("isVideoCall:", isVideoCall);
    console.log("callState:", callState);
    console.log("isSocketConnected:", isSocketConnected);
    console.log("isVideoOff:", isVideoOff);

    if (localStream) {
      console.log(
        "📹 localStream video tracks:",
        localStream.getVideoTracks().length,
      );
      console.log(
        "🔊 localStream audio tracks:",
        localStream.getAudioTracks().length,
      );
      console.log(
        "📹 localStream video enabled:",
        localStream.getVideoTracks()[0]?.enabled,
      );
    }

    if (remoteStream) {
      console.log(
        "📹 remoteStream video tracks:",
        remoteStream.getVideoTracks().length,
      );
      console.log(
        "🔊 remoteStream audio tracks:",
        remoteStream.getAudioTracks().length,
      );
      console.log(
        "📹 remoteStream video enabled:",
        remoteStream.getVideoTracks()[0]?.enabled,
      );
    }

    console.log("Rendering conditions:");
    console.log("  remoteStream && isVideoCall?", remoteStream && isVideoCall);
    console.log(
      "  localStream && isVideoCall && !isVideoOff?",
      localStream && isVideoCall && !isVideoOff,
    );
  }, [
    callType,
    localStream,
    remoteStream,
    isVideoCall,
    callState,
    isSocketConnected,
    isVideoOff,
  ]);

  useEffect(() => {

    if (params.userName) {
      setReceiverName(params.userName as string);
      const profilePic = params.profilePicture as string;
      if (
        profilePic &&
        typeof profilePic === "string" &&
        profilePic.length > 0
      ) {
        setProfilePictureUrl(profilePic);
      } else {
        setReceiverAvatar(
          typeof params.userName === "string"
            ? (params.userName as string).charAt(0).toUpperCase()
            : "U",
        );
      }
    }
    // ------------Then try from callInfo -------------
    else if (callInfo?.recipientName) {
      setReceiverName(callInfo.recipientName);
      setReceiverAvatar(callInfo.recipientName.charAt(0).toUpperCase());
    }
    //------  Fallback to callInfo data ----------
    else if (callInfo?.recipientId) {
      setReceiverName("User");
      setReceiverAvatar("U");
    }
  }, [params, callInfo]);

  // ----------- Update call duration every second when connected -----------
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

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
              .padStart(2, "0")}`,
          );
        }
      }, 1000);
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
        {/* Remote Video (Full Screen) OR Placeholder */}
        {remoteStream && isVideoCall ? (
          <View style={{ width, height }} className="bg-black">
            <RTCView
              streamURL={(remoteStream as any).toURL()}
              style={{ width, height }}
              objectFit="cover"
            />

            {/* subtle dark overlay for premium look */}
            <View
              pointerEvents="none"
              className="absolute left-0 right-0 top-0 bottom-0"
              style={{ backgroundColor: "rgba(0,0,0,0.22)" }}
            />

            {/* soft bottom gradient to make controls pop */}
            <View
              pointerEvents="none"
              className="absolute left-0 right-0"
              style={{
                height: 220,
                bottom: 0,
                backgroundColor: "transparent",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -8 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
              }}
            />
          </View>
        ) : (
          <View
            style={{ width, height }}
            className="bg-gradient-to-b from-[#1a1a1a] to-[#111111] justify-center items-center"
          >
            <View className="w-36 h-36 rounded-full bg-gradient-to-br from-[#4f46e5] to-[#06b6d4] justify-center items-center mb-4 shadow-lg border-2 border-white/10 overflow-hidden">
              {profilePictureUrl ? (
                <Image
                  source={{ uri: profilePictureUrl }}
                  style={{ width: 144, height: 144 }}
                  className="rounded-full"
                  onError={() => {
                    console.log(
                      "Failed to load profile picture:",
                      profilePictureUrl,
                    );
                    setProfilePictureUrl("");
                  }}
                />
              ) : (
                <Text className="text-white text-6xl font-extrabold">
                  {receiverAvatar}
                </Text>
              )}
            </View>

            <Text className="text-white text-3xl font-bold mb-1">
              {receiverName}
            </Text>
            <Text className="text-white/70 text-base mb-2">
              {getCallStateText()}
            </Text>

            <View className="flex-row items-center space-x-2 mt-2">
              <View className="bg-white/10 px-3 py-1 rounded-full">
                <Text className="text-white text-sm">Premium</Text>
              </View>
              {isVideoCall && (
                <View className="bg-blue-500/30 px-3 py-1 rounded-full">
                  <Video size={14} color="#fff" />
                </View>
              )}
            </View>
          </View>
        )}

        {/* Local Video (Picture in Picture) - ALWAYS SHOW IF AVAILABLE */}
        {localStream && isVideoCall ? (
          <View
            className="absolute"
            style={{ top: 60, right: 16, width: 140, height: 190 }}
          >
            <View
              className="w-full h-full rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl transform"
              style={{ elevation: 12 }}
            >
              <RTCView
                streamURL={(localStream as any).toURL()}
                style={{ width: "100%", height: "100%" }}
                objectFit="cover"
                mirror={true}
              />
              {/* You badge */}
              <View className="absolute bottom-3 left-3 bg-black/50 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-semibold">You</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Call Info Overlay */}
        <View
          className="absolute left-0 right-0 items-center"
          style={{
            top:
              Platform.OS === "android"
                ? (StatusBar.currentHeight || 0) + 18
                : 50,
          }}
        >
          <Text className="text-white text-2xl font-extrabold mb-1">
            {receiverName}
          </Text>
          <Text className="text-white/80 text-sm">
            {callState === "connected" ? getCallDuration() : getCallStateText()}
          </Text>

          <View className="flex-row items-center mt-3 space-x-2">
            <View className="bg-white/6 px-3 py-1 rounded-full">
              <Text className="text-white text-xs">High Quality</Text>
            </View>
            {isVideoCall && (
              <View className="flex-row items-center bg-blue-500/30 px-3 py-1 rounded-full">
                <Video size={14} color="#fff" />
                <Text className="text-white text-xs font-medium ml-2">
                  Video
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Controls */}
        <View className="absolute left-4 right-4 bottom-8">
          {/* floating switch camera top of control bar */}
          {localStream && isVideoCall && !isVideoOff && (
            <TouchableOpacity
              className="absolute -top-14 right-6 w-12 h-12 rounded-full bg-white/8 justify-center items-center shadow-lg"
              onPress={switchCamera}
              activeOpacity={0.85}
            >
              <SwitchCamera size={20} color="#fff" />
            </TouchableOpacity>
          )}

          {/* frosted control pill */}
          <View
            className="w-full rounded-3xl bg-white/6 px-4 py-3 flex-row justify-between items-center shadow-2xl"
            style={{ alignItems: "center" }}
          >
            <TouchableOpacity
              className={`w-14 h-14 rounded-full justify-center items-center ${isMuted ? "bg-red-500/90" : "bg-white/10"}`}
              onPress={toggleMute}
              activeOpacity={0.85}
            >
              {isMuted ? (
                <MicOff size={22} color="#fff" />
              ) : (
                <Mic size={22} color="#fff" />
              )}
            </TouchableOpacity>

            <View className="items-center">
              <TouchableOpacity
                className="w-20 h-20 rounded-full bg-red-500 justify-center items-center shadow-lg"
                onPress={handleEndCall}
                activeOpacity={0.85}
              >
                <PhoneOff size={28} color="#fff" />
              </TouchableOpacity>
              <Text className="text-white text-xs mt-2">End</Text>
            </View>

            <TouchableOpacity
              className={`w-14 h-14 rounded-full justify-center items-center ${isVideoOff ? "bg-red-500/90" : "bg-white/10"}`}
              onPress={handleVideoToggle}
              activeOpacity={0.85}
            >
              {isVideoOff ? (
                <VideoOff size={22} color="#fff" />
              ) : (
                <Video size={22} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
