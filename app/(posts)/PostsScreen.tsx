
import { useRouter } from "expo-router";
import { FlatList, Text, View } from "react-native";
import { POSTS } from "./postsData";
import { Header } from "@/src/components/Home/header";
import CategoryTabs from "@/src/components/Home/CategoryTabs";
import PostCard from "@/src/components/Home/postCard";

interface PostsScreenProps {
  title: string;
  filterFn: (posts: typeof POSTS) => typeof POSTS;
  activeTabId: string;
}



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
      "4": "/posts/entertainment",
      "5": "/posts/saved-posts",
    };
    router.push(routes[categoryId] as any);
  };

  return (
    <View className="flex-1 bg-white">
      <Header />
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
    </View>
  );
}
