import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";

export default function StackLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href={"/"} />;
  }
  return (
    <Tabs>
      <Tabs.Screen
        name="favourites"
        options={{
          title: "favourites",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              color={"blue"}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="recipies"
        options={{
          title: "recipies",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              color={"color"}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "search",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              color={"color"}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
