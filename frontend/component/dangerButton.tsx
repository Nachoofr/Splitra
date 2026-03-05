import { Pressable, Text } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

interface DangerButtonProps {
  title: string;
  icon: string;
  onPress: () => void;
}

const DangerButton = ({ title, icon, onPress }: DangerButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      className="mx-6 mt-4 bg-white border border-red-400 rounded-2xl py-4 flex-row items-center justify-center gap-2 active:opacity-70"
    >
      <Ionicons name={icon as any} size={22} color="#EF4444" />
      <Text className="text-red-500 text-lg font-semibold">{title}</Text>
    </Pressable>
  );
};

export default DangerButton;
