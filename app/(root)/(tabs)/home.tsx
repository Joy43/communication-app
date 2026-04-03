import { useRouter } from "expo-router";
import PostsScreen from "../../../app/(posts)/PostsScreen";

export default function Homepage() {
  const router = useRouter();

  return (
    <PostsScreen
      title="All Posts"
      activeTabId="1"
      filterFn={(posts: any) => posts}
    />
  );
}
