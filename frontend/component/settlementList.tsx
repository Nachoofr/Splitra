import { View, Text, Pressable, Alert } from "react-native";
import React from "react";
import { Settlement } from "../app/api/settelmentApi";
import CommonTitle from "./commonTitleGroups";

interface SettlementListProps {
  toReceiveList: Settlement[];
  toPayList: Settlement[];
  groupName: string;
}

const SettlementList = ({
  toReceiveList,
  toPayList,
  groupName,
}: SettlementListProps) => {
  return (
    <View>
      {toReceiveList.length > 0 && (
        <View className="mx-6 mt-3">
          <CommonTitle text="To Receive" />

          {toReceiveList.map((s, index) => (
            <View
              key={index}
              className="bg-white rounded-3xl p-5 mb-3 border-l-4 border-green-500"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center">
                    <Text className="text-green-700 font-bold text-lg">
                      {s.from.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-xl font-semibold text-gray-900">
                      {s.from}
                    </Text>
                    <Text className="text-gray-400">{groupName}</Text>
                  </View>
                </View>
                <Text className="text-green-600 text-xl font-medium">
                  NPR {s.amount}
                </Text>
              </View>

              <Pressable
                className="mt-4 bg-gray-100 rounded-2xl py-3 items-center"
                onPress={() =>
                  Alert.alert("Reminder", `Reminder sent to ${s.from}!`)
                }
              >
                <Text className="text-gray-700 font-medium">Send Reminder</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {toPayList.length > 0 && (
        <View className="mx-6 mt-3">
          <CommonTitle text="To Pay" />

          {toPayList.map((s, index) => (
            <View
              key={index}
              className="bg-white rounded-3xl p-5 mb-3 border-l-4 border-red-500"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-12 h-12 rounded-full bg-red-100 items-center justify-center">
                    <Text className="text-red-500 font-bold text-lg">
                      {s.to.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-xl font-semibold text-gray-900">
                      {s.to}
                    </Text>
                    <Text className="text-gray-400">{groupName}</Text>
                  </View>
                </View>
                <Text className="text-red-500 text-xl font-medium">
                  NPR {s.amount}
                </Text>
              </View>

              <View className="flex-row gap-3 mt-4">
                <Pressable
                  className="flex-1 bg-primary rounded-2xl py-3 items-center"
                  onPress={() =>
                    Alert.alert(
                      "Settle Up",
                      `Mark payment to ${s.to} as done?`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Confirm",
                          onPress: () => console.log("Settled"),
                        },
                      ],
                    )
                  }
                >
                  <Text className="text-white font-medium">Settle Up</Text>
                </Pressable>
                <Pressable
                  className="flex-1 bg-gray-100 rounded-2xl py-3 items-center"
                  onPress={() =>
                    Alert.alert("Remind", `Reminder sent to ${s.to}!`)
                  }
                >
                  <Text className="text-gray-700 font-medium">Remind</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default SettlementList;
