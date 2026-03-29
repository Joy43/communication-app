import PostsScreen from "./PostsScreen";

export default function TrendingPage() {
  return (
    <PostsScreen
      title="Trending"
      activeTabId="3"
      filterFn={(posts) => posts.filter((post) => post.isTrending)}
    />
  );
}
