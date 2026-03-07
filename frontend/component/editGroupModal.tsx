import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { groupApi } from "../app/api/groupApi";

interface EditGroupModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: number;
  currentGroupName: string;
  currentGroupPicture: string;
  onGroupUpdated?: () => void;
}

const EditGroupModal = ({
  visible,
  onClose,
  groupId,
  currentGroupName,
  currentGroupPicture,
  onGroupUpdated,
}: EditGroupModalProps) => {
  const [groupName, setGroupName] = useState(currentGroupName);
  const [groupPicture, setGroupPicture] = useState(currentGroupPicture);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setGroupName(currentGroupName);
    setGroupPicture(currentGroupPicture);
  }, [currentGroupName, currentGroupPicture, visible]);

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
      setGroupPicture(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleRemovePicture = () => {
    setGroupPicture("");
  };

  const handleSave = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Group name is required");
      return;
    }

    try {
      setSaving(true);
      await groupApi.updateGroup(groupId, {
        groupName: groupName.trim(),
        groupPicture: groupPicture,
      });
      Alert.alert("Success", "Group updated successfully!", [
        {
          text: "OK",
          onPress: () => {
            onClose();
            if (onGroupUpdated) onGroupUpdated();
          },
        },
      ]);
    } catch (err) {
      Alert.alert("Error", "Failed to update group. Please try again.");
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
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 bg-[#1a2535]">
          <View className="flex-row items-center justify-between px-6 pt-14 pb-5">
            <Text className="text-white text-3xl font-bold">Edit Group</Text>
            <Pressable
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-[#2E4057] items-center justify-center"
            >
              <Ionicons name="close" size={22} color="white" />
            </Pressable>
          </View>

          <ScrollView
            className="flex-1 bg-white"
            contentContainerStyle={{ padding: 24, paddingBottom: 140 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-gray-900 text-lg font-semibold mb-4">
              Group Picture
            </Text>

            {groupPicture ? (
              <View className="items-center mb-4">
                <Image
                  source={{ uri: groupPicture }}
                  style={{
                    width: 160,
                    height: 160,
                    borderRadius: 20,
                    borderWidth: 3,
                    borderColor: "#e5e7eb",
                  }}
                />
              </View>
            ) : null}

            <Pressable
              onPress={handlePickImage}
              className="border-2 border-dashed border-gray-300 rounded-2xl py-8 items-center justify-center mb-4"
            >
              <Ionicons name="image-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-400 text-base mt-2">
                Upload a new picture
              </Text>
              <View className="mt-4 bg-[#1a2535] px-6 py-3 rounded-full">
                <Text className="text-white font-semibold text-base">
                  Choose Image
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={handleRemovePicture}
              className="bg-red-50 rounded-2xl py-4 items-center mb-8"
            >
              <Text className="text-red-500 font-semibold text-base">
                Remove Picture
              </Text>
            </Pressable>

            <Text className="text-gray-900 text-lg font-semibold mb-3">
              Group Name
            </Text>
            <View className="flex-row items-center border border-gray-200 rounded-2xl px-4 py-3 bg-gray-50 mb-8">
              <Ionicons name="create-outline" size={22} color="#9CA3AF" />
              <TextInput
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Group name"
                placeholderTextColor="#9CA3AF"
                className="flex-1 text-gray-900 text-base ml-3"
                returnKeyType="done"
              />
            </View>
          </ScrollView>

          <View className="px-6 pb-10 pt-4 bg-white border-t border-gray-100">
            <Pressable
              onPress={handleSave}
              disabled={saving}
              className="bg-[#1a2535] rounded-2xl py-4 flex-row items-center justify-center gap-2"
            >
              {saving ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="white" />
                  <Text className="text-white text-lg font-semibold">
                    Save Changes
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

export default EditGroupModal;
