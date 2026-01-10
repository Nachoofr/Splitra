import {
  Text,
  View,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState } from "react";
import LogoText from "../../component/LogoText";
import AuthTextInput from "../../component/authTextInput";
import AuthButton from "../../component/authButton";
import AuthSecondaryButton from "../../component/authSecondaryButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { authApi } from "../api/authApi";
import { useRouter } from "expo-router";

const SignUp = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    // Validation
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.password
    ) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      console.log("Attempting signup with:", { ...formData, password: "***" });

      const response = await authApi.signUp({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      console.log("Signup successful:", response);

      Alert.alert("Success", "Account created successfully!", [
        {
          text: "OK",
          onPress: () => router.replace("/(auth)/login"),
        },
      ]);
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMessage =
        error.response?.data?.message || "Sign up failed. Please try again.";
      Alert.alert("Error", errorMessage);
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
          <View className="flex-auto items-center justify-center mt-5">
            <LogoText />
            <View className="w-56 mt-3">
              <Text className="text-center text-primary text-4xl font-bold">
                Sign Up
              </Text>
            </View>
          </View>
          <View className="ml-10 mt-5">
            <Text className="text-gray-900 text-2xl font-normal pb-2">
              Name
            </Text>
            <AuthTextInput
              placeholder="Enter your name"
              value={formData.fullName}
              onChangeText={(text: string) =>
                setFormData({ ...formData, fullName: text })
              }
            />
          </View>
          <View className="ml-10 mt-5">
            <Text className="text-gray-900 text-2xl font-normal pb-2">
              Email
            </Text>
            <AuthTextInput
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(text: string) =>
                setFormData({ ...formData, email: text })
              }
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View className="ml-10 mt-5">
            <Text className="text-gray-900 text-2xl font-normal pb-2">
              Phone Number
            </Text>
            <AuthTextInput
              placeholder="Enter your phone number"
              value={formData.phone}
              onChangeText={(text: string) =>
                setFormData({ ...formData, phone: text })
              }
              keyboardType="phone-pad"
            />
          </View>
          <View className="ml-10 mt-5">
            <Text className="text-gray-900 text-2xl font-normal pb-2">
              Password
            </Text>
            <AuthTextInput
              placeholder="Enter your password"
              secureTextEntry
              value={formData.password}
              onChangeText={(text: string) =>
                setFormData({ ...formData, password: text })
              }
            />
          </View>
          <View className="ml-10 mt-5">
            <Text className="text-gray-900 text-2xl font-normal pb-2">
              Re-Enter Password
            </Text>
            <AuthTextInput
              placeholder="Re-enter your password"
              secureTextEntry
              value={formData.confirmPassword}
              onChangeText={(text: string) =>
                setFormData({ ...formData, confirmPassword: text })
              }
            />
          </View>
          <View className="ml-10 mt-5">
            <AuthButton onPress={handleSignUp} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center p-4">Sign Up</Text>
              )}
            </AuthButton>
          </View>
          <View className="text-center justify-center items-center mt-5">
            <Text className="text-gray-500 text-xl font-normal">
              Already have an account?
            </Text>
            <AuthSecondaryButton href="/login">
              <Text className="text-primary text-xl font-normal mt-2 text-center p-5">
                Log In
              </Text>
            </AuthSecondaryButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;
