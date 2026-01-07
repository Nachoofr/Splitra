import { View, Text } from "react-native";
import React from "react";
import { Pressable } from "react-native";

const authButton = ({ className = "", ...props }) => {
  return (
    <>
      <Pressable
        className={`mr-10 h-14 relative rounded-[10px] border-[1.74px] bg-primary ${className}`}
        {...props}
      ></Pressable>
    </>
  );
};

export default authButton;
