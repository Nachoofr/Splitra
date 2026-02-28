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

const Settings = () => {
  const { group } = useGroup();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    if (group?.id) {
      fetchMembers();
    }
  }, [group?.id]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await groupApi.getGroupMembers(Number(group.id));
      setMembers(data);
    } catch (err) {
      console.error("Failed to load members:", err);
    } finally {
      setLoading(false);
    }
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

      {/* Group Members Section */}
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
    </ScrollView>
  );
};

export default Settings;
