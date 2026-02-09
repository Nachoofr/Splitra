import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Pressable,
  ScrollView,
  RefreshControl,
} from "react-native";
import React, { useState, useEffect } from "react";

import CommonTitle from "../../component/commonTitle";
import HomeButton from "../../component/homeButton";
import { groupApi, Group } from "../api/groupApi";
import { Ionicons } from "@expo/vector-icons";
import GroupCard from "../../component/groupCard";
import CreateGroupModal from "../../component/createGruop";
import { router } from "expo-router";

const Groups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await groupApi.getAllGroups();
      setGroups(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch groups");
      console.error("Error fetching groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGroups();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-4">
        <Text className="text-red-500 text-lg font-semibold mb-4">{error}</Text>
        <TouchableOpacity
          onPress={fetchGroups}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View className="flex-1 pl-6 pr-6">
      <CommonTitle text="Your Groups" />

      <View className="flex-row w-full mt-3 gap-5">
        <HomeButton text="All" />

        <HomeButton text="Settled" />

        <HomeButton text="Unsettled" />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#101828"
          />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {groups.map((group, index) => (
          <GroupCard
            key={index}
            group={group}
            // onPress={(group) => console.log("Group pressed:", group.groupName)}
            onPress={(group) => router.push(`/group/${group.id}/home`)}
          />
        ))}
      </ScrollView>
      <Pressable
        className="absolute right-4 bottom-5"
        onPress={() => setShowCreateGroup(true)}
      >
        <Ionicons name="add-circle" size={80} color="primary" />
      </Pressable>
      <CreateGroupModal
        visible={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onGroupCreated={fetchGroups}
      />
    </View>
  );
};

export default Groups;
