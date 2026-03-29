# 🚀 Category Routing System - Quick Setup

## What's New? ✨

Your category tabs now have **full page routing** with dynamic filtering!

```
📰 All Posts → /posts/all-posts
👥 Following → /posts/following
🔥 Trending → /posts/trending
🔖 Saved posts → /posts/saved-posts
```

## Files Created

```
app/(root)/(tabs)/
├── posts/
│   ├── _layout.tsx              ← Stack navigator for posts
│   ├── all-posts.tsx            ← All Posts page
│   ├── following.tsx            ← Following page
│   ├── trending.tsx             ← Trending page
│   ├── saved-posts.tsx          ← Saved Posts page
│   ├── PostsScreen.tsx          ← Reusable component
│   └── postsData.ts             ← Shared data & categories
├── home.tsx (UPDATED)           ← Redirects to all-posts
└── _layout.tsx (UPDATED)        ← Added posts routes
```

## How to Use

### 1. Click Category Tab

User clicks on a category tab in the CategoryTabs component

### 2. Navigation Happens

```tsx
onCategoryChange(categoryId) → router.push('/posts/{route}')
```

### 3. Page Loads with Filter

The PostsScreen loads and displays filtered posts:

- **All Posts**: No filter (all posts)
- **Following**: `post.isFollowing === true`
- **Trending**: `post.isTrending === true`
- **Saved posts**: `post.saved === true`

### 4. Tabs Stay Visible

CategoryTabs remain visible at the top of each page for quick switching

## Key Features

✅ **4 Dynamic Pages** - One for each category
✅ **Smart Filtering** - Posts filtered by properties
✅ **Smooth Navigation** - Router-based navigation
✅ **Reusable Component** - PostsScreen handles all pages
✅ **Sync Tab State** - Active tab highlights correctly
✅ **Empty States** - Shows message when no posts

## Testing

When you run the app:

1. Open Home tab
2. See "All Posts" page load
3. Click "Following" tab → Navigate to `/posts/following`
4. Click "Trending" tab → Navigate to `/posts/trending`
5. Click "Saved posts" tab → Navigate to `/posts/saved-posts`
6. Click any tab to see posts update instantly

## Adding New Categories

To add a new category:

1. **Update `postsData.ts`:**

```tsx
const CATEGORIES = [
  // ... existing
  { id: "5", label: "My Posts", icon: "👤", route: "my-posts" },
];
```

2. **Add post property:**

```tsx
const POSTS = [
  {
    // ... existing
    isMyPost: true / false,
  },
];
```

3. **Create new page `my-posts.tsx`:**

```tsx
import PostsScreen from "./PostsScreen";

export default function MyPostsPage() {
  return (
    <PostsScreen
      title="My Posts"
      activeTabId="5"
      filterFn={(posts) => posts.filter((p) => p.isMyPost)}
    />
  );
}
```

4. **Update `_layout.tsx`:**

```tsx
<Stack.Screen name="my-posts" />
```

Done! 🎉

## File Explanations

### `postsData.ts`

Contains shared POSTS array and CATEGORIES configuration

### `PostsScreen.tsx`

Reusable component that:

- Takes title, activeTabId, and filterFn as props
- Handles Header, SearchBar, CategoryTabs
- Filters and displays posts in FlatList
- Manages navigation between categories

### Individual Pages

Each page (`all-posts.tsx`, `following.tsx`, etc.):

- Imports PostsScreen
- Provides custom filterFn
- Sets activeTabId for correct tab highlighting

### `_layout.tsx` in posts folder

Stack navigator that contains all post pages

- Keeps header hidden (already in PostsScreen)
- Defines all route screens

## Navigation Flow

```
home.tsx (useFocusEffect)
    ↓
router.replace('/posts/all-posts')
    ↓
PostsScreen (with all-posts filters)
    ↓
CategoryTabs click
    ↓
onCategoryChange('2')
    ↓
router.push('/posts/following')
    ↓
PostsScreen (with following filters)
```

## Pro Tips 💡

1. **Add more filters** - Update post objects with new boolean flags
2. **Search integration** - SearchBar is ready in PostsScreen
3. **Load more** - FlatList already has pagination-ready structure
4. **Post details** - Can add navigation to detail page from PostCard
5. **Performance** - Use useMemo for heavy filtering if needed

## Troubleshooting

- **Tabs not updating?** - Check that `activeCategory` prop matches `activeTabId` in PostsScreen
- **Posts not filtering?** - Verify POSTS array has required filter flags
- **Navigation not working?** - Ensure routes are defined in `_layout.tsx`
- **Blank page?** - Check console for errors; use ListEmptyComponent

---

**You're all set!** 🎉 Category routing is now fully functional with dynamic pages! 📱
