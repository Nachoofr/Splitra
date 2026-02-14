import { ActivityIndicator, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { expenseApi } from "../../api/expenseApi";
import { useGroup } from "./groupContext";
import TotalExpenseCard from "../../../component/totalExpensesCard";
import CommonTitleGroups from "../../../component/commonTitleGroups";

const Home = () => {
  const { group } = useGroup();
  const [error, setError] = useState<string | null>(null);
  const [totalExpense, setTotalExpense] = useState<number>();
  const [allExpenses, setAllExpenses] = useState<any>();

  useEffect(() => {
    if (group?.id) {
      console.log("gorupIdusinglocalsearch:", group.id);
      fetchTotalExpense(Number(group.id));
      fetchAllExpenses(Number(group.id));
    }
  }, [group.id]);

  const fetchTotalExpense = async (groupId: number) => {
    try {
      setError(null);
      const data = await expenseApi.getTotalExpenseByGroup(groupId);
      setTotalExpense(data);
    } catch (err: any) {
      setError("Failed to load total expense");
      console.error(err);
    }
  };

  const fetchAllExpenses = async (groupId: number) => {
    try {
      setError(null);
      const data = await expenseApi.getAllExpenses(groupId);
      setAllExpenses(data);
    } catch (err: any) {
      setError("Failed to load expenses");
      console.error(err);
    }
  };

  return (
    <View>
      <TotalExpenseCard
        totalExpense={totalExpense ?? 0}
        status={group.Status}
      />
      <View>
        <View className="ml-6">
          <CommonTitleGroups text="Expenses" />
        </View>
        <View className="bg-white w-auto rounded-3xl p-6 shadow-sm mx-6">
          <View className="flex-col">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl">Hotel Booking</Text>
              <Text className="text-xl font-bold">NPR 900.00</Text>
            </View>
            <View className="flex-row items-center justify-between mt-5">
              <Text>Category</Text>
              <Text className=" text-gray-500">Nacho, jeboika</Text>
              <Text className=" text-gray-500">Date</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Home;
