import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import GroupHeader from "../../../component/groupHeader";

const Home = () => {
  const { id } = useLocalSearchParams();
  return (
    <View>
    
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({});
