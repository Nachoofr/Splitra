import {
  View,
  Text,
  Pressable,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { userApi, QrCode } from "../app/api/userApi";

interface PaymentQrProps {
  userId: number;
  phone: string;
  qrCodes: QrCode[];
  onUpdated?: () => void;
}

const getLabelColor = (label: string) => {
  const colors = [
    "#22C55E",
    "#8B5CF6",
    "#3B82F6",
    "#F97316",
    "#EF4444",
    "#14B8A6",
  ];
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = label.charCodeAt(i) + hash * 31;
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (label: string) =>
  label
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const PaymentQr = ({ userId, phone, qrCodes, onUpdated }: PaymentQrProps) => {
  const [localQrCodes, setLocalQrCodes] = useState<QrCode[]>(qrCodes);
  const [selectedId, setSelectedId] = useState<number | null>(
    qrCodes.length > 0 ? qrCodes[0].id : null,
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newQrImage, setNewQrImage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalQrCodes(qrCodes);
    setSelectedId(qrCodes.length > 0 ? qrCodes[0].id : null);
  }, [qrCodes]);

  const selectedQr = localQrCodes.find((q) => q.id === selectedId);

  const handlePickQrImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your photo library.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setNewQrImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleAdd = async () => {
    if (!newLabel.trim()) {
      Alert.alert("Error", "Please enter a label");
      return;
    }
    if (!newQrImage) {
      Alert.alert("Error", "Please select a QR code image");
      return;
    }
    try {
      setSaving(true);
      const updatedList = [
        ...localQrCodes.map((q) => ({
          id: q.id,
          label: q.label,
          qrImageData: q.qrImageData,
        })),
        { label: newLabel.trim(), qrImageData: newQrImage },
      ];
      const result = await userApi.updateUser(userId, { qrCodes: updatedList });
      setLocalQrCodes(result.qrCodes);
      setSelectedId(result.qrCodes[result.qrCodes.length - 1].id);
      setShowAddForm(false);
      setNewLabel("");
      setNewQrImage("");
      if (onUpdated) onUpdated();
    } catch {
      Alert.alert("Error", "Failed to add QR code.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (qrId: number) => {
    Alert.alert("Remove Account", "Remove this QR code?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            const updatedList = localQrCodes
              .filter((q) => q.id !== qrId)
              .map((q) => ({
                id: q.id,
                label: q.label,
                qrImageData: q.qrImageData,
              }));
            const result = await userApi.updateUser(userId, {
              qrCodes: updatedList,
            });
            setLocalQrCodes(result.qrCodes);
            setSelectedId(
              result.qrCodes.length > 0 ? result.qrCodes[0].id : null,
            );
            if (onUpdated) onUpdated();
          } catch {
            Alert.alert("Error", "Failed to remove QR code.");
          }
        },
      },
    ]);
  };

  return (
    <View className="mx-6 mt-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
          Payment QR
        </Text>
        <Pressable
          onPress={() => {
            setShowAddForm(!showAddForm);
            setNewLabel("");
            setNewQrImage("");
          }}
          className="flex-row items-center gap-1 bg-[#1a2535] px-4 py-2 rounded-full"
        >
          <Ionicons
            name={showAddForm ? "close" : "add"}
            size={16}
            color="white"
          />
          <Text className="text-white text-xs font-semibold">
            {showAddForm ? "Cancel" : "Add Account"}
          </Text>
        </Pressable>
      </View>

      {showAddForm && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
        >
          <View className="bg-white rounded-3xl px-5 py-5 mb-4 shadow-sm">
            <Text className="text-gray-700 font-semibold mb-4">
              New Payment Account
            </Text>

            <Text className="text-gray-500 text-xs font-medium mb-1 ml-1">
              Label
            </Text>
            <View className="border border-gray-200 rounded-2xl px-4 py-3 bg-gray-50 flex-row items-center mb-5">
              <Ionicons name="pricetag-outline" size={16} color="#9CA3AF" />
              <TextInput
                value={newLabel}
                onChangeText={setNewLabel}
                placeholder="e.g. eSewa, Khalti, Bank"
                placeholderTextColor="#9CA3AF"
                className="flex-1 text-gray-900 text-sm ml-2"
                returnKeyType="done"
                autoCapitalize="words"
              />
            </View>

            <Text className="text-gray-500 text-xs font-medium mb-1 ml-1">
              QR Code Image
            </Text>
            <Pressable
              onPress={handlePickQrImage}
              className="border-2 border-dashed border-gray-300 rounded-2xl py-6 items-center justify-center mb-5"
            >
              {newQrImage ? (
                <View className="items-center">
                  <Image
                    source={{ uri: newQrImage }}
                    style={{ width: 110, height: 110, borderRadius: 12 }}
                    resizeMode="contain"
                  />
                  <Text className="text-gray-400 text-xs mt-2">
                    Tap to change
                  </Text>
                </View>
              ) : (
                <>
                  <Ionicons name="qr-code-outline" size={36} color="#9CA3AF" />
                  <Text className="text-gray-400 text-sm mt-2">
                    Tap to choose QR image
                  </Text>
                </>
              )}
            </Pressable>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  setShowAddForm(false);
                  setNewLabel("");
                  setNewQrImage("");
                }}
                className="flex-1 border border-gray-200 rounded-2xl py-3 items-center"
              >
                <Text className="text-gray-500 font-semibold">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleAdd}
                disabled={saving}
                className="flex-1 bg-[#1a2535] rounded-2xl py-3 items-center justify-center flex-row gap-2"
              >
                {saving ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="add-circle-outline"
                      size={18}
                      color="white"
                    />
                    <Text className="text-white font-semibold">Add</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      {selectedQr ? (
        <View className="bg-[#1a2535] rounded-3xl overflow-hidden mb-4">
          <View className="px-6 pt-6 pb-4 flex-row items-start justify-between">
            <View>
              <Text className="text-gray-400 text-xs tracking-widest uppercase mb-1">
                Payment Via
              </Text>
              <Text className="text-white text-2xl font-bold">
                {selectedQr.label}
              </Text>
              <Text className="text-gray-400 text-sm mt-1">{phone}</Text>
            </View>
            <Ionicons name="qr-code-outline" size={26} color="#4B5563" />
          </View>

          <View className="h-px bg-[#2E4057] mx-6" />

          <View className="items-center py-8 px-6">
            <View className="bg-white rounded-3xl p-4">
              <Image
                source={{ uri: selectedQr.qrImageData }}
                style={{ width: 200, height: 200 }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-gray-500 text-xs tracking-widest mt-5 uppercase">
              Scan to Pay · Splitra
            </Text>
          </View>
        </View>
      ) : (
        !showAddForm && (
          <View className="bg-white rounded-3xl px-6 py-8 items-center shadow-sm mb-4">
            <Ionicons name="qr-code-outline" size={40} color="#D1D5DB" />
            <Text className="text-gray-400 text-sm mt-3 text-center">
              No payment accounts yet.{"\n"}Tap + Add Account to link one.
            </Text>
          </View>
        )
      )}

      {localQrCodes.length > 0 && (
        <View className="bg-white rounded-3xl overflow-hidden shadow-sm mb-4">
          {localQrCodes.map((qr, index) => (
            <View key={qr.id}>
              <Pressable
                onPress={() => setSelectedId(qr.id)}
                className="flex-row items-center px-4 py-4"
              >
                {selectedId === qr.id && (
                  <View className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full" />
                )}
                <View
                  style={{ backgroundColor: getLabelColor(qr.label) }}
                  className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                >
                  <Text className="text-white font-bold text-sm">
                    {getInitials(qr.label)}
                  </Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-gray-900 text-base font-semibold">
                      {qr.label}
                    </Text>
                    {index === 0 && (
                      <View className="bg-gray-100 px-2 py-0.5 rounded-full">
                        <Text className="text-gray-500 text-xs font-semibold">
                          PRIMARY
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-gray-400 text-sm">{phone}</Text>
                </View>
                <Pressable onPress={() => handleDelete(qr.id)} className="ml-2">
                  <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
                </Pressable>
              </Pressable>
              {index < localQrCodes.length - 1 && (
                <View className="h-px bg-gray-100 ml-20" />
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default PaymentQr;
