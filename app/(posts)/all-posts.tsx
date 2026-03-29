import PostsScreen from "./PostsScreen";

export default function AllPostsPage() {
  return (
    <PostsScreen
      title="All Posts"
      activeTabId="1"
      filterFn={(posts) => posts}
    />
  );
}
