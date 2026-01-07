import { StyleSheet, Text, View } from "react-native";
import React from "react";
import "./global.css";
import Login from "./(auth)/login";

const home = () => {
  return (
    <View>
      <Login />
    </View>
  );
};

export default home;
