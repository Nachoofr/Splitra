import {
  Text,
  View,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import LogoText from "../../component/LogoText";
import AuthTextInput from "../../component/authTextInput";
import AuthButton from "../../component/authButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { authApi } from "../api/authApi";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      await authApi.sendVerificationCode(
        email.trim().toLowerCase(),
        "FORGOT_PASSWORD",
      );

      router.push({
        pathname: "/verifyEmail",
        params: {
          email: email.trim().toLowerCase(),
          purpose: "FORGOT_PASSWORD",
        },
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      Alert.alert(
        "Code Sent",
        "If an account with that email exists, a reset code has been sent.",
      );
      router.push({
        pathname: "/verifyEmail",
        params: {
          email: email.trim().toLowerCase(),
          purpose: "FORGOT_PASSWORD",
        },
      });
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
          {/* Back button */}
          <View className="ml-6 mt-6">
            <Pressable
              onPress={() => router.back()}
              className="w-12 h-12 bg-gray-100 rounded-2xl items-center justify-center"
            >
              <Ionicons name="arrow-back" size={22} color="#101828" />
            </Pressable>
          </View>

          <View className="flex-auto items-center justify-center mt-8">
            <LogoText />
            <View className="w-72 mt-7 items-center">
              <Text className="text-center text-primary text-4xl font-bold">
                Forgot Password
              </Text>
              <Text className="text-center text-gray-500 text-base mt-3 px-4">
                Enter the email address associated with your account and we'll
                send you a verification code.
              </Text>
            </View>
          </View>

          <View className="ml-10 mt-10">
            <Text className="text-gray-900 text-2xl font-normal pb-2">
              Email
            </Text>
            <AuthTextInput
              placeholder="Enter your email"
              value={email}
              onChangeText={(text: string) => setEmail(text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View className="ml-10 mt-5">
            <AuthButton onPress={handleSendCode} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center p-4">Send Code</Text>
              )}
            </AuthButton>
          </View>

          <View className="text-center justify-center items-center mt-7">
            <Text className="text-gray-500 text-xl font-normal">
              Remember your password?
            </Text>
            <Pressable
              onPress={() => router.replace("/(auth)/login")}
              className="mt-3"
            >
              <Text className="text-primary text-xl font-semibold">
                Back to Login
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPassword;
