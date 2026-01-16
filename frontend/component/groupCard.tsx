import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const GroupCard = ({ group, onPress }) => {
  return (
    <Pressable
      onPress={() => onPress(group)}
      className="h-20 pl-4 pr-3 mt-3 bg-white rounded-2xl shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10)] border-l-4 border-primary flex-col justify-center items-center gap-3"
    >
      <View className="flex-row justify-center items-center">
        <Image
          source={{ uri: group.groupPicture }}
          className="w-14 h-10 relative rounded-full shadow-[0px_0px_0px_2px_rgba(255,255,255,1.00)]"
          src="https://placehold.co/40x40"
        />
        <Text className="text-lg font-medium flex-1 ml-3">
          {group.groupName}
        </Text>

        <Text className="text-gray-500 text-sm">{group.Status}</Text>

        <Pressable className="ml-7">
          <Pressable>
            <Ionicons name="ellipsis-vertical" size={24} color="#9CA3AF" />
          </Pressable>
        </Pressable>
      </View>
    </Pressable>
  );
};

export default GroupCard;
