import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Share,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useGroup } from "./groupContext";
import { groupApi, GroupMember } from "../../api/groupApi";
import CommonTitle from "../../../component/commonTitleGroups";
import { useRouter } from "expo-router";
import { userApi } from "../../api/userApi";

const Settings = () => {
  const { group } = useGroup();
  const router = useRouter();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    if (group?.id) {
      (fetchMembers(), getCurrentUser());
    }
  }, [group?.id]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await groupApi.getGroupMembers(group.id);
      setMembers(data);
    } catch (err) {
      console.error("Failed to load members:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUser = async () => {
    try {
      const data = await userApi.getCurrentUser();
      setCurrentUserId(data.id);
    } catch (err) {
      throw console.error("failed to get current user id");
    }
  };

  const handleDeleteGroup = async () => {
    Alert.alert(
      "Delete Group",
      `Are you sure you want to permanently delete "${group.groupName}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const data = await groupApi.deleteGroup(group.id);
            router.replace("(home)/groups");
          },
        },
      ],
    );
  };

  const handleLeaveGroup = async () => {
    Alert.alert(
      "Leave Group",
      `Are you sure you want to leave "${group.groupName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            const data = await groupApi.leaveGroup(group.id);
            router.replace("(home)/groups");
          },
        },
      ],
    );
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <ScrollView
      className="flex-1 bg-gray-50 mx-6"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <View className="mt-6">
        <Pressable
          // onPress={handleInvite}
          disabled={inviteLoading}
          className="bg-blue-500 rounded-3xl px-5 py-4 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-4">
            <View className="w-12 h-12 bg-blue-400 rounded-2xl items-center justify-center">
              <Ionicons name="link" size={24} color="white" />
            </View>
            <View>
              <Text className="text-white text-lg font-bold">
                Invite Members
              </Text>
              <Text className="text-blue-200 text-sm">
                Share link to add people
              </Text>
            </View>
          </View>
          {inviteLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Ionicons name="share-social-outline" size={22} color="white" />
          )}
        </Pressable>
      </View>

      <View className="mt-5">
        <CommonTitle text={"Group Members"} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#101828" className="mt-4" />
      ) : (
        <View className="gap-3">
          {members.map((member, index) => (
            <View
              key={member.id}
              className="bg-white rounded-2xl px-5 py-4 flex-row items-center shadow-sm"
            >
              <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-4">
                <Text className="text-gray-600 font-semibold text-base">
                  {getInitials(member.name)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 text-lg font-medium">
                  {member.name}
                </Text>
                {group.createdBy === member.id && (
                  <Text className="text-gray-400 text-sm">Admin</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      <View className="mt-5">
        <CommonTitle text={"Export Data"} />

        <Pressable
          // onPress={handleExportCSV}
          className="bg-white rounded-2xl px-5 py-4 flex-row items-center shadow-sm"
        >
          <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mr-4">
            <Ionicons name="download-outline" size={24} color="#3B82F6" />
          </View>
          <View>
            <Text className="text-gray-900 text-lg font-medium">
              Export to CSV
            </Text>
            <Text className="text-gray-400 text-sm">Download all expenses</Text>
          </View>
        </Pressable>
      </View>

      <View className="mt-8">
        <CommonTitle text={"Manage Group"} />

        <Pressable
          onPress={handleLeaveGroup}
          className="bg-white rounded-2xl px-5 py-4 flex-row items-center shadow-sm"
        >
          <View className="w-12 h-12 rounded-full bg-orange-50 items-center justify-center mr-4">
            <Ionicons name="exit-outline" size={24} color="#F97316" />
          </View>
          <View>
            <Text className="text-gray-900 text-lg font-medium">
              Leave Group
            </Text>
            <Text className="text-gray-400 text-sm">Exit this group</Text>
          </View>
        </Pressable>

        {group.createdBy === currentUserId && (
          <View className="gap-3">
            <Pressable
              onPress={handleDeleteGroup}
              className="bg-white rounded-2xl px-5 py-4 flex-row items-center shadow-sm"
            >
              <View className="w-12 h-12 rounded-full bg-red-50 items-center justify-center mr-4">
                <Ionicons name="trash-outline" size={24} color="#EF4444" />
              </View>
              <View>
                <Text className="text-gray-900 text-lg font-medium">
                  Delete Group
                </Text>
                <Text className="text-gray-400 text-sm">
                  Permanently delete this group
                </Text>
              </View>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default Settings;
