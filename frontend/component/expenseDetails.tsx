import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Alert,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { expenseApi, Expense } from "../app/api/expenseApi";

interface ExpenseDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  expenseId: number;
  groupName: string;
  groupId: number;
  onExpenseDeleted?: () => void;
  onExpenseEdit?: () => void;
}

const ExpenseDetailsModal = ({
  visible,
  onClose,
  expenseId,
  groupName,
  groupId,
  onExpenseDeleted,
  onExpenseEdit,
}: ExpenseDetailsModalProps) => {
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && expenseId) {
      fetchExpenseDetails();
    }
  }, [visible, expenseId]);

  const fetchExpenseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await expenseApi.getExpenseById(expenseId);
      setExpense(data);
    } catch (err: any) {
      setError("Failed to load expense details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    onClose();
    if (onExpenseEdit) {
      onExpenseEdit();
    }
  }; 

  const handleDelete = () => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await expenseApi.deleteExpense(expenseId, groupId);
              console.log("Delete expense:", expenseId);
              Alert.alert("Success", "Expense deleted successfully");
              onClose();
              if (onExpenseDeleted) {
                onExpenseDeleted();
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete expense");
            }
          },
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50">
        <View className="bg-primary pt-14 pb-8 px-6">
          <View className="flex-row items-center mb-2">
            <Pressable
              onPress={onClose}
              className="w-14 h-14 bg-[#374151] rounded-3xl items-center justify-center"
            >
              <Ionicons name="close" size={24} color="white" />
            </Pressable>
            <View className="ml-4 flex-1">
              <Text className="text-white text-2xl font-semibold">
                Expense Details
              </Text>
              <Text className="text-[#CAD5E2] text-base mt-1">
                of group {groupName}
              </Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#101828" />
          </View>
        ) : error || !expense ? (
          <View className="flex-1 justify-center items-center px-4">
            <Text className="text-red-500 text-lg mb-4">{error}</Text>
            <Pressable
              onPress={onClose}
              className="bg-primary px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">Close</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 120 }}
            >
              <View className="bg-primary rounded-3xl p-8 mx-6 mt-6 shadow-lg">
                <Text className="text-[#CAD5E2] text-center text-xl mb-2">
                  Total Amount
                </Text>
                <View className="flex-row justify-center items-baseline">
                  <Text className="text-white text-3xl font-medium">NPR </Text>
                  <Text className="text-white text-6xl font-bold">
                    {expense.amount.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View className="mx-6 mt-6">
                <Text className="text-gray-500 text-lg mb-2">Description</Text>
                <View className="bg-white rounded-3xl p-6 shadow-sm">
                  <Text className="text-gray-900 text-2xl font-medium">
                    {expense.description}
                  </Text>
                </View>
              </View>

              <View className="mx-6 mt-6">
                <Text className="text-gray-500 text-lg mb-2">Category</Text>
                <View className="bg-white rounded-3xl p-6 shadow-sm">
                  <Text className="text-xl font-medium">
                    {expense.categoryName}
                  </Text>
                </View>
              </View>

              <View className="mx-6 mt-6">
                <Text className="text-gray-500 text-lg mb-2">Paid By</Text>
                <View className="bg-white rounded-3xl p-6 shadow-sm">
                  {expense.paidBy.map((payment, index) => (
                    <View
                      key={payment.id}
                      className={`flex-row justify-between items-center ${
                        index !== expense.paidBy.length - 1
                          ? "mb-4 pb-4 border-b border-gray-100"
                          : ""
                      }`}
                    >
                      <Text className="text-gray-900 text-xl font-medium">
                        {payment.paidByUserName}
                      </Text>
                      <Text className="text-gray-600 text-lg">
                        NPR {payment.amountPaid.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className="mx-6 mt-6">
                <Text className="text-gray-500 text-lg mb-2">
                  Split Method
                </Text>
                <View className="bg-white rounded-3xl p-6 shadow-sm">
                  <Text className="text-gray-900 text-xl">
                    {expense.splitMethod}
                  </Text>
                </View>
              </View>

              <View className="mx-6 mt-6">
                <Text className="text-gray-500 text-lg mb-2">
                  Split Between
                </Text>
                <View className="bg-white rounded-3xl p-6 shadow-sm">
                  <Text className="text-gray-900 text-xl">
                    members names
                  </Text>
                </View>
              </View>

              <View className="mx-6 mt-6">
                <Text className="text-gray-500 text-lg mb-2">Date</Text>
                <View className="bg-white rounded-3xl p-6 shadow-sm">
                  <Text className="text-gray-900 text-xl">
                    {new Date(expense.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                </View>
              </View>

              <View className="mx-6 mt-6">
                <Text className="text-gray-500 text-lg mb-2">Created By</Text>
                <View className="bg-white rounded-3xl p-6 shadow-sm">
                  <Text className="text-gray-900 text-xl">
                    {expense.createdByUsername}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 bg-white px-6 py-6 border-t border-gray-200 flex-row gap-4">
              <Pressable
                onPress={handleEdit}
                className="flex-1 bg-primary py-4 rounded-2xl flex-row items-center justify-center"
              >
                <Ionicons name="create-outline" size={24} color="white" />
                <Text className="text-white font-semibold text-lg ml-2">
                  Edit Expense
                </Text>
              </Pressable>

              <Pressable
                onPress={handleDelete}
                className="flex-1 bg-red-600 py-4 rounded-2xl flex-row items-center justify-center"
              >
                <Ionicons name="trash-outline" size={24} color="white" />
                <Text className="text-white font-semibold text-lg ml-2">
                  Delete
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};

export default ExpenseDetailsModal;
