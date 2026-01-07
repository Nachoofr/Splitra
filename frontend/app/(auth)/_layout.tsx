import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const RootLayout = () => {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
    </>
  );
};

export default RootLayout;
