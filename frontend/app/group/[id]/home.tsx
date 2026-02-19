import {
  Text,
  View,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Expense, expenseApi } from "../../api/expenseApi";
import { useGroup } from "./groupContext";
import TotalExpenseCard from "../../../component/totalExpensesCard";
import CommonTitleGroups from "../../../component/commonTitleGroups";
import ExpenseDetailsModal from "../../../component/expenseDetails";
import AddExpenseModal from "../../../component/addExpense";

const Home = () => {
  const { group } = useGroup();
  const [error, setError] = useState<string | null>(null);
  const [totalExpense, setTotalExpense] = useState<number>();
  const [refreshing, setRefreshing] = useState(false);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [showExpenseDetails, setShowExpenseDetails] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(
    null,
  );
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return { date: formattedDate, time: formattedTime };
  };

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
      setAllExpenses(
        data.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
      );
    } catch (err: any) {
      setError("Failed to load expenses");
      console.error(err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTotalExpense(Number(group.id));
    await fetchAllExpenses(Number(group.id));
    setRefreshing(false);
  };

  return (
    <View className="flex-1">
      <TotalExpenseCard
        totalExpense={totalExpense ?? 0}
        status={group.Status}
      />

      <View className="ml-6">
        <CommonTitleGroups text="Expenses" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#101828"
          />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {allExpenses.map((expense) => {
          const { date, time } = formatDate(expense.date);
          const paidByNames = expense.paidBy
            .map((payment) => payment.paidByUserName)
            .join(", ");
          return (
            <Pressable
              key={expense.id}
              className="bg-white w-auto rounded-3xl p-6 shadow-sm mx-6 mb-3"
              onPress={() => {
                setSelectedExpenseId(expense.id);
                setShowExpenseDetails(true);
              }}
            >
              <View className="flex-col">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xl">{expense.description}</Text>
                  <Text className="text-xl font-bold">
                    NPR {expense.amount}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between mt-5">
                  <Text>{expense.categoryName}</Text>
                  <Text className="text-gray-500">{paidByNames}</Text>
                  <View>
                    <Text className="text-gray-500">{date}</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      {selectedExpenseId && (
        <ExpenseDetailsModal
          visible={showExpenseDetails}
          onClose={() => {
            setShowExpenseDetails(false);
            setSelectedExpenseId(null);
          }}
          expenseId={selectedExpenseId}
          groupName={group.groupName}
          groupId={Number(group.id)}
          onExpenseDeleted={() => {
            fetchAllExpenses(Number(group.id));
            fetchTotalExpense(Number(group.id));
          }}
          onExpenseEdit={() => {
            const expense = allExpenses.find((e) => e.id === selectedExpenseId);
            if (expense) {
              setExpenseToEdit(expense);
              setEditMode(true);
              setShowAddExpense(true);
            }
          }}
        />
      )}

      <AddExpenseModal
        visible={showAddExpense}
        onClose={() => {
          setShowAddExpense(false);
          setEditMode(false);
          setExpenseToEdit(null);
        }}
        groupId={group.id.toString()}
        groupName={group.groupName}
        editMode={editMode}
        expenseToEdit={expenseToEdit || undefined}
        onExpenseAdded={() => {
          fetchAllExpenses(Number(group.id));
          fetchTotalExpense(Number(group.id));
        }}
      />
    </View>
  );
};

export default Home;
