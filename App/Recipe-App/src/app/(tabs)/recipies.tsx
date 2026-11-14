import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { MealAPI } from "../../../services/MealAPI";
import { Category, TransformedCategory, Meal } from "../../../constants/types";

const Recipies = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<TransformedCategory[]>([]);
  const [categories, setCategories] = useState([]);
  const [featuredRecipe, setFeaturedRecipe] =
    useState<TransformedCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      const [apiCategories, randomMeals, featuredMeal] = await Promise.all([
        MealAPI.getCategories(),
        MealAPI.getRandomMeals(12),
        MealAPI.getRandomMeal(),
      ]);

      const transformedCategories = apiCategories.map(
        (cat: Category, index: number) => ({
          id: index + 1,
          name: cat.strCategory,
          image: cat.strCategoryThumb,
          description: cat.strCategoryDescription,
        }),
      );

      setCategories(transformedCategories);

      if (!selectedCategory) setSelectedCategory(transformedCategories[0].name);

      const transformedMeals = randomMeals
        .map((meal) => MealAPI.transformMealData(meal))
        .filter((meal) => meal !== null);

      setRecipes(transformedMeals);

      const transformedFeatured = MealAPI.transformMealData(featuredMeal);
      setFeaturedRecipe(transformedFeatured);
    } catch (error) {
      console.log("Error loading the data", error);
    } finally {
      setLoading(false);
    }
  };

  //fix category type
  const loadCategoryData = async (category: string) => {
    try {
      const meals = await MealAPI.filterByCategory(category);
      const transformedMeals = meals
        .map((meal: Meal) => MealAPI.transformMealData(meal))
        .filter((meal: Meal) => meal !== null);
      setRecipes(transformedMeals);
    } catch (error) {
      console.error("Error loading category data:", error);
      setRecipes([]);
    }
  };

  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    await loadCategoryData(category);
  };

  // useEffect(() => {
  //   loadData();
  // }, []);

  return (
    <View>
      <Text>recipies</Text>
    </View>
  );
};

export default Recipies;
