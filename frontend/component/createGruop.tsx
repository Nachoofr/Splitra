import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  Alert,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { AxiosError } from "axios";
import { groupApi } from "../app/api/groupApi";
import { KeyboardAvoidingView } from "react-native";
import * as ImagePicker from "expo-image-picker";

type CreateGroupProps = {
  visible: boolean;
  onClose: () => void;
  onGroupCreated?: () => void;
};

const CreateGroup = ({
  visible,
  onClose,
  onGroupCreated,
}: CreateGroupProps) => {
  const [groupData, setGroupData] = useState({
    groupName: "",
    groupPicture: "",
  });

  const [loading, setLoading] = useState<boolean>(false);

  const handlePickImage = async () => {
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
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setGroupData({ ...groupData, groupPicture: base64Image });
    }
  };

  const handleCreateGroup = async () => {
    if (!groupData.groupName.trim()) {
      Alert.alert("Error", "Group name is required");
      return;
    }

    try {
      setLoading(true);

      const response = await groupApi.createGroup({
        groupName: groupData.groupName,
        groupPicture: groupData.groupPicture,
      });
      console.log("Group created:", response);

      setGroupData({ groupName: "", groupPicture: "" });
      onClose();
      if (onGroupCreated) {
        onGroupCreated();
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;

      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to create group",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-3xl px-6 pt-5 pb-8">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-semibold text-gray-900">
                Create Group
              </Text>

              <Pressable onPress={onClose}>
                <Ionicons name="close" size={26} color="#667085" />
              </Pressable>
            </View>

            <View className="flex-row items-center mb-6">
              <Pressable
                onPress={handlePickImage}
                className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 items-center justify-center overflow-hidden"
              >
                {groupData.groupPicture ? (
                  <Image
                    source={{ uri: groupData.groupPicture }}
                    style={{ width: 80, height: 80, borderRadius: 40 }}
                  />
                ) : (
                  <Ionicons name="camera" size={28} color="#98A2B3" />
                )}
              </Pressable>

              <View className="ml-4 flex-1">
                <Text className="font-medium text-gray-900">
                  {groupData.groupPicture
                    ? "Tap to change picture"
                    : "Upload a group picture"}
                </Text>
                <Text className="text-sm text-gray-400 mt-1">
                  JPG, PNG or GIF (Max 5MB)
                </Text>
              </View>
            </View>

            <Text className="mb-2 font-medium text-gray-700">Group Name</Text>
            <TextInput
              placeholder="e.g., Weekend Trip"
              placeholderTextColor="#98A2B3"
              className="border border-gray-300 rounded-xl px-4 py-3 mb-5 text-gray-900"
              value={groupData.groupName}
              onChangeText={(text: string) =>
                setGroupData({ ...groupData, groupName: text })
              }
            />

            <Pressable
              className="bg-primary py-4 rounded-2xl items-center"
              onPress={handleCreateGroup}
              disabled={loading}
            >
              <Text className="text-white font-semibold text-lg">
                Create Group
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateGroup;
