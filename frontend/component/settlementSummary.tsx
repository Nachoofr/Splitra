import { View, Text } from "react-native";
import React from "react";

interface SettlementSummaryProps {
  myBalance: number;
}

const SettlementSummary = ({ myBalance }: SettlementSummaryProps) => {
  const isOwed = myBalance > 0;
  const isOwe = myBalance < 0;
  const isSettled = myBalance === 0;

  return (
    <View
      className={`mx-6 mt-4 rounded-3xl p-9 ${
        isOwed ? "bg-[#F0FDF4]" : isOwe ? "bg-[#FDE2E2]" : "bg-gray-100"
      }`}
    >
      <Text
        className={`text-center text-lg font-medium ${
          isOwed ? "text-green-600" : isOwe ? "text-[#B91C1C]" : "text-gray-500"
        }`}
      >
        {isOwed ? "You are owed" : isOwe ? "You owe" : "All settled up!"}
      </Text>

      <View className="flex-row items-center justify-center">
        {!isSettled && (
          <>
            <Text
              className={`font-normal mr-3 mt-5 text-2xl ${
                isOwed ? "text-green-600" : "text-[#B91C1C]"
              }`}
            >
              NPR
            </Text>
            <Text
              className={`text-center text-5xl font-bold mt-4 ${
                isOwed ? "text-green-600" : "text-[#B91C1C]"
              }`}
            >
              {Math.abs(myBalance).toFixed(2)}
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

export default SettlementSummary;
