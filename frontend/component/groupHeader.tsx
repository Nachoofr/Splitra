import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface GroupHeaderProps {
  groupName: string;
  groupPicture: string;
  memberCount: number;
}

const GroupHeader = ({
  groupName,
  groupPicture,
  memberCount,
}: GroupHeaderProps) => {
  return (
    <View className="bg-primary pt-14 pb-8 px-6">
      <Pressable onPress={() => router.back()} className="mb-6">
        <View className="w-14 h-14 bg-[#374151] rounded-3xl items-center justify-center">
          <Ionicons name="arrow-back" size={24} color="white" />
        </View>
      </Pressable>

      <View className="flex-row items-center">
        <Image
          source={{ uri: groupPicture }}
          className="w-32 h-32 rounded-3xl border-[#374151] border-4"
        />
        <View className="ml-6 flex-1">
          <Text className="text-white text-4xl font-medium">{groupName}</Text>
          <View className="flex-row items-center mt-2">
            <Ionicons name="people" size={20} color="#CAD5E2" />
            <Text className="text-[#CAD5E2] text-lg ml-2">
              {memberCount} members
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default GroupHeader;
