import { View, Text, RefreshControl, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import ProfileCard from "../../component/profileCard";
import { userApi, CurrentUser } from "../api/userApi";
import { groupApi } from "../api/groupApi";
import { expenseApi } from "../api/expenseApi";

const More = () => {
  const [currentUserData, setCurrentUserData] = useState<CurrentUser | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [numberOfGroups, setNumberOfGroups] = useState(0);
  const [numberOfExpenses, setNumberOfExpenses] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userData, groupData, expenseCount] = await Promise.all([
        userApi.getCurrentUser(),
        groupApi.getNumberOfGroups(),
        expenseApi.getNumberOfExpenses(),
      ]);
      setCurrentUserData(userData);
      setNumberOfGroups(groupData);
      setNumberOfExpenses(expenseCount);
    } catch (err) {
      console.error("Unable to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#101828"
        />
      }
    >
      {!loading && currentUserData && (
        <ProfileCard
          fullName={currentUserData.fullName}
          email={currentUserData.email}
          phone={currentUserData.phone}
          groupCount={numberOfGroups}
          expenseCount={numberOfExpenses}
          userId={currentUserData.id} 
          onProfileUpdated={fetchData}
        />
      )}
    </ScrollView>
  );
};

export default More;
