import { useState } from "react";
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const StyledView = View;
const StyledText = Text;
const StyledTouchableOpacity = TouchableOpacity;
const StyledTextInput = TextInput;
const StyledSafeAreaView = SafeAreaView;
const StyledScrollView = ScrollView;

// ─── Fake Data ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "1", label: "All Posts", icon: "�" },
  { id: "2", label: "Following", icon: "👥" },
  { id: "3", label: "Trending", icon: "�" },
  { id: "4", label: "Saved", icon: "🔖" },
];

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

// ─── Header ───────────────────────────────────────────────────────────────────

const Header = () => (
<SafeAreaView>
      <StyledView className="flex-row justify-between items-center px-4 py-4 bg-white border-b border-gray-100">
    <StyledView className="flex-col">
      <StyledText className="text-3xl font-black tracking-tight">
        <StyledText className="text-blue-600">Social</StyledText>
        <StyledText className="text-gray-800">Feed</StyledText>
      </StyledText>
      <StyledText className="text-xs text-gray-500 font-semibold mt-1">
        Stay Connected
      </StyledText>
    </StyledView>
    <StyledView className="flex-row gap-3">
      <StyledTouchableOpacity className="w-11 h-11 rounded-full bg-blue-50 justify-center items-center">
        <StyledText className="text-lg">🔔</StyledText>
      </StyledTouchableOpacity>
      <StyledTouchableOpacity className="w-11 h-11 rounded-full bg-blue-50 justify-center items-center">
        <StyledText className="text-lg">✉️</StyledText>
      </StyledTouchableOpacity>
    </StyledView>
  </StyledView>
</SafeAreaView>
);

// ─── Search Bar ───────────────────────────────────────────────────────────────

const SearchBar = () => (
  <StyledView className="bg-white px-4 py-3 border-b border-gray-100">
    <StyledView className="flex-row items-center bg-gray-100 rounded-full px-4 py-2.5 gap-2">
      <StyledText className="text-base">🔍</StyledText>
      <StyledTextInput
        className="flex-1 text-sm text-gray-800 font-medium"
        placeholder="Search posts, people..."
        placeholderTextColor="#999"
      />
    </StyledView>
  </StyledView>
);

// ─── Category Tabs ────────────────────────────────────────────────────────────

const CategoryTabs = () => {
  const [active, setActive] = useState("1");
  return (
    <StyledView className="bg-white border-b border-gray-100">
      <StyledScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          gap: 6,
        }}
      >
        {CATEGORIES.map((cat) => (
          <StyledTouchableOpacity
            key={cat.id}
            onPress={() => setActive(cat.id)}
            className={`flex-row items-center gap-2 px-4 py-2 rounded-full border-2 ${
              active === cat.id
                ? "bg-blue-600 border-blue-600"
                : "bg-white border-gray-200"
            }`}
          >
            <StyledText className="text-base">{cat.icon}</StyledText>
            <StyledText
              className={`text-sm font-semibold ${
                active === cat.id ? "text-white" : "text-gray-700"
              }`}
            >
              {cat.label}
            </StyledText>
          </StyledTouchableOpacity>
        ))}
      </StyledScrollView>
    </StyledView>
  );
};

// ─── Post Card ────────────────────────────────────────────────────────────────

const PostCard = ({ post }: { post: (typeof POSTS)[0] }) => {
  const [liked, setLiked] = useState(post.liked);
  const [saved, setSaved] = useState(post.saved);
  const [likes, setLikes] = useState(post.likes);

  const toggleLike = () => {
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
  };

  const toggleSave = () => {
    setSaved((prev) => !prev);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <SafeAreaView className="flex-1">
        <StyledView className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm border border-gray-100">
      {/* Author Header */}
      <StyledView className="flex-row justify-between items-center px-4 pt-4 pb-3">
        <StyledView className="flex-row items-center gap-3 flex-1">
          {/* Avatar */}
          <StyledView
            className="w-12 h-12 rounded-full justify-center items-center text-2xl"
            style={{ backgroundColor: post.author.badgeColor }}
          >
            <StyledText>{post.author.avatar}</StyledText>
          </StyledView>

          {/* Author Info */}
          <StyledView className="flex-1">
            <StyledView className="flex-row items-center gap-2 mb-0.5">
              <StyledText className="text-sm font-bold text-gray-900">
                {post.author.name}
              </StyledText>
              {post.author.verified && (
                <StyledText className="text-blue-500">✓</StyledText>
              )}
            </StyledView>
            <StyledView className="flex-row items-center gap-1">
              <StyledText className="text-xs text-gray-500">
                {post.author.handle}
              </StyledText>
              <StyledText className="text-xs text-gray-400">•</StyledText>
              <StyledText className="text-xs text-gray-500">
                {post.timeAgo}
              </StyledText>
            </StyledView>
          </StyledView>
        </StyledView>

        {/* Menu Button */}
        <StyledTouchableOpacity className="p-2">
          <StyledText className="text-xl text-gray-400">⋮</StyledText>
        </StyledTouchableOpacity>
      </StyledView>

      {/* Content */}
      <StyledView className="px-4 pb-3">
        <StyledText className="text-sm text-gray-800 leading-relaxed mb-3">
          {post.content}
        </StyledText>

        {/* Tags */}
        {post.tags.length > 0 && (
          <StyledView className="flex-row flex-wrap gap-2">
            {post.tags.map((tag, idx) => (
              <StyledView
                key={idx}
                className="bg-blue-50 px-3 py-1.5 rounded-full"
              >
                <StyledText className="text-xs text-blue-600 font-semibold">
                  {tag}
                </StyledText>
              </StyledView>
            ))}
          </StyledView>
        )}
      </StyledView>

      {/* Image Section */}
      {post.image && (
        <StyledView className="bg-gradient-to-br from-blue-100 to-purple-100 px-4 py-6 justify-center items-center my-3 mx-4 rounded-xl">
          <StyledText className="text-6xl">{post.image}</StyledText>
        </StyledView>
      )}

      {/* Stats Bar */}
      <StyledView className="px-4 py-3 border-t border-b border-gray-100 flex-row justify-between">
        <StyledView className="flex-row items-center gap-2">
          <StyledText className="text-red-500">❤️</StyledText>
          <StyledText className="text-xs text-gray-600 font-semibold">
            {formatNumber(likes)} likes
          </StyledText>
        </StyledView>
        <StyledView className="flex-row items-center gap-4">
          <StyledView className="flex-row items-center gap-1">
            <StyledText className="text-xs text-gray-600 font-semibold">
              {formatNumber(post.comments)}
            </StyledText>
            <StyledText className="text-xs text-gray-500">Comments</StyledText>
          </StyledView>
          <StyledView className="flex-row items-center gap-1">
            <StyledText className="text-xs text-gray-600 font-semibold">
              {formatNumber(post.shares)}
            </StyledText>
            <StyledText className="text-xs text-gray-500">Shares</StyledText>
          </StyledView>
        </StyledView>
      </StyledView>

      {/* Action Buttons */}
      <StyledView className="flex-row px-4 py-2 gap-1">
        <StyledTouchableOpacity
          onPress={toggleLike}
          className="flex-1 flex-row items-center justify-center gap-2 py-3"
        >
          <StyledText className="text-lg">{liked ? "❤️" : "🤍"}</StyledText>
          <StyledText
            className={`text-sm font-semibold ${
              liked ? "text-red-500" : "text-gray-600"
            }`}
          >
            Like
          </StyledText>
        </StyledTouchableOpacity>

        <StyledTouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 py-3">
          <StyledText className="text-lg">💬</StyledText>
          <StyledText className="text-sm font-semibold text-gray-600">
            Comment
          </StyledText>
        </StyledTouchableOpacity>

        <StyledTouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 py-3">
          <StyledText className="text-lg">↗️</StyledText>
          <StyledText className="text-sm font-semibold text-gray-600">
            Share
          </StyledText>
        </StyledTouchableOpacity>

        <StyledTouchableOpacity
          onPress={toggleSave}
          className="flex-1 flex-row items-center justify-center gap-2 py-3"
        >
          <StyledText className="text-lg">{saved ? "📌" : "🔖"}</StyledText>
          <StyledText
            className={`text-sm font-semibold ${
              saved ? "text-amber-500" : "text-gray-600"
            }`}
          >
            Save
          </StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    </StyledView>
    </SafeAreaView>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SpectraSynqFeed() {
  return (
    <StyledSafeAreaView className="flex-1 mt-10 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Header />
      <SearchBar />
      <CategoryTabs />
      <FlatList
        data={POSTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={{ padding: 12 }}
        showsVerticalScrollIndicator={false}
      />
    </StyledSafeAreaView>
  );
}
