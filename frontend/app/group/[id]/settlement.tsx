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
import {
  settlementApi,
  Settlement as SettlementType,
  PendingSettlement,
} from "../../api/settelmentApi";
import { userApi } from "../../api/userApi";
import { useGroup } from "./groupContext";
import { Ionicons } from "@expo/vector-icons";
import SettlementSummary from "../../../component/settlementSummary";
import SettlementList from "../../../component/settlemetList";
import PaymentMethodModal from "../../../component/paymentMethodModal";
import CommonTitle from "../../../component/commonTitleGroups";

const Settlement = () => {
  const { group } = useGroup();
  const [settlements, setSettlements] = useState<SettlementType[]>([]);
  const [myBalance, setMyBalance] = useState<number>(0);
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSettlement, setSelectedSettlement] =
    useState<SettlementType | null>(null);
  const [pendingSettlements, setPendingSettlements] = useState<
    PendingSettlement[]
  >([]);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

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
      const myBalanceData = balanceData.find(
        (b) => b.userName === currentUser.fullName,
      );
      setMyBalance(myBalanceData?.balance ?? 0);

      const pending = await settlementApi.getPendingSettlements();
      setPendingSettlements(pending);
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

  const handleSettlePress = (s: SettlementType) => {
    setSelectedSettlement(s);
    setModalVisible(true);
  };

  const handlePaymentConfirm = () => {
    setModalVisible(false);
    setSelectedSettlement(null);
    fetchAll();
  };

  const handleConfirmSettlement = async (settlementId: number) => {
    Alert.alert(
      "Confirm Payment",
      "Confirm that you have received this cash payment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setConfirmingId(settlementId);
              await settlementApi.confirmSettlement(settlementId);
              Alert.alert("Success", "Payment confirmed!");
              fetchAll();
            } catch (err: any) {
              Alert.alert(
                "Error",
                err?.response?.data?.message || "Failed to confirm payment.",
              );
            } finally {
              setConfirmingId(null);
            }
          },
        },
      ],
    );
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

  const myPendingToConfirm = pendingSettlements.filter(
    (p) =>
      p.toUserName === currentUserName &&
      p.status === "PENDING" &&
      p.groupId === group.id,
  );

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

      {myPendingToConfirm.length > 0 && (
        <View className="mx-6 mt-4">
          <CommonTitle text={"Awaiting Your Confirmation"} />
          {myPendingToConfirm.map((p) => (
            <View
              key={p.id}
              className="bg-white rounded-3xl p-5 mb-3 border-l-4 border-yellow-400"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-12 h-12 rounded-full bg-yellow-100 items-center justify-center">
                    <Text className="text-yellow-700 font-bold text-lg">
                      {p.fromUserName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-xl font-semibold text-gray-900">
                      {p.fromUserName}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      Cash payment pending
                    </Text>
                  </View>
                </View>
                <Text className="text-gray-800 text-xl font-medium">
                  NPR {p.amount}
                </Text>
              </View>

              <Pressable
                onPress={() => handleConfirmSettlement(p.id)}
                disabled={confirmingId === p.id}
                className="mt-4 bg-green-600 rounded-2xl py-3 items-center"
              >
                {confirmingId === p.id ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Confirm Paayment
                  </Text>
                )}
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <SettlementList
        toReceiveList={toReceiveList}
        toPayList={toPayList}
        groupName={group.groupName}
        onSettlePress={handleSettlePress}
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

      {selectedSettlement && (
        <PaymentMethodModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedSettlement(null);
          }}
          onConfirm={handlePaymentConfirm}
          toName={selectedSettlement.to}
          toUserId={selectedSettlement.toUserId}
          groupId={Number(group.id)}
          amount={selectedSettlement.amount}
        />
      )}
    </ScrollView>
  );
};

export default Settlement;
