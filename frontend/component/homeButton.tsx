import { View, Text, Pressable } from "react-native";
import React from "react";

interface HomeButtonProps {
  text: string;
  selected?: boolean;
  onPress?: () => void;
}

const HomeButton = ({ text, selected = false, ...props }: HomeButtonProps) => {
  const getBackgroundColor = () => {
    if (!selected) {
      return "bg-white border-2 border-gray-200";
    }

    switch (text) {
      case "All":
        return "bg-primary";
      case "Settled":
        return "bg-green-600";
      case "Unsettled":
        return "bg-red-600";
      default:
        return "bg-primary";
    }
  };
  return (
    <Pressable
      className={`flex-1 basis-0 px-5 py-3 rounded-2xl items-center justify-center ${getBackgroundColor()}`}
      onPress={props.onPress}
      {...props}
    >
      <Text
        className={`font-medium ${selected ? "text-white" : "text-gray-600"}`}
      >
        {text}
      </Text>
    </Pressable>
  );
};

export default HomeButton;
