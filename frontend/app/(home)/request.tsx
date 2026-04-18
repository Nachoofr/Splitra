import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { settlementApi, PendingSettlement } from "../api/settelmentApi";
import { groupApi, Group } from "../api/groupApi";
import {
  settlementApi as fullSettlementApi,
  Settlement,
} from "../api/settelmentApi";
import { userApi } from "../api/userApi";
import CommonTitle from "../../component/commonTitle";
import PaymentMethodModal from "../../component/paymentMethodModal";

interface SettlementWithGroup extends Settlement {
  groupId: number;
  groupName: string;
}

const Request = () => {
  const [pendingToConfirm, setPendingToConfirm] = useState<PendingSettlement[]>(
    [],
  );
  const [toPayList, setToPayList] = useState<SettlementWithGroup[]>([]);
  const [toReceiveList, setToReceiveList] = useState<SettlementWithGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSettlement, setSelectedSettlement] =
    useState<SettlementWithGroup | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>("");

  const fetchAll = async () => {
    try {
      setError(null);

      const currentUser = await userApi.getCurrentUser();
      setCurrentUserName(currentUser.fullName);

      const pending = await settlementApi.getPendingSettlements();
      setPendingToConfirm(pending);

      const groups = await groupApi.getAllGroups();
      const allToPay: SettlementWithGroup[] = [];
      const allToReceive: SettlementWithGroup[] = [];

      await Promise.all(
        groups.map(async (group: Group) => {
          try {
            const settlements = await settlementApi.getSettlement(group.id);
            settlements.forEach((s) => {
              const enriched: SettlementWithGroup = {
                ...s,
                groupId: group.id,
                groupName: group.groupName,
              };
              if (s.from === currentUser.fullName) {
                allToPay.push(enriched);
              } else if (s.to === currentUser.fullName) {
                allToReceive.push(enriched);
              }
            });
          } catch {
          }
        }),
      );

      setToPayList(allToPay);
      setToReceiveList(allToReceive);
    } catch (err: any) {
      setError("Failed to load settlement data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
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

  const handleSettlePress = (s: SettlementWithGroup) => {
    setSelectedSettlement(s);
    setModalVisible(true);
  };

  const totalOwed = toReceiveList.reduce((sum, s) => sum + Number(s.amount), 0);
  const totalOwe = toPayList.reduce((sum, s) => sum + Number(s.amount), 0);
  const netBalance = totalOwed - totalOwe;

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#101828" />
      </View>
    );
  }

  const isEmpty =
    pendingToConfirm.length === 0 &&
    toPayList.length === 0 &&
    toReceiveList.length === 0;

  return (
    <View className="flex-1 bg-gray-50">
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
        <View className="pl-6">
          <CommonTitle text="Requests" />
        </View>

        {error ? (
          <View className="flex-1 justify-center items-center px-6 mt-10">
            <Text className="text-red-500 text-base mb-4">{error}</Text>
            <Pressable
              onPress={fetchAll}
              className="bg-primary px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Retry</Text>
            </Pressable>
          </View>
        ) : isEmpty ? (
          <View className="items-center mt-20 px-6">
            <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
              <Ionicons
                name="checkmark-circle-outline"
                size={48}
                color="#22c55e"
              />
            </View>
            <Text className="text-xl font-bold text-gray-700">
              All cleared up!
            </Text>
            <Text className="text-gray-400 text-center mt-2 text-sm">
              No pending payment requests across any of your groups.
            </Text>
          </View>
        ) : (
          <>
            <View className="mx-6 mt-4 rounded-3xl overflow-hidden">
              <View
                className={`p-6 ${
                  netBalance > 0
                    ? "bg-green-600"
                    : netBalance < 0
                      ? "bg-red-600"
                      : "bg-primary"
                }`}
              >
                <Text className="text-white/70 text-sm font-medium mb-1">
                  Net Balance (All Groups)
                </Text>
                <Text className="text-white text-4xl font-bold">
                  {netBalance >= 0 ? "+" : ""}NPR{" "}
                  {Math.abs(netBalance).toFixed(2)}
                </Text>
                <Text className="text-white/70 text-sm mt-2">
                  {netBalance > 0
                    ? "You are owed more than you owe"
                    : netBalance < 0
                      ? "You owe more than you are owed"
                      : "You're perfectly balanced"}
                </Text>

                <View className="flex-row mt-4 gap-4">
                  <View className="flex-1 bg-white/10 rounded-2xl p-3">
                    <Text className="text-white/60 text-xs">You're owed</Text>
                    <Text className="text-white font-bold text-lg">
                      NPR {totalOwed.toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-1 bg-white/10 rounded-2xl p-3">
                    <Text className="text-white/60 text-xs">You owe</Text>
                    <Text className="text-white font-bold text-lg">
                      NPR {totalOwe.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {pendingToConfirm.length > 0 && (
              <View className="mx-6 mt-6">
                <View className="flex-row items-center gap-3 mb-3">
                  <View className="w-2 h-8 bg-yellow-500 rounded-full" />
                  <Text className="text-xl font-extrabold text-primary">
                    Awaiting Confirmation
                  </Text>
                </View>
                <Text className="text-gray-400 text-sm mb-3 ml-5">
                  Confirm receipt of these cash payments
                </Text>
                {pendingToConfirm.map((p) => (
                  <View
                    key={p.id}
                    className="bg-white rounded-3xl p-5 mb-3 border-l-4 border-yellow-400 shadow-sm"
                  >
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center gap-3">
                        <View className="w-12 h-12 rounded-full bg-yellow-100 items-center justify-center">
                          <Text className="text-yellow-700 font-bold text-lg">
                            {p.fromUserName.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View>
                          <Text className="text-gray-900 text-base font-semibold">
                            {p.fromUserName}
                          </Text>
                          <Text className="text-gray-400 text-xs mt-0.5">
                            Cash payment · Pending
                          </Text>
                        </View>
                      </View>
                      <Text className="text-gray-900 text-xl font-bold">
                        NPR {p.amount}
                      </Text>
                    </View>

                    <Pressable
                      onPress={() => handleConfirmSettlement(p.id)}
                      disabled={confirmingId === p.id}
                      className="bg-green-600 rounded-2xl py-3 items-center"
                    >
                      {confirmingId === p.id ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <Text className="text-white font-semibold text-base">
                          ✓ Confirm Receipt
                        </Text>
                      )}
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {toReceiveList.length > 0 && (
              <View className="mx-6 mt-6">
                <View className="flex-row items-center gap-3 mb-3">
                  <View className="w-2 h-8 bg-green-500 rounded-full" />
                  <Text className="text-xl font-extrabold text-primary">
                    To Receive
                  </Text>
                </View>
                {toReceiveList.map((s, index) => (
                  <View
                    key={`receive-${index}`}
                    className="bg-white rounded-3xl p-5 mb-3 border-l-4 border-green-500 shadow-sm"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3 flex-1">
                        <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center">
                          <Text className="text-green-700 font-bold text-lg">
                            {s.from.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-gray-900 text-base font-semibold">
                            {s.from}
                          </Text>
                          <View className="flex-row items-center gap-1 mt-0.5">
                            <Ionicons
                              name="people-outline"
                              size={12}
                              color="#9CA3AF"
                            />
                            <Text className="text-gray-400 text-xs">
                              {s.groupName}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Text className="text-green-600 text-xl font-bold">
                        NPR {s.amount}
                      </Text>
                    </View>

                    <Pressable
                      className="mt-4 bg-gray-100 rounded-2xl py-3 items-center"
                      onPress={() =>
                        Alert.alert("Reminder", `Reminder sent to ${s.from}!`)
                      }
                    >
                      <Text className="text-gray-700 font-medium text-sm">
                        Send Reminder
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {toPayList.length > 0 && (
              <View className="mx-6 mt-6">
                <View className="flex-row items-center gap-3 mb-3">
                  <View className="w-2 h-8 bg-red-500 rounded-full" />
                  <Text className="text-xl font-extrabold text-primary">
                    To Pay
                  </Text>
                </View>
                {toPayList.map((s, index) => (
                  <View
                    key={`pay-${index}`}
                    className="bg-white rounded-3xl p-5 mb-3 border-l-4 border-red-500 shadow-sm"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3 flex-1">
                        <View className="w-12 h-12 rounded-full bg-red-100 items-center justify-center">
                          <Text className="text-red-600 font-bold text-lg">
                            {s.to.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-gray-900 text-base font-semibold">
                            {s.to}
                          </Text>
                          <View className="flex-row items-center gap-1 mt-0.5">
                            <Ionicons
                              name="people-outline"
                              size={12}
                              color="#9CA3AF"
                            />
                            <Text className="text-gray-400 text-xs">
                              {s.groupName}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Text className="text-red-500 text-xl font-bold">
                        NPR {s.amount}
                      </Text>
                    </View>

                    <Pressable
                      className="mt-4 bg-primary rounded-2xl py-3 items-center"
                      onPress={() => handleSettlePress(s)}
                    >
                      <Text className="text-white font-semibold text-sm">
                        Settle Up
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {selectedSettlement && (
        <PaymentMethodModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedSettlement(null);
          }}
          onConfirm={() => {
            setModalVisible(false);
            setSelectedSettlement(null);
            fetchAll();
          }}
          toName={selectedSettlement.to}
          toUserId={selectedSettlement.toUserId}
          groupId={selectedSettlement.groupId}
          amount={selectedSettlement.amount}
        />
      )}
    </View>
  );
};

export default Request;
