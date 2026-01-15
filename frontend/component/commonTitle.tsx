import { View, Text } from "react-native";
import React from "react";

const CommonTitle = ({ text, ...props }) => {
  return (
    <View className="mt-56 flex-row items-center gap-6" {...props}>
      <View className="w-2.5 h-12 relative bg-primary rounded-full"></View>
      <Text className="text-3xl font-extrabold text-primary">{text}</Text>
    </View>
  );
};

export default CommonTitle;
