import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { CategorySelect } from "../constants/types";
import { Image } from "expo-image";
import { COLORS } from "../constants/colors";
import { cssInterop } from "nativewind";
cssInterop(Image, { className: "style" });

interface CategoriesProps {
  categories: CategorySelect[];
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
}

const Categories = ({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoriesProps) => {
  return (
    <View className="my-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="m-1"
        contentContainerStyle={{
          gap: 12,
          paddingHorizontal: 16,
          paddingVertical: 11,
        }}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category.name;
          return (
            <TouchableOpacity
              className="rounded-xl px-2 py-2 justify-center items-center border flex-col elevation-md"
              style={[
                {
                  width: 80,
                  flexShrink: 0,
                  backgroundColor: COLORS.white,
                  borderColor: COLORS.border,
                },

                isSelected && {
                  backgroundColor: COLORS.primary,
                },
              ]}
              key={category.id}
              onPress={() => onSelectCategory(category.name)}
            >
              <View className="justify-center items-center gap-2">
                <View>
                  <Image
                    source={{ uri: category.image }}
                    contentFit="cover"
                    className="size-12 rounded-full"
                    style={[
                      isSelected && { borderColor: "white", borderWidth: 2 },
                    ]}
                  />
                </View>
                <Text
                  className="text-sm font-bold"
                  style={[
                    { color: COLORS.primary },
                    isSelected && { color: "white" },
                  ]}
                  numberOfLines={1}
                >
                  {category.name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default Categories;
