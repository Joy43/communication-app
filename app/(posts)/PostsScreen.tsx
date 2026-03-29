import CategoryTabs from "@/app/components/Home/CategoryTabs";
import { Header } from "@/app/components/Home/header";
import PostCard from "@/app/components/Home/postCard";
import { useRouter } from "expo-router";
import { FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { POSTS } from "./postsData";

interface PostsScreenProps {
  title: string;
  filterFn: (posts: typeof POSTS) => typeof POSTS;
  activeTabId: string;
}

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

export default function PostsScreen({
  title,
  filterFn,
  activeTabId,
}: PostsScreenProps) {
  const router = useRouter();
  const filteredPosts = filterFn(POSTS);

  const handleCategoryChange = (categoryId: string) => {
    const routes: Record<string, string> = {
      "1": "/posts/all-posts",
      "2": "/posts/following",
      "3": "/posts/trending",
      "4": "/posts/saved-posts",
    };
    router.push(routes[categoryId] as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header />
      <SearchBar />
      <CategoryTabs
        activeCategory={activeTabId}
        onCategoryChange={handleCategoryChange}
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
              No posts in {title.toLowerCase()}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
