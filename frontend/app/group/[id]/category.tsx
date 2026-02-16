import { View, Text, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import TotalExpenseCard from "../../../component/totalExpensesCard";
import { expenseApi } from "../../api/expenseApi";
import CommonTitle from "../../../component/commonTitleGroups";
import { useGroup } from "./groupContext";
import CreateCategoryModal from "../../../component/createCategory";

const Category = () => {
  const { group } = useGroup();
  const [totalExpense, setTotalExpense] = useState<number>();
  const [error, setError] = useState<string | null>(null);
  const [showCreateCategory, setShowCreateCategory] = useState(false);

  useEffect(() => {
    if (group?.id) {
      console.log("groupId:", group.id);
      fetchTotalExpense(Number(group.id));
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

  return (
    <View>
      <TotalExpenseCard
        totalExpense={totalExpense ?? 0}
        status={group.Status}
      />

      <View className="ml-6 flex-row justify-between items-center mt-3">
        <CommonTitle text="Categories" />
        <Pressable
          className="mr-6 bg-primary p-4 rounded-3xl flex-row justify-between items-center"
          onPress={() => setShowCreateCategory(true)}
        >
          <Ionicons name="add" color="white" size={20} />
          <Text className="text-white"> Add Category</Text>
        </Pressable>
      </View>

      <CreateCategoryModal
        visible={showCreateCategory}
        onClose={() => setShowCreateCategory(false)}
        groupId={group.id}
        onCategoryCreated={() => {
          console.log("Category created successfully");
        }}
      />
    </View>
  );
};

export default Category;
