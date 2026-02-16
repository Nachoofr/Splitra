import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { AxiosError } from "axios";
import { categoryApi } from "../app/api/categoryApi";

type CreateCategoryProps = {
  visible: boolean;
  onClose: () => void;
  onCategoryCreated?: () => void;
  groupId: number;
};

const CreateCategory = ({
  visible,
  onClose,
  onCategoryCreated,
  groupId,
}: CreateCategoryProps) => {
  const [categoryData, setCategoryData] = useState({
    name: "",
  });

  const [loading, setLoading] = useState<boolean>(false);

  const handleCreateCategory = async () => {
    if (!categoryData.name.trim()) {
      Alert.alert("Error", "Category name is required");
      return;
    }

    try {
      setLoading(true);

      console.log("Creating category with:", {
        groupId: groupId,
        name: categoryData.name,
      });

      const response = await categoryApi.createCategory(
        groupId,
        categoryData.name
      );

      console.log("Category created:", response);

      setCategoryData({ name: "" });
      Alert.alert("Success", "Category created successfully!");
      onClose();

      if (onCategoryCreated) {
        onCategoryCreated();
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      console.error("Category creation error:", err.response?.data);

      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to create category"
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
                Create Category
              </Text>

              <Pressable onPress={onClose}>
                <Ionicons name="close" size={26} color="#667085" />
              </Pressable>
            </View>

            <Text className="mb-2 font-medium text-gray-700">
              Category Name
            </Text>
            <TextInput
              placeholder="e.g., Food, Transport"
              placeholderTextColor="#98A2B3"
              className="border border-gray-300 rounded-xl px-4 py-3 mb-5 text-gray-900"
              value={categoryData.name}
              onChangeText={(text: string) =>
                setCategoryData({ ...categoryData, name: text })
              }
            />

            <Pressable
              className="bg-primary py-4 rounded-2xl items-center"
              onPress={handleCreateCategory}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-lg">
                  Create Category
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateCategory;