import { View, Text, Pressable } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import ProfileModal from "./profileModal";

interface ProfileCardProps {
  fullName: string;
  email: string;
  phone: string;
  paymentAccountsCount?: number;
  groupCount?: number;
  expenseCount?: number;
  userId: number;
  onProfileUpdated?: () => void;
  onViewQR?: () => void;
}

const ProfileCard = ({
  fullName,
  email,
  phone,
  paymentAccountsCount = 0,
  groupCount = 0,
  expenseCount = 0,
  userId,
  onProfileUpdated,
  onViewQR,
}: ProfileCardProps) => {
  const [showProfile, setShowProfile] = useState(false);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <>
      <Pressable
        onPress={() => setShowProfile(true)}
        className="bg-primary rounded-3xl p-5 mx-4 shadow-lg mt-56 active:opacity-80"
      >
        <View className="flex-row items-center">
          <View className="w-14 h-14 rounded-full bg-[#2E4057] items-center justify-center mr-3">
            <Text className="text-[#A8BCCF] text-lg font-bold tracking-wide">
              {getInitials(fullName)}
            </Text>
          </View>

          <View className="flex-1">
            <Text className="text-white text-lg font-bold mb-0.5">
              {fullName}
            </Text>
            <Text className="text-[#8FA8BE] text-sm">{email}</Text>
            <Text className="text-[#8FA8BE] text-sm">{phone}</Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color="#8FA8BE" />
        </View>

        <View className="h-px bg-[#2E4057] my-3" />

        <View className="flex-row items-center">
          <Ionicons name="qr-code-outline" size={28} color="#8FA8BE" />

          <Text className="text-[#C5D4E0] text-sm flex-1 text-center leading-5">
            {paymentAccountsCount} payment account
            {paymentAccountsCount !== 1 ? "s" : ""}
            {"\n"}linked
          </Text>

          <Pressable onPress={onViewQR} className="flex-row items-center gap-1">
            <Text className="text-[#8FA8BE] text-sm font-semibold">
              View QR
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#8FA8BE" />
          </Pressable>
        </View>
      </Pressable>

      <ProfileModal
        visible={showProfile}
        onClose={() => setShowProfile(false)}
        fullName={fullName}
        email={email}
        phone={phone}
        groupCount={groupCount}
        expenseCount={expenseCount}
        userId={userId}
        onProfileUpdated={onProfileUpdated}
      />
    </>
  );
};

export default ProfileCard;
