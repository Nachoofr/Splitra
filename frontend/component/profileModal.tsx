import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { userApi } from "../app/api/userApi";
import * as ImagePicker from "expo-image-picker";

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  fullName: string;
  email: string;
  phone: string;
  profilePicture?: string;
  groupCount?: number;
  expenseCount?: number;
  userId: number;
  onProfileUpdated?: () => void;
}

const ProfileModal = ({
  visible,
  onClose,
  fullName,
  email,
  phone,
  profilePicture,
  groupCount = 0,
  expenseCount = 0,
  userId,
  onProfileUpdated,
}: ProfileModalProps) => {
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ fullName, email, phone });
  const [saving, setSaving] = useState(false);
  const [localPicture, setLocalPicture] = useState<string | undefined>(
    profilePicture,
  );

  useEffect(() => {
    setEditData({ fullName, email, phone });
    setLocalPicture(profilePicture);
  }, [fullName, email, phone, profilePicture]);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Please allow access to your photo library to change your profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const base64Image = `data:image/jpeg;base64,${asset.base64}`;
      setLocalPicture(base64Image);

      try {
        setSaving(true);
        await userApi.updateUser(userId, {
          fullName: editData.fullName,
          email: editData.email,
          phone: editData.phone,
          profilePicture: base64Image,
        });
        Alert.alert("Success", "Profile picture updated!");
        if (onProfileUpdated) onProfileUpdated();
      } catch (err) {
        Alert.alert(
          "Error",
          "Failed to update profile picture. Please try again.",
        );
        setLocalPicture(profilePicture);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleCancel = () => {
    setEditData({ fullName, email, phone });
    setEditMode(false);
  };

  const handleSave = async () => {
    if (!editData.fullName.trim()) {
      Alert.alert("Error", "Full name is required");
      return;
    }
    if (!editData.email.trim()) {
      Alert.alert("Error", "Email is required");
      return;
    }
    if (!editData.phone.trim()) {
      Alert.alert("Error", "Phone is required");
      return;
    }

    try {
      setSaving(true);
      await userApi.updateUser(userId, {
        fullName: editData.fullName,
        email: editData.email,
        phone: editData.phone,
        profilePicture: localPicture,
      });
      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "OK",
          onPress: () => {
            setEditMode(false);
            if (onProfileUpdated) onProfileUpdated();
          },
        },
      ]);
    } catch (err) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-100">
        <View className="bg-primary px-6 pt-14 pb-5 flex-row items-center gap-4">
          <Pressable
            onPress={onClose}
            className="w-10 h-10 rounded-full bg-[#2E4057] items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </Pressable>
          <Text className="text-white text-xl font-bold">Profile</Text>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mt-10 mb-6">
            <View className="relative">
              {localPicture ? (
                <Image
                  source={{ uri: localPicture }}
                  className="w-28 h-28 rounded-full"
                  style={{ width: 112, height: 112, borderRadius: 56 }}
                />
              ) : (
                <View className="w-28 h-28 rounded-full bg-primary items-center justify-center">
                  <Text className="text-white text-4xl font-bold tracking-wide">
                    {getInitials(editData.fullName)}
                  </Text>
                </View>
              )}
              <Pressable
                onPress={handlePickImage}
                disabled={saving}
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white border border-gray-200 items-center justify-center shadow"
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#374151" />
                ) : (
                  <Ionicons name="camera-outline" size={18} color="#374151" />
                )}
              </Pressable>
            </View>

            <Text className="text-primary text-2xl font-bold mt-4">
              {editData.fullName}
            </Text>
            <Text className="text-gray-400 text-base mt-1">
              {editData.email}
            </Text>
          </View>

          <View className="bg-white rounded-3xl mx-6 shadow-sm overflow-hidden">
            <View className="px-6 pt-5 pb-4">
              <Text className="text-gray-400 text-sm mb-1">Full Name</Text>
              {editMode ? (
                <TextInput
                  value={editData.fullName}
                  onChangeText={(text) =>
                    setEditData({ ...editData, fullName: text })
                  }
                  className="text-gray-900 text-base border-b border-primary pb-1"
                  autoCapitalize="words"
                />
              ) : (
                <Text className="text-gray-900 text-base">
                  {editData.fullName}
                </Text>
              )}
            </View>

            <View className="h-px bg-gray-100 mx-6" />

            <View className="px-6 py-4">
              <Text className="text-gray-400 text-sm mb-1">Email</Text>
              {editMode ? (
                <TextInput
                  value={editData.email}
                  onChangeText={(text) =>
                    setEditData({ ...editData, email: text })
                  }
                  className="text-gray-900 text-base border-b border-primary pb-1"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <Text className="text-gray-900 text-base">
                  {editData.email}
                </Text>
              )}
            </View>

            <View className="h-px bg-gray-100 mx-6" />

            <View className="px-6 pt-4 pb-5">
              <Text className="text-gray-400 text-sm mb-1">Phone</Text>
              {editMode ? (
                <TextInput
                  value={editData.phone}
                  onChangeText={(text) =>
                    setEditData({ ...editData, phone: text })
                  }
                  className="text-gray-900 text-base border-b border-primary pb-1"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text className="text-gray-900 text-base">
                  {editData.phone}
                </Text>
              )}
            </View>
          </View>

          <View className="mx-6 mt-6 mb-2 bg-[#1a2535] rounded-2xl px-6 py-5 flex-row justify-between items-center">
            <View className="items-center flex-1">
              <Text className="text-white text-3xl font-bold">
                {groupCount}
              </Text>
              <Text className="text-gray-400 text-sm mt-1">Groups</Text>
            </View>
            <View className="w-px h-10 bg-gray-600" />
            <View className="items-center flex-1">
              <Text className="text-white text-3xl font-bold">
                {expenseCount}
              </Text>
              <Text className="text-gray-400 text-sm mt-1">Expenses</Text>
            </View>
            <View className="w-px h-10 bg-gray-600" />
            <View className="items-center flex-1">
              <Text className="text-white text-3xl font-bold">—</Text>
              <Text className="text-gray-400 text-sm mt-1">Settled</Text>
            </View>
          </View>
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0 px-6 pb-10 bg-gray-100">
          {editMode ? (
            <View className="flex-row gap-4">
              <Pressable
                onPress={handleCancel}
                className="flex-1 bg-gray-200 rounded-2xl py-4 items-center justify-center"
              >
                <Text className="text-gray-700 text-lg font-semibold">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={saving}
                className="flex-1 bg-primary rounded-2xl py-4 flex-row items-center justify-center gap-2"
              >
                {saving ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={20} color="white" />
                    <Text className="text-white text-lg font-semibold">
                      Save
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => setEditMode(true)}
              className="bg-primary rounded-2xl py-4 flex-row items-center justify-center gap-2 active:opacity-80"
            >
              <Ionicons name="pencil-outline" size={20} color="white" />
              <Text className="text-white text-lg font-semibold">
                Edit Profile
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ProfileModal;
