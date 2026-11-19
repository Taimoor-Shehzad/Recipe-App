import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  FlatList,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/expo";
import { BASE_API_URL } from "../../../constants/api";
import { FavouritesType, TransformedCategory } from "../../../constants/types";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { COLORS } from "../../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import RecipeCard from "../../../components/RecipeCard";
import { Link } from "expo-router";
import { cssInterop } from "nativewind";
cssInterop(Link, { className: "style" });

const Favourites = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const [favoriteRecipes, setFavoriteRecipes] = useState<TransformedCategory[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefresing] = useState(false);

  const loadFavourites = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}/favourites/${user?.id}`);
      if (!response) throw new Error("Failed to fetch favourites");
      const favourites = await response.json();
      const transformedFavourites = favourites.map(
        (favourite: FavouritesType) => ({
          ...favourite,
          id: favourite.recipeId,
        }),
      );
      setFavoriteRecipes(transformedFavourites);
    } catch (error) {
      console.log("Error loading favorites", error);
      Alert.alert("Error", "Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavourites();
  }, [user?.id]);

  const onRefresh = async () => {
    setRefresing(true);
    await loadFavourites();
    setRefresing(false);
  };

  const handleSignOut = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: signOut },
    ]);
  };

  if (loading) return <LoadingSpinner message="Loading your favorites..." />;

  return (
    <View
      style={{ backgroundColor: COLORS.background, paddingTop: 18 }}
      className="flex-1 px-6 py-10"
    >
      {/* Favourites Section Header */}
      <View className="flex-row w-full justify-between items-center">
        <Text style={{ color: COLORS.primary }} className="text-3xl font-bold">
          Favourites
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: COLORS.white }}
          className="rounded-full elevation items-center justify-center p-2"
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={19} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      {/* Favourite Recipe */}
      <View>
        <FlatList
          data={favoriteRecipes}
          renderItem={({ item }) => <RecipeCard recipe={item} />}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          columnWrapperStyle={{ justifyContent: "space-evenly", gap: 16 }}
          contentContainerStyle={{
            gap: 16,
            paddingVertical: 10,
            paddingBottom: 30,
          }}
          ListEmptyComponent={
            <View className="justify-center items-center flex-1 py-56">
              <Ionicons
                name="heart-outline"
                size={150}
                color={COLORS.textLight}
              />
              <Link
                style={{ backgroundColor: COLORS.primary }}
                className="rounded-full p-2 px-4 justify-center items-center"
                href={"/recipies"}
              >
                {" "}
                <Text
                  className="text-xl"
                  style={{ color: COLORS.white, fontWeight: 800 }}
                >
                  Find Recipes...
                </Text>{" "}
              </Link>
            </View>
          }
        />
      </View>
    </View>
  );
};

export default Favourites;
