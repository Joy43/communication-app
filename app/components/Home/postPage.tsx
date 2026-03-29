import { useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CategoryTabs from "./CategoryTabs";
import { Header } from "./header";
import PostCard from "./postCard";

// ─── Fake Data ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "1", label: "All Posts", icon: "📰" },
  { id: "2", label: "Following", icon: "👥" },
  { id: "3", label: "Trending", icon: "🔥" },
  { id: "4", label: "Saved", icon: "🔖" },
];

const POSTS = [
  {
    id: "1",
    category: "1",
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
    isFollowing: true,
    isTrending: false,
  },
  {
    id: "2",
    category: "1",
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
    isFollowing: true,
    isTrending: true,
  },
  {
    id: "3",
    category: "1",
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
    isFollowing: false,
    isTrending: false,
  },
  {
    id: "4",
    category: "1",
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
    isFollowing: true,
    isTrending: true,
  },
];

// ─── Search Bar ───────────────────────────────────────────────────────────────

const SearchBar = () => (
  <View className="bg-white px-4 py-3 border-b border-gray-100">
    <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2.5 gap-2">
      <Text className="text-base">🔍</Text>
      <TextInput
        className="flex-1 text-sm text-gray-800 font-medium"
        placeholder="Search posts, people..."
        placeholderTextColor="#999"
      />
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PostPage() {
  const [activeCategory, setActiveCategory] = useState("1");

  const getFilteredPosts = () => {
    switch (activeCategory) {
      case "2": // Following
        return POSTS.filter((post) => post.isFollowing);
      case "3": // Trending
        return POSTS.filter((post) => post.isTrending);
      case "4": // Saved
        return POSTS.filter((post) => post.saved);
      case "1": // All Posts
      default:
        return POSTS;
    }
  };

  const filteredPosts = getFilteredPosts();

  return (
    <SafeAreaView className="">
      <Header />
      <SearchBar />
      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={{ padding: 12 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-8">
            <Text className="text-gray-500 text-base font-medium">
              No posts in this category
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
