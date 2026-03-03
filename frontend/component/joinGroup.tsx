import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { groupApi } from "../app/api/groupApi";

type JoinGroupProps = {
  visible: boolean;
  onClose: () => void;
  onJoined: () => void;
};

const JoinGroupModal = ({ visible, onClose, onJoined }: JoinGroupProps) => {
  const [joinToken, setJoinToken] = useState("");
  const [joining, setJoining] = useState(false);

  const handleJoinGroup = async () => {
    if (!joinToken.trim()) {
      Alert.alert("Error", "Please enter an invite code");
      return;
    }

    try {
      setJoining(true);
      const group = await groupApi.joinGroup(joinToken.trim());
      Alert.alert("Success", `You joined "${group.groupName}"!`);
      setJoinToken("");
      onClose();
      onJoined();
    } catch {
      Alert.alert("Error", "Invalid invite code. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-black/40 justify-end">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
          >
            <View className="bg-white rounded-t-3xl px-6 pt-5 pb-10">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-xl font-semibold text-gray-900">
                  Join a Group
                </Text>
                <Pressable onPress={onClose}>
                  <Ionicons name="close" size={26} color="#667085" />
                </Pressable>
              </View>

              <Text className="text-gray-500 mb-2">
                Enter the invite code shared with you
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 mb-5 text-gray-900"
                placeholder="Paste invite code here"
                value={joinToken}
                onChangeText={setJoinToken}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable
                className="bg-primary py-4 rounded-2xl items-center"
                onPress={handleJoinGroup}
                disabled={joining}
              >
                {joining ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-lg">
                    Join Group
                  </Text>
                )}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default JoinGroupModal;
