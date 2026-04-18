import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import axiosInstance from "../app/api/axiosConfig";

interface ResetPasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

interface PasswordFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  placeholder: string;
}

const PasswordField = ({
  label,
  value,
  onChangeText,
  show,
  onToggleShow,
  placeholder,
}: PasswordFieldProps) => (
  <View className="mb-5">
    <Text className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2 ml-1">
      {label}
    </Text>
    <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
      <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        secureTextEntry={!show}
        className="flex-1 text-gray-900 text-base ml-3"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Pressable onPress={onToggleShow} hitSlop={8}>
        <Ionicons
          name={show ? "eye-off-outline" : "eye-outline"}
          size={20}
          color="#9CA3AF"
        />
      </Pressable>
    </View>
  </View>
);

const ResetPasswordModal = ({ visible, onClose }: ResetPasswordModalProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!currentPassword) {
      Alert.alert("Error", "Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      Alert.alert(
        "Error",
        "New password must be different from your current password.",
      );
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post("/splitra/users/reset-password", {
        currentPassword,
        newPassword,
      });
      Alert.alert("Success", "Your password has been updated successfully.", [
        { text: "OK", onPress: handleClose },
      ]);
    } catch (err: any) {
      const msg =
        err?.response?.status === 401
          ? "Current password is incorrect."
          : err?.response?.data?.message ||
            "Failed to update password. Please try again.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 bg-primary">
          <View className="flex-row items-center px-6 pt-14 pb-6">
            <Pressable
              onPress={handleClose}
              className="w-14 h-14 bg-[#374151] rounded-3xl items-center justify-center"
            >
              <Ionicons name="close" size={24} color="white" />
            </Pressable>
            <View className="ml-4">
              <Text className="text-white text-2xl font-semibold">
                Reset Password
              </Text>
              <Text className="text-[#CAD5E2] text-base mt-1">
                Keep your account secure
              </Text>
            </View>
          </View>

          <ScrollView
            className="flex-1 bg-gray-50"
            contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <PasswordField
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              show={showCurrent}
              onToggleShow={() => setShowCurrent(!showCurrent)}
              placeholder="Enter current password"
            />

            <PasswordField
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              show={showNew}
              onToggleShow={() => setShowNew(!showNew)}
              placeholder="Enter new password"
            />

            <PasswordField
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              show={showConfirm}
              onToggleShow={() => setShowConfirm(!showConfirm)}
              placeholder="Re-enter new password"
            />

            {confirmPassword.length > 0 && (
              <View className="flex-row items-center gap-2 -mt-3 mb-5 ml-1">
                <Ionicons
                  name={
                    newPassword === confirmPassword
                      ? "checkmark-circle"
                      : "close-circle"
                  }
                  size={16}
                  color={
                    newPassword === confirmPassword ? "#22C55E" : "#EF4444"
                  }
                />
                <Text
                  className="text-xs font-medium"
                  style={{
                    color:
                      newPassword === confirmPassword ? "#22C55E" : "#EF4444",
                  }}
                >
                  {newPassword === confirmPassword
                    ? "Passwords match"
                    : "Passwords do not match"}
                </Text>
              </View>
            )}
          </ScrollView>

          <View className="absolute bottom-0 left-0 right-0 bg-white px-6 py-4 border-t border-gray-200">
            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              className="bg-primary py-4 rounded-2xl items-center justify-center flex-row gap-2"
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color="white"
                  />
                  <Text className="text-white font-semibold text-lg">
                    Update Password
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

export default ResetPasswordModal;
