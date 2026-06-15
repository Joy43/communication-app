import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Flame, Clapperboard, Newspaper, Users, Bookmark } from "lucide-react-native";

const CATEGORIES = [
  { id: "1", label: "All Posts", Icon: Newspaper },
  { id: "2", label: "Following", Icon: Users },
  { id: "3", label: "Trending", Icon: Flame },
  { id: "4", label: "Entertainment & Pop Culture", Icon: Clapperboard },
  { id: "5", label: "Saved posts", Icon: Bookmark },
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
    <View className="bg-white border-b border-gray-100 pb-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingVertical: 10,
          gap: 8,
        }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = active === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => handleCategoryPress(cat.id)}
              className={`flex-row items-center gap-2 px-5 py-2.5 rounded-full border ${
                isActive
                  ? "bg-[#2D55FF] border-[#2D55FF]"
                  : "bg-white border-gray-200"
              }`}
              activeOpacity={0.7}
            >
              <cat.Icon size={18} color={isActive ? "#FFFFFF" : "#4B5563"} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? "#FFFFFF" : "none"} />
              <Text
                className={`text-[13px] font-semibold ${
                  isActive ? "text-white" : "text-gray-800"
                }`}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default CategoryTabs;
