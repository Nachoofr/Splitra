import { View, Text, Pressable } from "react-native";
import React from "react";

const HomeButton = ({ text, ...props }) => {
  return (
    <Pressable
      className="flex-1 basis-0 bg-primary px-5 py-3 rounded-2xl items-center justify-center"
      {...props}
    >
      <Text className="text-white font-medium">{text}</Text>
    </Pressable>
  );
};

export default HomeButton;
