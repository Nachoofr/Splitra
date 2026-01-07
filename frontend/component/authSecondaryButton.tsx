import { View, Text, Pressable } from "react-native";
import React from "react";
import { Link } from "expo-router";

const authSecondaryButton = ({ className = "", ...props }) => {
  return (
    <>
      <Link
        href="/signup"
        className={
          `w-32 h-14 relative bg-white rounded-[10px] border-[1.74px] border-gray-900 mt-3 ${className}`
        }
        {...props}
      ></Link>
    </>
  );
};

export default authSecondaryButton;
