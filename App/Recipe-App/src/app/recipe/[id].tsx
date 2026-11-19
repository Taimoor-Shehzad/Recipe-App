import { WebView } from "react-native-webview";
import { LinearGradient } from "expo-linear-gradient";
import { View, Alert, ScrollView, TouchableOpacity, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUser } from "@clerk/expo";
import { BASE_API_URL } from "../../../constants/api";
import { MealAPI } from "../../../services/MealAPI";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { FavouritesType, RecipeWithVideoUrl } from "../../../constants/types";
import { Image } from "expo-image";

import { cssInterop } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../constants/colors";
cssInterop(Image, { className: "style" });
cssInterop(LinearGradient, { className: "style" });

const RecipeDetailScreen = () => {
  const { id: recipeId } = useLocalSearchParams();
  const router = useRouter();

  const [recipe, setRecipe] = useState<RecipeWithVideoUrl | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const appDomain = "https://www.youtube.com";

  const { user } = useUser();
  const userId = user?.id;

  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        const response = await fetch(`${BASE_API_URL}/favourites/${userId}`);
        const favourites = await response.json();
        const isRecipeSaved = favourites.some(
          (fav: FavouritesType) => fav.recipeId === Number(recipeId),
        );
        setIsSaved(isRecipeSaved);
      } catch (error) {
        console.error("Error checking if recipe is saved:", error);
      }
    };

    const loadRecipeDetail = async () => {
      setLoading(true);
      try {
        const mealData = await MealAPI.getMealById(recipeId);
        if (mealData) {
          const transformedRecipe = MealAPI.transformMealData(mealData);

          const recipeWithVideo = {
            ...transformedRecipe,
            youtubeUrl: mealData.strYoutube || null,
          };

          setRecipe(recipeWithVideo);
        }
      } catch (error) {
        console.error("Error loading recipe detail:", error);
      } finally {
        setLoading(false);
      }
    };

    checkIfSaved();
    loadRecipeDetail();
  }, [recipeId, userId]);

  const getYouTubeEmbedUrl = (url: string) => {
    // example url: https://www.youtube.com/watch?v=mTvlmY4vCug
    const videoId = url.split("v=")[1];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const handleToggleSave = async () => {
    setIsSaving(true);

    try {
      if (isSaved) {
        // remove from favourites
        const response = await fetch(
          `${BASE_API_URL}/favourites/${userId}/${recipeId}`,
          {
            method: "DELETE",
          },
        );
        if (!response.ok) throw new Error("Failed to remove recipe");

        setIsSaved(false);
      } else {
        // add to favourites
        const response = await fetch(`${BASE_API_URL}/favourites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            recipeId: Number(recipeId),
            title: recipe?.title,
            image: recipe?.image,
            cookTime: recipe?.cookTime,
            servings: recipe?.servings,
          }),
        });

        if (!response.ok) throw new Error("Failed to save recipe");
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error toggling recipe save:", error);
      Alert.alert("Error", `Something went wrong. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading recipe details..." />;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Image Section */}
      <View>
        {/* Image */}
        <View className="relative">
          <Image
            source={{ uri: recipe?.image }}
            style={{ width: "100%", height: 450 }}
            contentFit="cover"
            transition={300}
          />
        </View>
        {/* Overlay */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.9)"]}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "60%",
          }}
        />
        {/* Back & BookMark Button */}
        <View className="absolute top-7 justify-between w-full flex-row p-5">
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
            className="rounded-full p-3 bg-black/50 justify-center items-center"
          >
            <Ionicons name="arrow-back" size={23} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: COLORS.primary }}
            className="rounded-full p-3 justify-center items-center"
          >
            <Ionicons name="bookmark-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        {/* Recipe Overview */}
        <View className="absolute left-5 bottom-14 gap-2">
          <View
            style={{ backgroundColor: COLORS.primary }}
            className="self-start rounded-full px-3 py-1 justify-center items-center"
          >
            <Text style={{ color: COLORS.white, fontWeight: "bold" }}>
              {recipe?.category}
            </Text>
          </View>
          <Text className="font-bold text-xl" style={{ color: COLORS.white }}>
            {recipe?.title}
          </Text>
          {recipe?.area && (
            <View className="flex-row items-center gap-2">
              <Ionicons name="location" color={COLORS.white} size={18} />
              <Text style={{ color: COLORS.white }} className="text-xl">
                {recipe?.area}
              </Text>
            </View>
          )}
        </View>
      </View>
      {/* Recipe Detail Section */}
      <View
        style={{
          backgroundColor: COLORS.background,
          borderTopLeftRadius: 34,
          borderTopRightRadius: 34,
        }}
        className="flex-1 -mt-10 px-5 pt-8 pb-14"
      >
        {/* PrepTime & Servings */}
        <View className="w-full flex-row justify-center items-center gap-4">
          <View
            className="items-center justify-center gap-2 px-8 py-4 elevation-lg rounded-2xl"
            style={{ backgroundColor: COLORS.white, minWidth: 140 }}
          >
            <LinearGradient
              colors={["#FF6B6B", "#FF8E53"]}
              className="self-center p-2 rounded-full"
            >
              <Ionicons name="time" size={25} color={COLORS.white} />
            </LinearGradient>
            <Text
              style={{ color: COLORS.primary }}
              className="text-xl font-bold leading-tight"
            >
              {recipe?.cookTime}
            </Text>
            <Text
              style={{ color: COLORS.textLight }}
              className="leading-tight text-sm"
            >
              Prep Time
            </Text>
          </View>
          <View>
            <View
              className="items-center justify-center gap-2 px-8 py-4 elevation-lg rounded-2xl"
              style={{ backgroundColor: COLORS.white, minWidth: 140 }}
            >
              <LinearGradient
                colors={["#4ECDC4", "#44A08D"]}
                className="self-center p-2 rounded-full"
              >
                <Ionicons name="people" size={25} color={COLORS.white} />
              </LinearGradient>
              <Text
                style={{ color: COLORS.primary }}
                className="text-xl font-bold leading-tight"
              >
                {recipe?.servings}
              </Text>
              <Text
                style={{ color: COLORS.textLight }}
                className="leading-tight text-sm"
              >
                Servings
              </Text>
            </View>
          </View>
        </View>
        {/* Yt Video */}
        <View>
          {/* Title */}
          <View className="flex-row  items-center gap-2 mt-5">
            <LinearGradient
              colors={["#FF0000", "#CC0000"]}
              className="self-start p-2 rounded-full justify-center items-center"
            >
              <Ionicons name="play" color={COLORS.white} size={20} />
            </LinearGradient>
            <Text
              style={{ color: COLORS.primary }}
              className="text-xl font-bold"
            >
              Video Tutorial
            </Text>
          </View>
          {/* YouTube Video */}
          <View
            style={{
              height: 220,
              borderRadius: 20,
              overflow: "hidden",
              backgroundColor: COLORS.card,
              shadowColor: COLORS.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
              marginTop: 10,
            }}
          >
            <WebView
              source={{
                uri: getYouTubeEmbedUrl(recipe?.youtubeUrl),
                headers: {
                  Referer: appDomain,
                },
              }}
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction={false}
              className="flex-1"
              javaScriptEnabled={true}
              domStorageEnabled={true}
              originWhitelist={["*"]}
              nestedScrollEnabled={true}
            />
          </View>
        </View>
        {/* Ingredients */}
        <View className="mt-6">
          {/* Ingredients Header */}
          <View className="flex-row justify-between items-center w-full">
            <View className="flex-row gap-2 justify-center items-center">
              <LinearGradient
                colors={[COLORS.primary, COLORS.primary + "80"]}
                className="rounded-full p-2 justify-center items-center"
              >
                <Ionicons name="list" size={16} color={COLORS.white} />
              </LinearGradient>
              <Text
                style={{ color: COLORS.primary }}
                className="font-bold text-2xl"
              >
                Ingredients
              </Text>
            </View>
            <View
              style={{ backgroundColor: COLORS.textLight + 20 }}
              className="rounded-full w-8 h-8 items-center justify-center"
            >
              <Text style={{ color: COLORS.primary }}>
                {recipe?.ingredients?.length}
              </Text>
            </View>
          </View>
          {/* Ingredients */}
          <View className="gap-3 mt-3">
            {recipe?.ingredients?.map((ingredient, index) => (
              <View
                key={index}
                style={{ backgroundColor: COLORS.white }}
                className="flex-row items-center gap-3 rounded-xl p-4"
              >
                <View
                  style={{ backgroundColor: COLORS.textLight + 20 }}
                  className="rounded-full w-8 h-8 justify-center items-center"
                >
                  <Text style={{ color: COLORS.primary }}>{index + 1}</Text>
                </View>
                <Text style={{ color: COLORS.primary }} className="flex-1">
                  {ingredient}
                </Text>
              </View>
            ))}
          </View>
        </View>
        {/* Instructions */}
        <View className="mt-6">
          {/* Instructions Header */}
          <View className="flex-row justify-between items-center w-full">
            <View className="flex-row gap-2 justify-center items-center">
              <LinearGradient
                colors={[COLORS.primary, COLORS.primary + "80"]}
                className="rounded-full p-2 justify-center items-center"
              >
                <Ionicons name="book" size={16} color={COLORS.white} />
              </LinearGradient>
              <Text
                style={{ color: COLORS.primary }}
                className="font-bold text-2xl"
              >
                Instructions
              </Text>
            </View>
            <View
              style={{ backgroundColor: COLORS.textLight + 20 }}
              className="rounded-full w-8 h-8 items-center justify-center"
            >
              <Text style={{ color: COLORS.primary }}>
                {recipe?.instructions?.length}
              </Text>
            </View>
          </View>
          {/* Instructions */}
          <View className="gap-3 mt-3">
            {recipe?.instructions?.map((instruction: any, index: any) => (
              <View
                key={index}
                style={{ backgroundColor: COLORS.white }}
                className=" gap-3 rounded-xl p-4"
              >
                <View className="flex-row items-center gap-3">
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primary + "CC"]}
                    className="rounded-full w-8 h-8 justify-center items-center self-start"
                  >
                    <Text style={{ color: COLORS.white }}>{index + 1}</Text>
                  </LinearGradient>
                  <View className="flex-1">
                    <Text style={{ color: COLORS.primary }}>{instruction}</Text>
                    <Text
                      style={{ color: COLORS.textLight }}
                      className="text-sm"
                    >
                      Step: {index + 1}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
        {/* Add To Fav Button */}
        <TouchableOpacity
          className="rounded-xl w-full mt-6 overflow-hidden"
          disabled={isSaving}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primary + "CC"]}
            className="justify-center items-center w-full flex-row gap-1 py-3"
          >
            <Ionicons name="heart" color={COLORS.white} size={22} />
            <Text style={{ color: COLORS.white }} className="font-bold text-xl">
              Add to favourites
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default RecipeDetailScreen;
