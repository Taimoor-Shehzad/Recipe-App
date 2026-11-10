import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useAuth } from "@clerk/expo";

const Favourites = () => {
  const { signOut } = useAuth();
  return (
    <View>
      <Text>favourites</Text>
      <TouchableOpacity
        onPress={() => {
          signOut();
        }}
      >
        <Text>Signout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Favourites;
