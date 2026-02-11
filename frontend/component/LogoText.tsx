import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";
import Logo from "../assets/img/logo.png";

const LogoText = ({ ...props }) => {
  return (
    <View className="w-44 h-40 flex-row items-center justify-center">
      <Image
        className="w-14 h-100 relative pr-5"
        resizeMode="contain"
        source={Logo}
        style={{ width: 100, height: 100 }}
      />
      <View className="w-24 h-11 ">
        <View className="left-0 top-0 absolute">
          <View className="relative">
            <Text className="left-0 top-[-1.13px] absolute text-primary text-4xl font-bold">
              Splitra
            </Text>
          </View>
          <View className="left-0 top-[27.31px] absolute">
            <Text className="left-0 top-[0.87px] absolute text-gray-600 text-s mt-1">
              Scan. Split. Settle.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default LogoText;

const styles = StyleSheet.create({});
