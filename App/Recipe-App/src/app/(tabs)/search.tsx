import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useDebounce } from "../../../hooks/useDebounce";
import { MealAPI } from "../../../services/MealAPI";
import { Meal, TransformedCategory } from "../../../constants/types";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { COLORS } from "../../../constants/colors";
import { Ionicons } from "@expo/vector-icons";

import RecipeCard from "../../../components/RecipeCard";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState<TransformedCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const performSearch = async (query: string) => {
    // if no search query
    if (!query.trim()) {
      const randomMeals = await MealAPI.getRandomMeals(12);
      return randomMeals
        .map((meal) => MealAPI.transformMealData(meal))
        .filter((meal) => meal !== null);
    }

    // search by name first, then by ingredient if no results

    const nameResults = await MealAPI.searchMealsByName(query);
    let results = nameResults;

    if (results.length === 0) {
      const ingredientResults = await MealAPI.filterByIngredient(query);
      results = ingredientResults;
    }

    return results
      .slice(0, 12)
      .map((meal: Meal) => MealAPI.transformMealData(meal))
      .filter((meal: Meal) => meal !== null);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const results = await performSearch("");
        setRecipes(results);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (initialLoading) return;

    const handleSearch = async () => {
      setLoading(true);

      try {
        const results = await performSearch(debouncedSearchQuery);
        setRecipes(results);
      } catch (error) {
        console.error("Error searching:", error);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    handleSearch();
  }, [debouncedSearchQuery, initialLoading]);
  if (initialLoading) return <LoadingSpinner message="Loading recipes..." />;
  return (
    <View
      style={{ backgroundColor: COLORS.background }}
      className="flex-1 items-center px-6"
    >
      {/* Search Box */}
      <View className="flex-row w-full items-center bg-white rounded-2xl px-4 justify-between mt-10 elevation-md">
        <View className="flex-row items-center gap-2">
          <Ionicons name="search-outline" size={17} color={COLORS.textLight} />
          <TextInput
            onChangeText={setSearchQuery}
            value={searchQuery}
            className="bg-white"
            placeholder="Search recipies, ingredients..."
            placeholderTextColor={COLORS.textLight}
            returnKeyType="search"
          />
        </View>
        {searchQuery.length > 0 && (
          <TouchableOpacity
            className="p-1"
            onPress={() => {
              setSearchQuery("");
            }}
          >
            <Ionicons name="close-circle" size={17} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
      {/* Results Section */}
      <View className="mt-8 flex-1">
        {/* Result Section Title */}
        <View className="flex-row w-full justify-between items-center">
          <Text style={{ color: COLORS.primary }} className="font-bold text-xl">
            {searchQuery ? `Results for "${searchQuery}"` : "Popular Recipes"}
          </Text>
          <Text style={{ color: COLORS.textLight }}>
            {recipes.length} found
          </Text>
        </View>
        {/* Resulting Recipies */}
        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <LoadingSpinner message="Searching recipes..." />
          </View>
        ) : (
          <FlatList
            data={recipes}
            renderItem={({ item }) => <RecipeCard recipe={item} />}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-evenly", gap: 16 }}
            contentContainerStyle={{
              gap: 16,
              paddingVertical: 20,
              paddingBottom: 30,
            }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingVertical: 64,
                }}
              >
                <Ionicons
                  name="search-outline"
                  size={64}
                  color={COLORS.textLight}
                />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
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
                    lineHeight: 20,
                  }}
                >
                  Try adjusting your search or try different keywords
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

export default Search;
