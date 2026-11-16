import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { COLORS } from "../constants/colors";
import { TransformedCategory } from "../constants/types";
import { cssInterop } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
cssInterop(Image, { className: "style" });

interface RecipeCardProps {
  recipe: TransformedCategory;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  return (
    <TouchableOpacity
      style={{ backgroundColor: COLORS.white, width: 140 }}
      className="rounded-xl overflow-hidden elevation-lg"
    >
      <Image
        source={{ uri: recipe.image }}
        style={{ height: 120, width: "100%" }}
        contentFit="cover"
        transition={300}
      />
      <View className="px-2 py-2 gap-1 justify-between">
        <Text
          style={{ color: COLORS.primary }}
          className="text-sm font-bold leading-tight"
          numberOfLines={2}
        >
          {recipe.title}
        </Text>
        <Text
          style={{ color: COLORS.textLight }}
          className="text-sm leading-tight"
          numberOfLines={2}
        >
          {recipe.description}
        </Text>
        <View className="flex-row justify-between items-center">
          <View className="flex-row justify-center gap-1">
            <Ionicons name="time-outline" size={14} color={COLORS.textLight} />
            <Text style={{ color: COLORS.textLight }} className="text-sm">
              {recipe.cookTime}
            </Text>
          </View>
          <View className="flex-row justify-center gap-1">
            <Ionicons
              name="people-outline"
              size={14}
              color={COLORS.textLight}
            />
            <Text style={{ color: COLORS.textLight }} className="text-sm">
              {recipe.servings}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RecipeCard;
