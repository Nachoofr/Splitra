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
import AuthSecondaryButton from "../../component/authSecondaryButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { authApi } from "../api/authApi";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!formData.password && !formData.email) {
      Alert.alert("Please enter your email and password");
      return;
    }

    if (!formData.email) {
      Alert.alert("Please enter your email");
      return;
    }

    if (!formData.password) {
      Alert.alert("Please enter your password");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      console.log("Attempting login with:", { ...formData, password: "***" });

      const response = await authApi.signIn({
        email: formData.email,
        password: formData.password,
      });

      console.log("Login successful:", response);

      await AsyncStorage.setItem("token", response);

      Alert.alert("Success", "Logged in successfully!", [
        {
          text: "OK",
          onPress: () => {
            router.replace("/(home)/groups");
          },
        },
      ]);
    } catch (error: any) {
      console.error("Login error:", error);

      let errorMessage = "Error signing in. Please try again.";

      if (error.response) {
        const status = error.response.status;

        if (status >= 400 && status < 500) {
          errorMessage = "Email or password is invalid";
        } else if (status >= 500) {
          errorMessage = "Error signing in. Please try again.";
        }
      }

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
          <View className="flex-auto items-center justify-center mt-10">
            <LogoText />
            <View className="w-56 mt-7">
              <Text className="text-center text-primary text-4xl font-bold">
                Sign In
              </Text>
            </View>
          </View>

          <View className="ml-10 mt-10">
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
              autoCorrect={false}
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
            <AuthButton onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center p-4">Login</Text>
              )}
            </AuthButton>
          </View>

          <View className="text-center justify-center items-center mt-7">
            <Text className="text-gray-500 text-xl font-normal">
              Don't have an account?
            </Text>

            <AuthSecondaryButton href="/signup">
              <Text className="text-primary text-xl font-normal mt-2 text-center p-5">
                Sign Up
              </Text>
            </AuthSecondaryButton>

            <Text className="text-gray-500 text-xl font-normal mt-5">
              Forgot your password?
            </Text>

            <AuthSecondaryButton href="/reset-password" className="w-40">
              <Text className="text-primary text-xl font-normal mt-2 text-center p-5">
                Reset Password
              </Text>
            </AuthSecondaryButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;
