import {
  Text,
  View,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import LogoText from "../../component/LogoText";
import AuthTextInput from "../../component/authTextInput";
import AuthButton from "../../component/authButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { authApi } from "../api/authApi";
import { useRouter, useLocalSearchParams } from "expo-router";

const NewPassword = () => {
  const router = useRouter();
  const { email, code } = useLocalSearchParams<{
    email: string;
    code: string;
  }>();

  const emailStr = Array.isArray(email) ? email[0] : email;
  const codeStr = Array.isArray(code) ? code[0] : (code ?? "").trim();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!emailStr || !codeStr) {
      Alert.alert("Error", "Session data missing. Please start over.");
      router.replace("/forgotPassword");
      return;
    }

    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await authApi.forgotPasswordReset(emailStr, codeStr, newPassword);
      Alert.alert("Success", "Your password has been reset successfully!", [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 410) {
        Alert.alert(
          "Expired",
          "Your reset session has expired. Please start over.",
        );
        router.replace("/forgotPassword");
      } else if (status === 401) {
        Alert.alert(
          "Error",
          "Invalid or expired code. Please start the reset process again.",
        );
        router.replace("/forgotPassword");
      } else {
        Alert.alert("Error", "Failed to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-auto items-center justify-center mt-10">
            <LogoText />
            <View className="w-64 mt-7 items-center">
              <Text className="text-center text-primary text-4xl font-bold">
                New Password
              </Text>
              <Text className="text-center text-gray-500 text-base mt-3">
                Enter your new password below.
              </Text>
            </View>
          </View>

          <View className="ml-10 mt-10">
            <Text className="text-gray-900 text-2xl font-normal pb-2">
              New Password
            </Text>
            <AuthTextInput
              placeholder="Enter new password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>

          <View className="ml-10 mt-5">
            <Text className="text-gray-900 text-2xl font-normal pb-2">
              Confirm Password
            </Text>
            <AuthTextInput
              placeholder="Re-enter new password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <View className="ml-10 mt-5">
            <AuthButton onPress={handleReset} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center p-4">
                  Reset Password
                </Text>
              )}
            </AuthButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default NewPassword;
