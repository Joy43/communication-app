import PostsScreen from "./PostsScreen";

export default function FollowingPage() {
  return (
    <PostsScreen
      title="Following"
      activeTabId="2"
      filterFn={(posts) => posts.filter((post) => post.isFollowing)}
    />
  );
}
