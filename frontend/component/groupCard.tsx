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

  const getInitial = (name: string) => name?.charAt(0).toUpperCase() ?? "G";

  return (
    <Pressable
      onPress={() => onPress(group)}
      className="h-20 pl-4 pr-3 mt-3 bg-white rounded-2xl shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.10)] border-l-4 border-primary flex-col justify-center items-center gap-3"
    >
      <View className="flex-row justify-center items-center">
        {group.groupPicture ? (
          <Image
            source={{ uri: group.groupPicture }}
            style={{ width: 44, height: 44, borderRadius: 22 }}
          />
        ) : (
          <View
            style={{ width: 44, height: 44, borderRadius: 22 }}
            className="bg-primary items-center justify-center"
          >
            <Text className="text-white text-lg font-bold">
              {getInitial(group.groupName)}
            </Text>
          </View>
        )}

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
          <Ionicons name="ellipsis-vertical" size={24} color="#9CA3AF" />
        </Pressable>
      </View>
    </Pressable>
  );
};

export default GroupCard;
