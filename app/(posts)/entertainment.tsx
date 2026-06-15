import PostsScreen from "./PostsScreen";

export default function EntertainmentPage() {
  return (
    <PostsScreen
      title="Entertainment & Pop Culture"
      activeTabId="4"
      filterFn={(posts) =>
        posts.filter(
          (post) =>
            post.tags.includes("#Photography") ||
            post.tags.includes("#Travel") ||
            post.isTrending,
        )
      }
    />
  );
}
