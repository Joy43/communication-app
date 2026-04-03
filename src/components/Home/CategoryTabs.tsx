import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const CATEGORIES = [
  { id: "1", label: "All Posts", icon: "📰" },
  { id: "2", label: "Following", icon: "👥" },
  { id: "3", label: "Trending", icon: "🔥" },
  { id: "4", label: "Saved posts", icon: "🔖" },
];

interface CategoryTabsProps {
  onCategoryChange?: (categoryId: string) => void;
  activeCategory?: string;
}

const CategoryTabs = ({
  onCategoryChange,
  activeCategory = "1",
}: CategoryTabsProps) => {
  const [active, setActive] = useState(activeCategory);

  useEffect(() => {
    setActive(activeCategory);
  }, [activeCategory]);

  const handleCategoryPress = (categoryId: string) => {
    setActive(categoryId);
    onCategoryChange?.(categoryId);
  };

  return (
    <View className="bg-white border-b border-gray-100">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          gap: 6,
        }}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => handleCategoryPress(cat.id)}
            className={`flex-row items-center gap-2 px-4 py-2 rounded-full border-2 ${
              active === cat.id
                ? "bg-blue-600 border-blue-600"
                : "bg-white border-gray-200"
            }`}
            activeOpacity={0.7}
          >
            <Text className="text-base">{cat.icon}</Text>
            <Text
              className={`text-sm font-semibold ${
                active === cat.id ? "text-white" : "text-gray-700"
              }`}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default CategoryTabs;
