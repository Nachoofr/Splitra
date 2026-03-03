import { View, Text } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import HomeHeaderBackground from "../../component/HomeHeaderBackground";
import LogoText from "../../component/LogoText";
import { Image } from "react-native";
import Logo from "../../assets/img/logo.png";
import { Ionicons } from "@expo/vector-icons";

const Home = () => {
  return (
    <View className="flex-1">
      <View className="absolute top-0 left-0 right-0 z-10" pointerEvents="none">
        <HomeHeaderBackground />

        <View className="absolute top-20 left-0 w-full h-28 bg-primary opacity-90 items-start justify-center ">
          <View className="pl-8 flex-row items-center ">
            <Image source={Logo} style={{ width: 60, height: 60 }} />
            <View className="pl-4">
              <Text className="text-white text-3xl font-bold tracking-wide mt-4">
                Splitra
              </Text>
              <Text className="text-[#CAD5E2] text-lg mt-1">
                Scan. Split. Settle
              </Text>
            </View>
          </View>
        </View>
      </View>

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
          name="groups"
          options={{
            title: "Groups",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={26}
                name="people-outline"
                color={focused ? "primary" : "#9AA1AE"}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="request"
          options={{
            title: "Requests",
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
          name="more"
          options={{
            title: "More",
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={26}
                name="menu-outline"
                color={focused ? "primary" : "#9AA1AE"}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
};

export default Home;
