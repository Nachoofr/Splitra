import {
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
  ScrollView,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import HomeButton from "../../component/homeButton";
import { groupApi, Group } from "../api/groupApi";
import { Ionicons } from "@expo/vector-icons";
import GroupCard from "../../component/groupCard";
import CreateGroupModal from "../../component/createGruop";
import { router } from "expo-router";
import JoinGroupModal from "../../component/joinGroup";

const Groups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [showJoinGroupModal, setShowJoinGroupModal] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGroups();
    setRefreshing(false);
  };

  const getFilteredGroups = () => {
    if (selectedFilter === "All") return groups;
    if (selectedFilter === "Settled")
      return groups.filter((g) => g.Status === "SETTLED");
    if (selectedFilter === "Unsettled")
      return groups.filter((g) => g.Status === "UNSETTLED");
    return groups;
  };

  const filteredGroups = getFilteredGroups();

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#101828" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-4">
        <Text className="text-red-500 text-lg font-semibold mb-4">{error}</Text>
        <TouchableOpacity
          onPress={fetchGroups}
          className="bg-primary px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 pl-6 pr-6">
      <View className="flex-row items-end justify-between pr-2 mt-56">
        <View className="flex-row items-center gap-6">
          <View className="w-2.5 h-12 bg-primary rounded-full" />
          <Text className="text-3xl font-extrabold text-primary">
            Your Groups
          </Text>
        </View>
        <Pressable
          onPress={() => setShowJoinGroupModal(true)}
          className="flex-row items-center bg-primary px-4 py-2 rounded-2xl gap-2 mb-1"
        >
          <Ionicons name="person-add-outline" size={18} color="white" />
          <Text className="text-white font-semibold text-base">Join Group</Text>
        </Pressable>
      </View>

      {/* Filter Buttons */}
      <View className="flex-row w-full mt-3 gap-5">
        <HomeButton
          text="All"
          selected={selectedFilter === "All"}
          onPress={() => setSelectedFilter("All")}
        />
        <HomeButton
          text="Settled"
          selected={selectedFilter === "Settled"}
          onPress={() => setSelectedFilter("Settled")}
        />
        <HomeButton
          text="Unsettled"
          selected={selectedFilter === "Unsettled"}
          onPress={() => setSelectedFilter("Unsettled")}
        />
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
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group, index) => (
            <GroupCard
              key={index}
              group={group}
              onPress={(group) =>
                router.push({
                  pathname: "/group/[id]",
                  params: { id: group.id.toString() },
                })
              }
            />
          ))
        ) : (
          <View className="flex-1 justify-center items-center mt-20">
            <Text className="text-gray-500 text-lg">
              No {selectedFilter.toLowerCase()} groups found
            </Text>
          </View>
        )}
      </ScrollView>

      <Pressable
        className="absolute right-4 bottom-5"
        onPress={() => setShowCreateGroup(true)}
      >
        <Ionicons name="add-circle" size={80} color="#101828" />
      </Pressable>

      <CreateGroupModal
        visible={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onGroupCreated={fetchGroups}
      />

      <JoinGroupModal
        visible={showJoinGroupModal}
        onClose={() => setShowJoinGroupModal(false)}
        onJoined={fetchGroups}
      />
    </View>
  );
};

export default Groups;
