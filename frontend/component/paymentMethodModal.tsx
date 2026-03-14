import { Modal, View, Text, Pressable, Alert, Image } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

interface PaymentMethodModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  toName: string;
  amount: number;
}

type PaymentMethod = "cash" | "esewa" | "khalti" | null;

const PaymentMethodModal = ({
  visible,
  onClose,
  onConfirm,
  toName,
  amount,
}: PaymentMethodModalProps) => {
  const [selected, setSelected] = useState<PaymentMethod>(null);

  const handleClose = () => {
    setSelected(null);
    onClose();
  };

  const handleConfirm = () => {
    if (!selected) return;
    const labels: Record<string, string> = {
      cash: "Cash",
      esewa: "eSewa",
      khalti: "Khalti",
    };
    Alert.alert(
      "Payment Confirmed",
      `You've settled NPR ${amount} to ${toName} via ${labels[selected]}.`,
      [
        {
          text: "OK",
          onPress: () => {
            setSelected(null);
            onConfirm();
          },
        },
      ],
    );
  };

  const buttonLabel: Record<string, string> = {
    cash: "Confirm Payment",
    esewa: "Proceed with eSewa",
    khalti: "Proceed with Khalti",
  };

  const buttonStyle: Record<string, string> = {
    cash: "bg-[#101828]",
    esewa: "bg-[#60BB46]",
    khalti: "bg-[#5C2D91]",
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xl font-bold text-gray-900">
              Select Payment Method
            </Text>
            <Pressable
              onPress={handleClose}
              className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="close" size={20} color="#374151" />
            </Pressable>
          </View>

          <Text className="text-gray-400 text-sm mb-6 text-center">
            Choose how you want to settle this payment
          </Text>

          <Pressable
            onPress={() => setSelected("cash")}
            className={`flex-row items-center p-4 rounded-2xl mb-3 border-2 ${
              selected === "cash"
                ? "border-[#101828] bg-gray-50"
                : "border-gray-100 bg-gray-50"
            }`}
          >
            <View className="w-14 h-14 rounded-full bg-green-100 items-center justify-center mr-4">
              <Ionicons name="cash-outline" size={28} color="#16A34A" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-lg font-semibold">Cash</Text>
              <Text className="text-gray-400 text-sm">
                Pay with physical cash
              </Text>
            </View>
            {selected === "cash" && (
              <Ionicons name="checkmark-circle" size={24} color="#101828" />
            )}
          </Pressable>

          <Pressable
            onPress={() => setSelected("esewa")}
            className={`flex-row items-center p-4 rounded-2xl mb-3 border-2 ${
              selected === "esewa"
                ? "border-[#60BB46] bg-green-50"
                : "border-gray-100 bg-gray-50"
            }`}
          >
            <View className="w-14 h-14 rounded-full bg-white items-center justify-center mr-4">
              <Image
                source={require("../assets/img/esewa-logo.png")}
                className="w-10 h-10 rounded-full"
                resizeMode="contain"
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-lg font-semibold">eSewa</Text>
              <Text className="text-gray-400 text-sm">
                Pay via eSewa wallet
              </Text>
            </View>
            {selected === "esewa" && (
              <Ionicons name="checkmark-circle" size={24} color="#60BB46" />
            )}
          </Pressable>

          <Pressable
            onPress={() => setSelected("khalti")}
            className={`flex-row items-center p-4 rounded-2xl mb-6 border-2 ${
              selected === "khalti"
                ? "border-[#5C2D91] bg-purple-50"
                : "border-gray-100 bg-gray-50"
            }`}
          >
            <View className="w-14 h-14 rounded-full bg-white items-center justify-center mr-4">
              <Image
                source={require("../assets/img/khalti-logo.png")}
                className="w-10 h-10 rounded-full"
                resizeMode="contain"
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-lg font-semibold">
                Khalti
              </Text>
              <Text className="text-gray-400 text-sm">
                Pay via Khalti wallet
              </Text>
            </View>
            {selected === "khalti" && (
              <Ionicons name="checkmark-circle" size={24} color="#5C2D91" />
            )}
          </Pressable>

          {selected && (
            <Pressable
              onPress={handleConfirm}
              className={`py-4 rounded-2xl items-center ${buttonStyle[selected]}`}
            >
              <Text className="text-white font-bold text-lg">
                {buttonLabel[selected]}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default PaymentMethodModal;
