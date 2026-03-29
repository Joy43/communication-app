import PostsScreen from "./PostsScreen";

export default function SavedPostsPage() {
  return (
    <PostsScreen
      title="Saved posts"
      activeTabId="4"
      filterFn={(posts) => posts.filter((post) => post.saved)}
    />
  );
}
