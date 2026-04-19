import {
  Text,
  View,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Pressable,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import LogoText from "../../component/LogoText";
import AuthButton from "../../component/authButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { authApi } from "../api/authApi";
import { useRouter, useLocalSearchParams } from "expo-router";

const VerifyEmail = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    email: string;
    purpose: "SIGNUP" | "FORGOT_PASSWORD";
    signupData?: string;
  }>();

  const { email, purpose, signupData } = params;

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = (text: string, index: number) => {
    // Handle full paste of 6-digit code
    if (text.length === 6 && /^\d{6}$/.test(text)) {
      const digits = text.split("");
      setCode(digits);
      inputs.current[5]?.focus();
      return;
    }
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    if (digit && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace") {
      if (code[index]) {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      } else if (index > 0) {
        const newCode = [...code];
        newCode[index - 1] = "";
        setCode(newCode);
        inputs.current[index - 1]?.focus();
      }
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    try {
      setResending(true);
      await authApi.sendVerificationCode(
        email,
        purpose as "SIGNUP" | "FORGOT_PASSWORD",
      );
      setCountdown(60);
      setCode(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
      Alert.alert(
        "Code Sent",
        "A new verification code has been sent to your email.",
      );
    } catch {
      Alert.alert("Error", "Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      Alert.alert("Error", "Please enter the complete 6-digit code.");
      return;
    }

    try {
      setLoading(true);

      await authApi.verifyCode(
        email,
        fullCode,
        purpose as "SIGNUP" | "FORGOT_PASSWORD",
      );

      if (purpose === "SIGNUP") {
        if (!signupData) {
          Alert.alert("Error", "Signup data missing. Please try again.");
          return;
        }
        const userData = JSON.parse(signupData as string);
        await authApi.signUp(userData);
        Alert.alert("Success", "Account created successfully!", [
          { text: "OK", onPress: () => router.replace("/(auth)/login") },
        ]);
      } else if (purpose === "FORGOT_PASSWORD") {
        router.push({
          pathname: "/newPassword",
          params: { email, code: fullCode },
        });
      }
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 410) {
        Alert.alert(
          "Code Expired",
          "The verification code has expired. Please request a new one.",
        );
      } else if (status === 401) {
        Alert.alert(
          "Invalid Code",
          "The code you entered is incorrect. Please try again.",
        );
      } else if (status === 404) {
        Alert.alert(
          "No Code Found",
          "No active code found. Please request a new one.",
        );
      } else {
        Alert.alert("Error", "Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const maskedEmail = email
    ? email.replace(
        /^(.{2})([^@]*)(@.*)$/,
        (_, a, b, c) => a + "*".repeat(Math.min(b.length, 4)) + c,
      )
    : "";

  const title = purpose === "SIGNUP" ? "Verify Email" : "Reset Password";
  const subtitle =
    purpose === "SIGNUP"
      ? "Enter the code we sent to verify your email address."
      : "Enter the code we sent to reset your password.";

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
            <View className="w-72 mt-7 items-center">
              <Text className="text-center text-primary text-4xl font-bold">
                {title}
              </Text>
              <Text className="text-center text-gray-500 text-base mt-3 leading-6">
                {subtitle}
              </Text>
              <Text className="text-center text-primary font-semibold text-base mt-1">
                {maskedEmail}
              </Text>
            </View>
          </View>

          <View className="items-center mt-10 px-6">
            <View className="flex-row gap-3 justify-center">
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputs.current[index] = ref;
                  }}
                  style={{
                    width: 48,
                    height: 56,
                    borderWidth: 2,
                    borderRadius: 12,
                    borderColor: digit ? "#101828" : "#D1D5DB",
                    textAlign: "center",
                    fontSize: 24,
                    fontWeight: "700",
                    color: "#101828",
                    backgroundColor: digit ? "#F9FAFB" : "#FFFFFF",
                  }}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, index)
                  }
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus={index === 0}
                  selectTextOnFocus
                />
              ))}
            </View>
          </View>

          <View className="ml-10 mt-8">
            <AuthButton
              onPress={handleVerify}
              disabled={loading || code.join("").length !== 6}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center p-4 text-base font-semibold">
                  {purpose === "SIGNUP"
                    ? "Verify & Create Account"
                    : "Verify Code"}
                </Text>
              )}
            </AuthButton>
          </View>

          <View className="items-center mt-8 gap-2">
            <Text className="text-gray-500 text-base">
              Didn't receive the code?
            </Text>
            <Pressable
              onPress={handleResend}
              disabled={countdown > 0 || resending}
              className="py-2 px-4"
            >
              {resending ? (
                <ActivityIndicator color="#101828" size="small" />
              ) : (
                <Text
                  className={`text-base font-semibold ${
                    countdown > 0 ? "text-gray-400" : "text-primary"
                  }`}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                </Text>
              )}
            </Pressable>
          </View>

          <View className="items-center mt-2">
            <Pressable onPress={() => router.back()} className="py-2 px-4">
              <Text className="text-gray-400 text-base">← Go back</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VerifyEmail;
