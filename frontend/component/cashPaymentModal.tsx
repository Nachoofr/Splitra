import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { settlementApi } from "../app/api/settelmentApi";

interface CashPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  toName: string;
  toUserId: number;
  groupId: number;
  suggestedAmount?: number;
}

const CashPaymentModal = ({
  visible,
  onClose,
  onConfirm,
  toName,
  toUserId,
  groupId,
  suggestedAmount,
}: CashPaymentModalProps) => {
  const [amount, setAmount] = useState(
    suggestedAmount ? suggestedAmount.toString() : ""
  );
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setAmount(suggestedAmount ? suggestedAmount.toString() : "");
    onClose();
  };

  const handleConfirm = async () => {
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }

    try {
      setLoading(true);
      await settlementApi.initiateCashSettlement(groupId, toUserId, parsed);
      Alert.alert(
        "Payment Initiated",
        `Cash payment of NPR ${parsed.toFixed(2)} to ${toName} has been initiated. Waiting for confirmation.`,
        [
          {
            text: "OK",
            onPress: () => {
              handleClose();
              onConfirm();
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to initiate payment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">
                Cash Payment
              </Text>
              <Pressable
                onPress={handleClose}
                className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#374151" />
              </Pressable>
            </View>

            <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 mb-4">
              <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
                <Text className="text-green-700 font-bold text-base">
                  {toName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text className="text-gray-400 text-xs">Paying to</Text>
                <Text className="text-gray-900 text-base font-semibold">
                  {toName}
                </Text>
              </View>
            </View>

            <Text className="text-gray-700 font-medium mb-2">
              Enter Amount (NPR)
            </Text>
            <View className="flex-row items-center border-2 border-gray-200 rounded-2xl px-4 py-3 mb-2 bg-gray-50">
              <Text className="text-gray-500 text-lg font-semibold mr-2">
                NPR
              </Text>
              <TextInput
                className="flex-1 text-gray-900 text-xl font-bold"
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                autoFocus
              />
            </View>

            {suggestedAmount !== undefined && (
              <Pressable
                onPress={() => setAmount(suggestedAmount.toString())}
                className="mb-5"
              >
                <Text className="text-primary text-sm">
                  Use suggested amount: NPR {suggestedAmount.toFixed(2)}
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={handleConfirm}
              disabled={loading}
              className="bg-[#101828] rounded-2xl py-4 items-center justify-center flex-row gap-2 mt-2"
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="cash-outline" size={20} color="white" />
                  <Text className="text-white text-lg font-semibold">
                    Confirm Payment
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CashPaymentModal;