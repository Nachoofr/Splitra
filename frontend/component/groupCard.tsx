import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface groupApi {
  group: {
    groupPicture: string;
    groupName: string;
    Status: string;
  };
  onPress: (group: any) => void;
}

const GroupCard = ({ group, onPress }: groupApi) => {
  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case "SETTLED":
        return "bg-[#F0FDF4] text-green-600";
      case "UNSETTLED":
        return "bg-[#FDE2E2] text-[#E7000B]";
      case "CREATED":
        return "bg-[#E2EAFD] text-[#155DFC]";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  const statusStyle = getStatusStyle(group.Status);
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

        <View
          className={`px-3 py-1.5 rounded-full ${getStatusStyle(group.Status)}`}
        >
          <Text
            className={`text-xs font-semibold ${getStatusStyle(group.Status)}`}
          >
            {group.Status}
          </Text>
        </View>
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
