import { View, ActivityIndicator, Text, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { Tabs, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import GroupHeader from "../../../component/groupHeader";
import { groupApi } from "../../api/groupApi";

const GroupLayout = () => {
  const { id } = useLocalSearchParams();

  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchGroupData(Number(id));
    }
  }, [id]);

  const fetchGroupData = async (groupId: number) => {
    try {
      console.log("Sending groupId:", groupId, typeof groupId);
      setLoading(true);
      setError(null);

      const data = await groupApi.getGroupById(groupId);
      setGroup(data);
    } catch (err: any) {
      setError("Failed to load group");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error || !group) {
    return (
      <View className="flex-1 justify-center items-center px-4">
        <Text className="text-red-500 text-lg">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 relative">
      <GroupHeader
        groupName={group.groupName}
        groupPicture={group.groupPicture}
        memberCount={group.members?.length ?? 0} // need to update according to the backend
      />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { paddingTop: 13, height: 100 },
          tabBarActiveTintColor: "primary",
          tabBarInactiveTintColor: "#9AA1AE",
          tabBarLabelStyle: { fontSize: 12 },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={26}
                name="home-outline"
                color={focused ? "primary" : "#9AA1AE"}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="activity"
          options={{
            title: "Activity",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={26}
                name="notifications-outline"
                color={focused ? "primary" : "#9AA1AE"}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="category"
          options={{
            title: "Categories",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={26}
                name="grid-outline"
                color={focused ? "primary" : "#9AA1AE"}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="settlement"
          options={{
            title: "Settlements",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={26}
                name="cash-outline"
                color={focused ? "primary" : "#9AA1AE"}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={26}
                name="settings-outline"
                color={focused ? "primary" : "#9AA1AE"}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
};

export default GroupLayout;
