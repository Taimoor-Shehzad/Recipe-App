import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (isSignedIn) {
    return <Redirect href="../(tabs)/favourites" />;
  }
  if (!isLoaded) {
    return (
      <View className="bg-white flex-1 justify-center items-center p-10">
        <ActivityIndicator size={"large"} color={"#1DA1F2"} />
      </View>
    );
  }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        options={{ animation: "slide_from_right" }}
        name="sign-up"
      />
      <Stack.Screen options={{ animation: "slide_from_left" }} name="index" />
    </Stack>
  );
}
