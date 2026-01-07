import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Pressable,
} from "react-native";
import React from "react";
import LogoText from "../../component/LogoText";
import AuthTextInput from "../../component/authTextInput";
import AuthButton from "../../component/authButton";
import AuthSecondaryButton from "../../component/authSecondaryButton";

const login = () => {
  return (
    <View>
      <View className="flex-auto items-center justify-center">
        <LogoText />
        <View className="w-56 mt-7">
          <Text className="text-center text-primary text-4xl font-bold ">
            Sign In
          </Text>
        </View>
      </View>

      <View className="ml-10 mt-10">
        <Text className="text-gray-900 text-2xl font-normal pb-2">Email</Text>
        <AuthTextInput placeholder="Enter your email" />
      </View>

      <View className="ml-10 mt-5">
        <Text className="text-gray-900 text-2xl font-normal pb-2">
          Password
        </Text>
        <AuthTextInput placeholder="Enter your password" />
      </View>

      <View className="ml-10 mt-5">
        <AuthButton>
          <Text className="text-white text-center p-4">Login</Text>
        </AuthButton>
      </View>

      <View className="text-center justify-center items-center mt-7">
        <Text className="text-gray-500 text-xl font-normal">
          Don't have an account?
        </Text>

        <AuthSecondaryButton>
          <Text className="text-primary text-xl font-normal mt-2 text-center p-5">
            Sign Up
          </Text>
        </AuthSecondaryButton>

        <Text className="text-gray-500 text-xl font-normal mt-5">
          Forgot your password?
        </Text>

        <AuthSecondaryButton className="w-40">
          <Text className="text-primary text-xl font-normal mt-2 text-center p-5">
            Reset Password
          </Text>
        </AuthSecondaryButton>
      </View>
    </View>
  );
};

export default login;

const styles = StyleSheet.create({});
