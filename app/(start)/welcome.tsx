import { router } from "expo-router";
import { useRef, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

const onboarding = [
  {
    id: 1,
    title: "Connect with Friends",
    description: "Chat with your friends and family anytime, anywhere",
    image:
      "https://img.freepik.com/free-vector/mobile-chatting-concept_23-2148323044.jpg",
  },
  {
    id: 2,
    title: "Share Moments",
    description:
      "Share photos, videos, and special moments with people you care about",
    image:
      "https://img.freepik.com/free-vector/social-media-concept_23-2148321062.jpg",
  },
  {
    id: 3,
    title: "Stay Connected",
    description: "Never miss a message with real-time notifications",
    image:
      "https://img.freepik.com/free-vector/notifications-concept_23-2148318639.jpg",
  },
];

const OnboardingScreen = () => {
  const swiperRef = useRef<Swiper | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLastSlide = activeIndex === onboarding.length - 1;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TouchableOpacity
        onPress={() => router.push("/(auth)/sign-in")}
        className="w-full p-5 items-end"
      >
        <Text className="text-gray-800 text-base font-semibold">Skip</Text>
      </TouchableOpacity>

      <Swiper
        ref={swiperRef}
        loop={false}
        dot={<View className="w-8 h-1 mx-1 bg-gray-200 rounded-full" />}
        activeDot={<View className="w-8 h-1 mx-1 bg-blue-500 rounded-full" />}
        onIndexChanged={(index) => setActiveIndex(index)}
      >
        {onboarding.map((item) => (
          <View
            key={item.id}
            className="flex-1 items-center justify-center px-8"
          >
            <Image
              source={{ uri: item.image }}
              className="w-full h-80"
              resizeMode="contain"
            />
            <Text className="text-gray-900 text-3xl font-bold text-center mt-8">
              {item.title}
            </Text>
            <Text className="text-gray-500 text-base text-center mt-4 leading-6">
              {item.description}
            </Text>
          </View>
        ))}
      </Swiper>

      <View className="px-5 pb-8">
        <TouchableOpacity
          onPress={() =>
            isLastSlide
              ? router.push("/(auth)/sign-in")
              : swiperRef.current?.scrollBy(1)
          }
          className="w-full py-4 bg-blue-500 rounded-xl items-center"
        >
          <Text className="text-white text-base font-bold">
            {isLastSlide ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
