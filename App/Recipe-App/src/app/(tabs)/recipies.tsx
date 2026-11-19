import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { MealAPI } from "../../../services/MealAPI";
import {
  Category,
  TransformedCategory,
  Meal,
  CategorySelect,
} from "../../../constants/types";
import { COLORS } from "../../../constants/colors";
import { Image } from "expo-image";
// for nativewind classes usage in expo image
import { Ionicons } from "@expo/vector-icons";
import Categories from "../../../components/Categories";
import RecipeCard from "../../../components/RecipeCard";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { cssInterop } from "nativewind";
cssInterop(Image, { className: "style" });

const Recipies = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    "Popular Recipies",
  );
  const [recipes, setRecipes] = useState<TransformedCategory[]>([]);
  const [categories, setCategories] = useState<CategorySelect[]>([]);
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

      const transformedCategories = apiCategories
        .filter((cat: Category) => cat.strCategory?.toLowerCase() !== "pork")
        .map((cat: Category, index: number) => ({
          id: index + 1,
          name: cat.strCategory,
          image: cat.strCategoryThumb,
          description: cat.strCategoryDescription,
        }));

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
      //  const detailedMeals = await Promise.all(
      //   meals.map((meal: Meal) => MealAPI.getMealById(meal.idMeal)),
      // );
      // const transformedMeals = detailedMeals
      //   .map((meal) => MealAPI.transformMealData(meal))
      //   .filter((meal) => meal !== null);
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

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading && !refreshing)
    return <LoadingSpinner message="Loading delicious recipes..." />;

  return (
    <View
      style={{ backgroundColor: COLORS.background }}
      className="flex-1 pt-10"
    >
      {/* Main Scroll View */}
      <ScrollView
        className="flex-1 pb-14 "
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Page header Pics */}
        <View className="flex-row gap-14 m-auto">
          <Image
            contentFit="cover"
            className="size-20"
            source={require("@/assets/images/chicken.png")}
          />
          <Image
            contentFit="cover"
            className="size-20"
            source={require("@/assets/images/cow.png")}
          />
          <Image
            contentFit="cover"
            className="size-20"
            source={require("@/assets/images/lamb.png")}
          />
        </View>
        {/* Featured Section */}
        {featuredRecipe && (
          <View className="pt-4 px-6">
            <TouchableOpacity
              style={{
                borderRadius: 24,
                overflow: "hidden",
                backgroundColor: COLORS.card,
                shadowColor: COLORS.shadow,
                shadowOffset: {
                  width: 0,
                  height: 12,
                },
                shadowOpacity: 0.2,
                shadowRadius: 16,
                elevation: 12,
              }}
              onPress={() => {
                router.push(`/recipe/${featuredRecipe.id}`);
              }}
            >
              <View
                style={{ height: 220, borderRadius: 25, position: "relative" }}
              >
                <Image
                  source={{ uri: featuredRecipe?.image }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                  transition={500}
                />
                <View
                  style={{
                    backgroundColor: COLORS.primary,
                    position: "absolute",
                  }}
                  className="rounded-2xl left-4 top-5 px-4 py-1"
                >
                  <Text className="font-bold text-white text-sm">Featured</Text>
                </View>
                <Text
                  className="absolute left-4 bottom-12 text-white text-xl"
                  style={{ fontWeight: "bold" }}
                >
                  {featuredRecipe.title}
                </Text>
                <View className="absolute left-4 bottom-5 flex-1 flex-row gap-3">
                  <View className="flex-row gap-1">
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={COLORS.white}
                    />
                    <Text className="text-white">
                      {featuredRecipe.cookTime}
                    </Text>
                  </View>
                  <View className="flex-row gap-1">
                    <Ionicons
                      name="people-outline"
                      size={16}
                      color={COLORS.white}
                    />
                    <Text className="text-white">
                      {featuredRecipe.servings}
                    </Text>
                  </View>
                  {featuredRecipe.area && (
                    <View className="flex-row gap-1">
                      <Ionicons
                        name="location-outline"
                        size={16}
                        color={COLORS.white}
                      />
                      <Text className="text-white">{featuredRecipe.area}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}
        {/* Categories Section */}
        {categories.length > 0 && (
          <Categories
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        )}
        {/* Category Name */}
        <Text
          style={{ color: COLORS.primary }}
          className="font-extrabold mx-6 text-3xl"
        >
          {selectedCategory || "Random"}
        </Text>
        {/* Recipies */}
        {recipes.length > 0 ? (
          <FlatList
            data={recipes}
            renderItem={({ item }) => <RecipeCard recipe={item} />}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-evenly", gap: 16 }}
            contentContainerStyle={{
              gap: 16,
              paddingVertical: 10,
              paddingBottom: 30,
            }}
            scrollEnabled={false}
          />
        ) : (
          <View
            style={{
              alignItems: "center",
              paddingVertical: 64,
              paddingHorizontal: 32,
            }}
          >
            <Ionicons
              name="restaurant-outline"
              size={64}
              color={COLORS.textLight}
            />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: COLORS.text,
                marginTop: 16,
                marginBottom: 8,
              }}
            >
              No recipes found
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.textLight,
                textAlign: "center",
              }}
            >
              Try a different category
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Recipies;
