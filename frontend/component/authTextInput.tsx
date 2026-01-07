import { View } from "react-native";
import React from "react";
import { TextInput } from "react-native";

const authTextInput = ({ ...props }) => {
  return (
    <>
      <TextInput
        className="mr-10 h-12 relative rounded-[10px] border-[1.74px] border-gray-900 "
        {...props}
      />
    </>
  );
};

export default authTextInput;
