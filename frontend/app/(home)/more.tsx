import { View, Text } from "react-native";
import React, { useState, useEffect } from "react";
import CommonTitle from "../../component/commonTitle";
import ProfileCard from "../../component/profileCard";
import { userApi, CurrentUser } from "../api/userApi";

const More = () => {
  const [currentUserData, setCurrentUserData] = useState<CurrentUser | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUserData();
  }, []);

  const fetchCurrentUserData = async () => {
    try {
      setLoading(true);
      const data = await userApi.getCurrentUser();
      setCurrentUserData(data);
    } catch (err) {
      console.error("Unable to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {!loading && currentUserData && (
        <ProfileCard
          fullName={currentUserData.fullName}
          email={currentUserData.email}
          phone={currentUserData.phone}
        />
      )}
    </View>
  );
};

export default More;
