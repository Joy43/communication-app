import { useState } from "react";
import { Text, TouchableOpacity, View, Image } from "react-native";
import { Heart, MessageSquare, Share2, MoreVertical, CheckCircle2, Leaf } from "lucide-react-native";

export const PostCard = ({ post }: { post: any }) => {
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);

  const toggleLike = () => {
    setLiked((prev: boolean) => !prev);
    setLikes((prev: number) => (liked ? prev - 1 : prev + 1));
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <View className="bg-white rounded-[24px] mb-5 p-5 shadow-sm border border-gray-100">
      {/* Author Header */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center gap-3 flex-1">
          {/* Avatar */}
          <View className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 justify-center items-center">
            {post.author.avatar && post.author.avatar.startsWith("http") ? (
              <Image source={{ uri: post.author.avatar }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <View className="w-full h-full justify-center items-center" style={{ backgroundColor: post.author.badgeColor || '#E0E7FF' }}>
                <Text className="text-xl font-bold text-indigo-700">{post.author.badge || post.author.name.charAt(0)}</Text>
              </View>
            )}
          </View>

          {/* Author Info */}
          <View className="flex-1">
            <View className="flex-row items-center gap-1.5 flex-wrap">
              <Text className="text-base font-bold text-gray-900">{post.author.name}</Text>
              {post.author.verified && (
                <CheckCircle2 size={16} color="#FFFFFF" fill="#3B82F6" strokeWidth={2} />
              )}
              {post.author.hasLeaf && (
                <View className="bg-green-100 rounded-md px-1 py-0.5 justify-center items-center">
                  <Leaf size={10} color="#10B981" fill="#10B981" />
                </View>
              )}
            </View>
            <Text className="text-[11px] text-gray-400 font-semibold mt-0.5">{post.timeAgo}</Text>
          </View>
        </View>

        {/* More Options */}
        <TouchableOpacity className="p-2 -mr-2">
          <MoreVertical size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Post Content */}
      <View className="mb-4">
        {post.title ? (
          <Text className="text-[15px] font-extrabold text-gray-900 leading-snug mb-1">{post.title}</Text>
        ) : null}
        {post.description ? (
          <Text className="text-sm font-semibold text-gray-500 leading-snug mb-1">{post.description}</Text>
        ) : (
          <Text className="text-sm font-medium text-gray-700 leading-relaxed">{post.content}</Text>
        )}
      </View>

      {/* Banner Image */}
      {post.image && (
        <View className="-mx-5 mb-4 border-y border-gray-100">
          {post.image.startsWith("http") ? (
            <Image source={{ uri: post.image }} className="w-full h-[220px]" resizeMode="cover" />
          ) : (
            <View className="bg-gradient-to-br from-blue-100 to-purple-100 px-4 py-6 justify-center items-center my-3 mx-4 rounded-xl">
              <Text className="text-6xl">{post.image}</Text>
            </View>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row items-center gap-3">
        {/* Likes */}
        <TouchableOpacity
          onPress={toggleLike}
          className={`flex-row items-center gap-2 px-5 py-2 rounded-full border border-gray-200 ${
            liked ? "bg-white" : "bg-white"
          }`}
          activeOpacity={0.8}
        >
          <Heart size={18} color={liked ? "#EF4444" : "#9CA3AF"} fill={liked ? "#EF4444" : "none"} strokeWidth={2} />
          <Text className="text-[13px] font-medium text-gray-500">
            {formatNumber(likes)}
          </Text>
        </TouchableOpacity>

        {/* Comments */}
        <TouchableOpacity className="flex-row items-center gap-2 px-5 py-2 rounded-full border border-gray-200 bg-white" activeOpacity={0.8}>
          <MessageSquare size={18} color="#9CA3AF" strokeWidth={2} />
          <Text className="text-[13px] font-medium text-gray-500">{formatNumber(post.comments)}</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity className="flex-row items-center gap-2 px-5 py-2 rounded-full border border-gray-200 bg-white ml-auto" activeOpacity={0.8}>
          <Share2 size={18} color="#9CA3AF" strokeWidth={2} />
          <Text className="text-[13px] font-medium text-gray-500">Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostCard;


