import { View, Text } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

interface TotalExpenseCard {
  totalExpense: number;
  status: string;
}

const TotalExpenseCard = ({ totalExpense, status }: TotalExpenseCard) => {
  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
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

  return (
    <View className="bg-white w-auto rounded-3xl p-6 shadow-sm mx-6 mt-4">
      <View>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons size={26} name="trending-up-outline" />
            <Text className="text-xl ml-3">Total Expenses</Text>
          </View>

          <View
            className={`px-3 py-1.5 rounded-full ${getStatusStyle(status)}`}
          >
            <Text className={`text-xs font-semibold ${getStatusStyle(status)}`}>
              {status}
            </Text>
          </View>
        </View>
        <View className="flex-row">
          <Text className="mt-8 text-xl text-gray-500">NPR</Text>
          <Text className="mt-6 ml-3 text-4xl">{totalExpense}</Text>
        </View>
      </View>
    </View>
  );
};

export default TotalExpenseCard;
