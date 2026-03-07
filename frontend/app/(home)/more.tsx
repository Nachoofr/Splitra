import {
  View,
  Text,
  RefreshControl,
  ScrollView,
  Alert,
  Pressable,
} from "react-native";
import React, { useState, useEffect } from "react";
import ProfileCard from "../../component/profileCard";
import { userApi, CurrentUser } from "../api/userApi";
import { Ionicons } from "@expo/vector-icons";
import { groupApi } from "../api/groupApi";
import { expenseApi } from "../api/expenseApi";
import DangerButton from "../../component/dangerButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const More = () => {
  const [currentUserData, setCurrentUserData] = useState<CurrentUser | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [numberOfGroups, setNumberOfGroups] = useState(0);
  const [numberOfExpenses, setNumberOfExpenses] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userData, groupData, expenseCount] = await Promise.all([
        userApi.getCurrentUser(),
        groupApi.getNumberOfGroups(),
        expenseApi.getNumberOfExpenses(),
      ]);
      setCurrentUserData(userData);
      setNumberOfGroups(groupData);
      setNumberOfExpenses(expenseCount);
    } catch (err) {
      console.error("Unable to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async () => {
    if (!currentUserData) return;
    try {
      await userApi.deleteUser(currentUserData.id);
      await AsyncStorage.removeItem("token");
      router.replace("/(auth)/login");
    } catch (err) {
      Alert.alert("Error", "Failed to delete account. Please try again.");
    }
  };

  interface SettingRowProps {
    icon: string;
    title: string;
    subtitle: string;
    onPress?: () => void;
    isLast?: boolean;
  }

  const SettingRow = ({
    icon,
    title,
    subtitle,
    onPress,
    isLast = false,
  }: SettingRowProps) => (
    <>
      <Pressable
        onPress={onPress || (() => Alert.alert(title, ""))}
        className="flex-row items-center px-4 py-4 active:bg-gray-50"
      >
        <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
          <Ionicons name={icon as any} size={20} color="#374151" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 text-base font-medium">{title}</Text>
          <Text className="text-gray-400 text-sm mt-0.5">{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      </Pressable>
      {!isLast && <View className="h-px bg-gray-100 ml-16" />}
    </>
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-gray-100">
      {!loading && currentUserData && (
        <ProfileCard
          fullName={currentUserData.fullName}
          email={currentUserData.email}
          phone={currentUserData.phone}
          profilePicture={currentUserData.profilePicture}
          qrCodes={currentUserData.qrCodes ?? []}
          groupCount={numberOfGroups}
          expenseCount={numberOfExpenses}
          userId={currentUserData.id}
          onProfileUpdated={fetchData}
        />
      )}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#101828"
          />
        }
      >
        <Text className="text-xs font-semibold tracking-widest text-gray-400 uppercase px-6 mt-6 mb-2">
          Preferences
        </Text>
        <View className="bg-white rounded-3xl mx-6 overflow-hidden shadow-sm">
          <SettingRow
            icon="notifications-outline"
            title="Notifications"
            subtitle="Manage alerts & reminders"
          />
          <SettingRow
            icon="lock-closed-outline"
            title="Security"
            subtitle="Biometric, 2FA, password"
            isLast
          />
        </View>

        <Text className="text-xs font-semibold tracking-widest text-gray-400 uppercase px-6 mt-6 mb-2">
          Support
        </Text>
        <View className="bg-white rounded-3xl mx-6 overflow-hidden shadow-sm">
          <SettingRow
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="FAQ, chat, email"
          />
          <SettingRow
            icon="information-circle-outline"
            title="About Splitra"
            subtitle="Version, mission, contact"
          />
          <SettingRow
            icon="shield-outline"
            title="Privacy Policy"
            subtitle="How we protect your data"
          />
          <SettingRow
            icon="document-text-outline"
            title="Terms of Service"
            subtitle="Usage rules and policies"
            isLast
          />
        </View>

        <DangerButton
          title="Sign Out"
          icon="log-out-outline"
          onPress={() =>
            Alert.alert("Sign Out", "Are you sure you want to sign out?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Sign Out",
                style: "destructive",
                onPress: async () => {
                  await AsyncStorage.removeItem("token");
                  router.replace("/(auth)/login");
                },
              },
            ])
          }
        />

        <DangerButton
          title="Delete Account"
          icon="trash-outline"
          onPress={() =>
            Alert.alert(
              "Delete Account",
              "Are you sure? This cannot be undone.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: deleteUser },
              ],
            )
          }
        />
      </ScrollView>
    </View>
  );
};

export default More;
