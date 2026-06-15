import { useAppSelector } from "@/src/redux/hook";
import { Bell, MessageCircle, Search } from "lucide-react-native";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const Header = () => {
  const insets = useSafeAreaInsets();
  const user = useAppSelector((state) => state.auth.user);

  const profilePicture =
    user?.profilePictureUrl ||
    "https://res.cloudinary.com/dkqdwcguu/image/upload/c_crop,w_512,h_512,g_auto/v1754275277/joy_img_3_ony3do.jpg";

  return (
    <View
      className="bg-[#2D55FF] pb-5 px-5 rounded-b-[32px]"
      style={{ paddingTop: insets.top + 8 }}
    >
      {/* Top Row: Title & Action Buttons */}
      <View className="flex-row items-center justify-between mb-4">
        {/* Title / Logo */}
        <View className="flex-row items-baseline">
          <Text className="text-white text-[26px] font-extrabold tracking-tight">
            Communication
          </Text>
          
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-2.5">
          <TouchableOpacity
            className="w-11 h-11 rounded-full bg-white/15 justify-center items-center"
            activeOpacity={0.8}
          >
            <Bell size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-11 h-11 rounded-full bg-white/15 justify-center items-center"
            activeOpacity={0.8}
          >
            <MessageCircle size={20} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Second Row: Avatar & Search Bar */}
      <View className="flex-row items-center gap-3">
        {/* Avatar */}
        <View className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#1E3A8A] bg-gray-100">
          <Image
            source={{ uri: profilePicture }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Search Bar */}
        <View className="flex-1 flex-row items-center bg-white rounded-full px-5 py-2.5 justify-between shadow-sm">
          <TextInput
            placeholder="Search"
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-sm font-semibold text-gray-800 p-0 mr-2"
            style={{ height: 20 }}
          />
          <Search size={18} color="#9CA3AF" strokeWidth={2.5} />
        </View>
      </View>
    </View>
  );
};
