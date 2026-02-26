import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { settlementApi, Settlement, Balance } from "../../api/settelmentApi";
import { userApi } from "../../api/userApi";
import { useGroup } from "./groupContext";
import { Ionicons } from "@expo/vector-icons";
import  SettlementSummary  from "../../../component/settlementSummary"
import SettlementList from "../../../component/settlementList";

const Settlemet = () => {
  const { group } = useGroup();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [myBalance, setMyBalance] = useState<number>(0);
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (group?.id) fetchAll();
  }, [group?.id]);

  const fetchAll = async () => {
    try {
      setError(null);
      const currentUser = await userApi.getCurrentUser();
      setCurrentUserName(currentUser.fullName);

      const settlementData = await settlementApi.getSettlement(
        Number(group.id),
      );
      setSettlements(settlementData);

      const balanceData = await settlementApi.getGroupBalance(Number(group.id));
      const myBalance = balanceData.find(
        (b) => b.userName === currentUser.fullName,
      );
      setMyBalance(myBalance?.balance ?? 0);
    } catch (err: any) {
      setError("Failed to load settlement data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#101828" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-red-500 text-lg mb-4">{error}</Text>
        <Pressable
          onPress={fetchAll}
          className="bg-primary px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  const toPayList = settlements.filter((s) => s.from === currentUserName);
  const toReceiveList = settlements.filter((s) => s.to === currentUserName);

  const isSettled = myBalance === 0;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <SettlementSummary myBalance={myBalance} />

      <SettlementList
        toReceiveList={toReceiveList}
        toPayList={toPayList}
        groupName={group.groupName}
      />

      {isSettled && settlements.length === 0 && (
        <View className="items-center mt-16 px-6">
          <Ionicons name="checkmark-circle-outline" size={80} color="#22c55e" />
          <Text className="text-2xl font-bold text-gray-700 mt-4">
            All settled up!
          </Text>
          <Text className="text-gray-400 text-center mt-2">
            No pending payments in this group.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default Settlemet;
