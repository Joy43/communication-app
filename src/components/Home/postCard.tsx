import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const POSTS = [
  {
    id: "1",
    author: {
      name: "Sarah Johnson",
      handle: "@sarahj",
      verified: true,
      badge: "SJ",
      badgeColor: "#FF6B6B",
      avatar: "👩‍💼",
    },
    timeAgo: "2h ago",
    content:
      "Just launched our new AI-powered design tool. The response has been amazing! 🚀",
    image: null,
    likes: 2450,
    comments: 312,
    shares: 890,
    liked: false,
    saved: false,
    tags: ["#Design", "#AI", "#Tech"],
  },
  {
    id: "2",
    author: {
      name: "Alex Rivera",
      handle: "@alexrivera",
      verified: true,
      badge: "AR",
      badgeColor: "#4ECDC4",
      avatar: "👨‍🎨",
    },
    timeAgo: "4h ago",
    content:
      "Beautiful sunset at the Golden Gate Bridge. Nature never ceases to amaze me 🌅",
    image: "🌅",
    likes: 5630,
    comments: 487,
    shares: 1200,
    liked: true,
    saved: true,
    tags: ["#Photography", "#Travel"],
  },
  {
    id: "3",
    author: {
      name: "Emma Chen",
      handle: "@emmachen",
      verified: false,
      badge: "EC",
      badgeColor: "#95E1D3",
      avatar: "👩‍💻",
    },
    timeAgo: "6h ago",
    content:
      "Sharing my journey into machine learning. Check out this comprehensive guide I wrote 📚",
    image: null,
    likes: 3200,
    comments: 256,
    shares: 650,
    liked: false,
    saved: true,
    tags: ["#MachineLearning", "#Education"],
  },
  {
    id: "4",
    author: {
      name: "Marcus Tech",
      handle: "@marcustech",
      verified: true,
      badge: "MT",
      badgeColor: "#FFD93D",
      avatar: "👨‍💻",
    },
    timeAgo: "8h ago",
    content:
      "Web3 adoption is accelerating faster than we anticipated. What's your take? 💭",
    image: null,
    likes: 1890,
    comments: 523,
    shares: 445,
    liked: false,
    saved: false,
    tags: ["#Web3", "#Crypto"],
  },
];

const PostCard = ({ post }: { post: (typeof POSTS)[0] }) => {
  const [liked, setLiked] = useState(post.liked);
  const [saved, setSaved] = useState(post.saved);
  const [likes, setLikes] = useState(post.likes);
  const toggleLike = () => {
    setLiked((prev: boolean) => !prev);
    setLikes((prev: number) => (liked ? prev - 1 : prev + 1));
  };

  const toggleSave = () => {
    setSaved((prev: boolean) => !prev);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };
  return (
    <SafeAreaView className="flex-1">
      <View className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm border border-gray-100">
        {/* Author Header */}
        <View className="flex-row justify-between items-center px-4 pt-4 pb-3">
          <View className="flex-row items-center gap-3 flex-1">
            {/* Avatar */}
            <View
              className="w-12 h-12 rounded-full justify-center items-center text-2xl"
              style={{ backgroundColor: post.author.badgeColor }}
            >
              <Text>{post.author.avatar}</Text>
            </View>

            {/* Author Info */}
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-0.5">
                <Text className="text-sm font-bold text-gray-900">
                  {post.author.name}
                </Text>
                {post.author.verified && (
                  <Text className="text-blue-500">✓</Text>
                )}
              </View>
              <View className="flex-row items-center gap-1">
                <Text className="text-xs text-gray-500">
                  {post.author.handle}
                </Text>
                <Text className="text-xs text-gray-400">•</Text>
                <Text className="text-xs text-gray-500">{post.timeAgo}</Text>
              </View>
            </View>
          </View>

          {/* Menu Button */}
          <TouchableOpacity className="p-2">
            <Text className="text-xl text-gray-400">⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="px-4 pb-3">
          <Text className="text-sm text-gray-800 leading-relaxed mb-3">
            {post.content}
          </Text>

          {/* Tags */}
          {post.tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2">
              {post.tags.map((tag: string, idx: number) => (
                <View key={idx} className="bg-blue-50 px-3 py-1.5 rounded-full">
                  <Text className="text-xs text-blue-600 font-semibold">
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Image Section */}
        {post.image && (
          <View className="bg-gradient-to-br from-blue-100 to-purple-100 px-4 py-6 justify-center items-center my-3 mx-4 rounded-xl">
            <Text className="text-6xl">{post.image}</Text>
          </View>
        )}

        {/* Stats Bar */}
        <View className="px-4 py-3 border-t border-b border-gray-100 flex-row justify-between">
          <View className="flex-row items-center gap-2">
            <Text className="text-red-500">❤️</Text>
            <Text className="text-xs text-gray-600 font-semibold">
              {formatNumber(likes)} likes
            </Text>
          </View>
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1">
              <Text className="text-xs text-gray-600 font-semibold">
                {formatNumber(post.comments)}
              </Text>
              <Text className="text-xs text-gray-500">Comments</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Text className="text-xs text-gray-600 font-semibold">
                {formatNumber(post.shares)}
              </Text>
              <Text className="text-xs text-gray-500">Shares</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row px-4 py-2 gap-1">
          <TouchableOpacity
            onPress={toggleLike}
            className="flex-1 flex-row items-center justify-center gap-2 py-3"
          >
            <Text className="text-lg">{liked ? "❤️" : "🤍"}</Text>
            <Text
              className={`text-sm font-semibold ${
                liked ? "text-red-500" : "text-gray-600"
              }`}
            >
              Like
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 py-3">
            <Text className="text-lg">💬</Text>
            <Text className="text-sm font-semibold text-gray-600">Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 py-3">
            <Text className="text-lg">↗️</Text>
            <Text className="text-sm font-semibold text-gray-600">Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleSave}
            className="flex-1 flex-row items-center justify-center gap-2 py-3"
          >
            <Text className="text-lg">{saved ? "📌" : "🔖"}</Text>
            <Text
              className={`text-sm font-semibold ${
                saved ? "text-amber-500" : "text-gray-600"
              }`}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default PostCard;
