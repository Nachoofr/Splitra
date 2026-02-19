import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { groupApi, GroupMember } from "../app/api/groupApi";
import {
  expenseApi,
  ExpensePaymentRequest,
  Expense,
} from "../app/api/expenseApi";
import { categoryApi, Category } from "../app/api/categoryApi";

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  onExpenseAdded?: () => void;
  editMode?: boolean;
  expenseToEdit?: Expense;
}

interface PayerAmount {
  name: string;
  amount: string;
}

const CATEGORY_EMOJIS: { [key: string]: string } = {
  Food: "🍽️",
  Drinks: "🍹",
  Transportation: "🚗",
  Entertainment: "🎬",
  Utilities: "💡",
  Healthcare: "🏥",
  Shopping: "🛍️",
  Travel: "✈️",
  Education: "📚",
  Housing: "🏠",
  Other: "📦",
};

const AddExpense = ({
  visible,
  onClose,
  groupId,
  groupName,
  onExpenseAdded,
  editMode = false,
  expenseToEdit,
}: AddExpenseModalProps) => {
  const [expenseData, setExpenseData] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: 0,
    splitMethod: "EQUALLY",
  });
  const [selectedPayers, setSelectedPayers] = useState<PayerAmount[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [splitMembers, setSplitMembers] = useState<number[]>([]);

  const toggleSplitMember = (memberId: number) => {
    if (splitMembers.includes(memberId)) {
      setSplitMembers(splitMembers.filter((id) => id !== memberId));
    } else {
      setSplitMembers([...splitMembers, memberId]);
    }
  };

  useEffect(() => {
    if (visible && groupId) {
      fetchGroupMembers();
      fetchCategories();
    }
  }, [visible, groupId]);

  useEffect(() => {
    if (visible && editMode && expenseToEdit && groupMembers.length > 0) {
      loadExpenseData();
    }
  }, [visible, editMode, expenseToEdit, groupMembers]);

  const loadExpenseData = () => {
    if (!expenseToEdit) return;

    setExpenseData({
      description: expenseToEdit.description,
      amount: expenseToEdit.amount.toString(),
      date: new Date(expenseToEdit.date).toISOString().split("T")[0],
      category: expenseToEdit.category || 0,
      splitMethod: expenseToEdit.splitMethod || "EQUALLY",
    });

    const payersWithAmounts: PayerAmount[] = expenseToEdit.paidBy.map(
      (payment) => {
        const member = groupMembers.find((m) => m.id === payment.paidByUserId);
        return {
          name: member?.name || payment.paidByUserName,
          amount: payment.amountPaid.toString(),
        };
      },
    );
    setSelectedPayers(payersWithAmounts);
  };

  const fetchGroupMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const members = await groupApi.getGroupMembers(Number(groupId));
      setGroupMembers(members);
    } catch (error) {
      console.error("Error fetching group members:", error);
      Alert.alert("Error", "Failed to load group members. Please try again.");
      setGroupMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const categories = await categoryApi.getCategoriesByGroupId(
        Number(groupId),
      );

      setCategories(categories);

      if (categories.length > 0 && expenseData.category === 0) {
        setExpenseData((prev) => ({
          ...prev,
          category: categories[0].id,
        }));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      Alert.alert("Error", "Failed to load categories.");
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const togglePayer = (memberName: string) => {
    const existingPayer = selectedPayers.find((p) => p.name === memberName);

    if (existingPayer) {
      setSelectedPayers(selectedPayers.filter((p) => p.name !== memberName));
    } else {
      setSelectedPayers([...selectedPayers, { name: memberName, amount: "" }]);
    }
  };

  const updatePayerAmount = (memberName: string, amount: string) => {
    setSelectedPayers(
      selectedPayers.map((p) => (p.name === memberName ? { ...p, amount } : p)),
    );
  };

  const handlePayerAmountBlur = (memberName: string) => {
    if (!expenseData.amount) return;

    const currentPayers = selectedPayers;
    const payersWithAmount = currentPayers.filter(
      (p) => p.amount !== "" && p.amount !== "0",
    );

    const isSecondToLast = payersWithAmount.length === currentPayers.length - 1;

    if (isSecondToLast) {
      const totalExpense = parseFloat(expenseData.amount);
      const totalPaid = currentPayers.reduce((sum, p) => {
        if (p.amount !== "" && p.amount !== "0") {
          return sum + parseFloat(p.amount);
        }
        return sum;
      }, 0);

      const remainingAmount = totalExpense - totalPaid;

      if (remainingAmount >= 0) {
        setSelectedPayers(
          currentPayers.map((p) => {
            if (p.amount === "" || p.amount === "0") {
              return { ...p, amount: remainingAmount.toFixed(2) };
            }
            return p;
          }),
        );
      }
    }
  };

  const resetForm = () => {
    setExpenseData({
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      category: categories.length > 0 ? categories[0].id : 0,
      splitMethod: "EQUALLY",
    });
    setSelectedPayers([]);
    setSplitMembers([]);
    setShowCategoryDropdown(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateExpense = (): boolean => {
    if (!expenseData.description.trim()) {
      Alert.alert("Error", "Please enter a description");
      return false;
    }
    if (!expenseData.amount || parseFloat(expenseData.amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return false;
    }
    if (!expenseData.category) {
      Alert.alert("Error", "Please select a category");
      return false;
    }
    if (selectedPayers.length === 0) {
      Alert.alert("Error", "Please select at least one person who paid");
      return false;
    }

    for (const payer of selectedPayers) {
      if (!payer.amount || parseFloat(payer.amount) <= 0) {
        Alert.alert("Error", `Please enter a valid amount for ${payer.name}`);
        return false;
      }
    }

    if (expenseData.splitMethod === "EQUALLY" && splitMembers.length < 2) {
      Alert.alert("Error", "Please select at least 2 members to split with");
      return false;
    }

    const totalPaid = selectedPayers.reduce(
      (sum, p) => sum + parseFloat(p.amount || "0"),
      0,
    );
    const expenseAmount = parseFloat(expenseData.amount);

    if (Math.abs(totalPaid - expenseAmount) > 0.01) {
      Alert.alert(
        "Error",
        `Total amount paid (${totalPaid.toFixed(
          2,
        )}) must equal expense amount (${expenseAmount.toFixed(2)})`,
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateExpense()) return;

    try {
      setIsSubmitting(true);

      const paidByData: ExpensePaymentRequest[] = selectedPayers.map(
        (payer) => {
          const member = groupMembers.find((m) => m.name === payer.name);
          if (!member) {
            throw new Error(`Member ${payer.name} not found`);
          }
          return {
            paidByUserId: member.id,
            amountPaid: parseFloat(payer.amount),
          };
        },
      );

      const requestData = {
        description: expenseData.description,
        amount: parseFloat(expenseData.amount),
        date: expenseData.date,
        category: expenseData.category,
        splitMethod: expenseData.splitMethod,
        paidBy: paidByData,
        splitRequest: {
          equalSplitId: splitMembers,
        },
      };


      if (editMode && expenseToEdit) {
        await expenseApi.updateExpense(
          expenseToEdit.id,
          Number(groupId),
          requestData,
        );
        Alert.alert("Success", "Expense updated successfully!");
      } else {
        await expenseApi.addExpense(requestData, Number(groupId));
        Alert.alert("Success", "Expense added successfully!");
      }

      handleClose();
      if (onExpenseAdded) {
        onExpenseAdded();
      }
    } catch (error: any) {
      console.error("Error saving expense:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          `Failed to ${editMode ? "update" : "add"} expense`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find(
    (c) => c.id === expenseData.category,
  );
  const selectedCategoryEmoji = selectedCategory
    ? CATEGORY_EMOJIS[selectedCategory.name] || "📦"
    : "📦";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 bg-primary">
          <View className="bg-primary pt-14 pb-6 px-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Pressable
                  onPress={handleClose}
                  className="w-14 h-14 bg-[#374151] rounded-3xl items-center justify-center"
                >
                  <Ionicons name="close" size={24} color="white" />
                </Pressable>
                <View className="ml-6 flex-1">
                  <Text className="text-white text-3xl font-semibold">
                    {editMode ? "Edit Expense" : "Add Expense"}
                  </Text>
                  <Text className="text-[#CAD5E2] text-lg mt-1">
                    to {groupName}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <ScrollView
            className="flex-1 bg-gray-50"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="bg-white rounded-3xl p-6 mx-6 mt-6 shadow-sm">
              <Text className="text-2xl font-bold text-gray-900 mb-6">
                Expense Details
              </Text>

              <Text className="text-base font-medium text-gray-700 mb-2">
                Description *
              </Text>
              <TextInput
                className="bg-gray-50 rounded-2xl px-4 py-4 mb-4 text-gray-900"
                placeholder="e.g., Dinner at restaurant"
                placeholderTextColor="#9CA3AF"
                value={expenseData.description}
                onChangeText={(text) =>
                  setExpenseData({ ...expenseData, description: text })
                }
              />

              <View className="flex-row gap-4 mb-4">
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-700 mb-2">
                    Amount (NPR) *
                  </Text>
                  <TextInput
                    className="bg-gray-50 rounded-2xl px-4 py-4 text-gray-900"
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad"
                    value={expenseData.amount}
                    onChangeText={(text) =>
                      setExpenseData({ ...expenseData, amount: text })
                    }
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-700 mb-2">
                    Date *
                  </Text>
                  <TextInput
                    className="bg-gray-50 rounded-2xl px-4 py-4 text-gray-900"
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                    value={expenseData.date}
                    onChangeText={(text) =>
                      setExpenseData({ ...expenseData, date: text })
                    }
                  />
                </View>
              </View>

              <Text className="text-base font-medium text-gray-700 mb-2">
                Category *
              </Text>
              {isLoadingCategories ? (
                <View className="bg-gray-50 rounded-2xl px-4 py-4">
                  <ActivityIndicator size="small" color="#1F2937" />
                </View>
              ) : (
                <>
                  <Pressable
                    onPress={() =>
                      setShowCategoryDropdown(!showCategoryDropdown)
                    }
                    className="bg-gray-50 rounded-2xl px-4 py-4 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center">
                      <Text className="text-2xl mr-2">
                        {selectedCategoryEmoji}
                      </Text>
                      <Text className="text-gray-900 text-base">
                        {selectedCategory?.name || "Select Category"}
                      </Text>
                    </View>
                    <Ionicons
                      name={
                        showCategoryDropdown ? "chevron-up" : "chevron-down"
                      }
                      size={20}
                      color="#6B7280"
                    />
                  </Pressable>

                  {showCategoryDropdown && (
                    <View className="mt-2 bg-gray-50 rounded-2xl overflow-hidden">
                      {categories.map((category) => (
                        <Pressable
                          key={category.id}
                          onPress={() => {
                            setExpenseData({
                              ...expenseData,
                              category: category.id,
                            });
                            setShowCategoryDropdown(false);
                          }}
                          className={`px-4 py-3 flex-row items-center ${
                            category.id === expenseData.category
                              ? "bg-primary"
                              : "bg-white"
                          } border-b border-gray-100`}
                        >
                          <Text className="text-xl mr-3">
                            {CATEGORY_EMOJIS[category.name] || "📦"}
                          </Text>
                          <Text
                            className={`text-base ${
                              category.id === expenseData.category
                                ? "text-white font-semibold"
                                : "text-gray-900"
                            }`}
                          >
                            {category.name}
                            {!category.isGlobal && (
                              <Text className="text-xs"> (Custom)</Text>
                            )}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>

            <View className="bg-white rounded-3xl p-6 mx-6 mt-4 shadow-sm">
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                Split Method
              </Text>
              <Text className="text-gray-500 text-base mb-4">
                How should this be split?
              </Text>

              <View className="gap-3">
                <Pressable
                  onPress={() =>
                    setExpenseData({ ...expenseData, splitMethod: "EQUALLY" })
                  }
                  className={`px-6 py-4 rounded-2xl ${
                    expenseData.splitMethod === "EQUALLY"
                      ? "bg-primary"
                      : "bg-white border-2 border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-lg font-medium text-center ${
                      expenseData.splitMethod === "EQUALLY"
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    Split Equally
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    setExpenseData({ ...expenseData, splitMethod: "ITEMWISE" })
                  }
                  className={`px-6 py-4 rounded-2xl ${
                    expenseData.splitMethod === "ITEMWISE"
                      ? "bg-primary"
                      : "bg-white border-2 border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-lg font-medium text-center ${
                      expenseData.splitMethod === "ITEMWISE"
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    Split by Amount
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    setExpenseData({
                      ...expenseData,
                      splitMethod: "PERCENTWISE",
                    })
                  }
                  className={`px-6 py-4 rounded-2xl ${
                    expenseData.splitMethod === "PERCENTWISE"
                      ? "bg-primary"
                      : "bg-white border-2 border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-lg font-medium text-center ${
                      expenseData.splitMethod === "PERCENTWISE"
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    Split by Percentage
                  </Text>
                </Pressable>
              </View>
            </View>

            {expenseData.splitMethod === "EQUALLY" && (
              <View className="bg-white rounded-3xl p-6 mx-6 mt-4 shadow-sm">
                <Text className="text-2xl font-bold text-gray-900 mb-2">
                  Split With
                </Text>
                <Text className="text-gray-500 text-base mb-4">
                  Select at least 2 members to split with
                </Text>

                {isLoadingMembers ? (
                  <View className="py-8 items-center">
                    <ActivityIndicator size="large" color="#1F2937" />
                    <Text className="text-gray-500 mt-2">
                      Loading members...
                    </Text>
                  </View>
                ) : groupMembers.length === 0 ? (
                  <View className="py-8 items-center">
                    <Text className="text-gray-500">
                      No members found in this group
                    </Text>
                  </View>
                ) : (
                  <View className="gap-3">
                    {groupMembers.map((member) => {
                      const isSelected = splitMembers.includes(member.id);

                      return (
                        <Pressable
                          key={member.id}
                          onPress={() => toggleSplitMember(member.id)}
                          className={`px-6 py-4 rounded-2xl border-2 flex-row items-center justify-between ${
                            isSelected
                              ? "bg-primary border-primary"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <View className="flex-row items-center gap-3">
                            <View
                              className={`w-10 h-10 rounded-full items-center justify-center ${
                                isSelected ? "bg-white/20" : "bg-gray-100"
                              }`}
                            >
                              <Text
                                className={`text-base font-bold ${
                                  isSelected ? "text-white" : "text-gray-600"
                                }`}
                              >
                                {member.name.charAt(0).toUpperCase()}
                              </Text>
                            </View>
                            <Text
                              className={`text-lg font-medium ${
                                isSelected ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {member.name}
                            </Text>
                          </View>

                          {isSelected ? (
                            <Ionicons
                              name="checkmark-circle"
                              size={24}
                              color="white"
                            />
                          ) : (
                            <Ionicons
                              name="ellipse-outline"
                              size={24}
                              color="#9CA3AF"
                            />
                          )}
                        </Pressable>
                      );
                    })}

                    {/* Select All / Deselect All */}
                    <Pressable
                      onPress={() => {
                        if (splitMembers.length === groupMembers.length) {
                          setSplitMembers([]);
                        } else {
                          setSplitMembers(groupMembers.map((m) => m.id));
                        }
                      }}
                      className="mt-2 py-3 rounded-2xl border-2 border-primary items-center"
                    >
                      <Text className="text-primary font-semibold text-base">
                        {splitMembers.length === groupMembers.length
                          ? "Deselect All"
                          : "Select All"}
                      </Text>
                    </Pressable>

                    {/* Counter */}
                    {splitMembers.length > 0 && (
                      <View className="mt-2 p-4 bg-gray-50 rounded-2xl">
                        <Text className="text-sm font-medium text-gray-700">
                          Selected:{" "}
                          <Text className="text-primary">
                            {splitMembers.length} member
                            {splitMembers.length > 1 ? "s" : ""}
                          </Text>
                        </Text>
                        {splitMembers.length === 1 && (
                          <Text className="text-xs text-red-400 mt-1">
                            ⚠️ Select at least 1 more member
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}

            <View className="bg-white rounded-3xl p-6 mx-6 mt-4 shadow-sm">
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                Who Paid?
              </Text>
              <Text className="text-gray-500 text-base mb-4">
                Select one or more people and enter amounts
              </Text>

              {isLoadingMembers ? (
                <View className="py-8 items-center">
                  <ActivityIndicator size="large" color="#1F2937" />
                  <Text className="text-gray-500 mt-2">Loading members...</Text>
                </View>
              ) : groupMembers.length === 0 ? (
                <View className="py-8 items-center">
                  <Text className="text-gray-500">
                    No members found in this group
                  </Text>
                </View>
              ) : (
                <View className="gap-3">
                  {groupMembers.map((member) => {
                    const payer = selectedPayers.find(
                      (p) => p.name === member.name,
                    );
                    const isSelected = !!payer;

                    return (
                      <View key={member.id}>
                        <Pressable
                          onPress={() => togglePayer(member.name)}
                          className={`px-6 py-4 rounded-2xl border-2 flex-row items-center justify-between ${
                            isSelected
                              ? "bg-primary border-primary"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <View className="flex-row items-center gap-3">
                            <View
                              className={`w-10 h-10 rounded-full items-center justify-center ${
                                isSelected ? "bg-white/20" : "bg-gray-100"
                              }`}
                            >
                              <Text
                                className={`text-base font-bold ${
                                  isSelected ? "text-white" : "text-gray-600"
                                }`}
                              >
                                {member.name.charAt(0).toUpperCase()}
                              </Text>
                            </View>
                            <Text
                              className={`text-lg font-medium ${
                                isSelected ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {member.name}
                            </Text>
                          </View>

                          {isSelected ? (
                            <Ionicons
                              name="checkmark-circle"
                              size={24}
                              color="white"
                            />
                          ) : (
                            <Ionicons
                              name="ellipse-outline"
                              size={24}
                              color="#9CA3AF"
                            />
                          )}
                        </Pressable>

                        {isSelected && (
                          <View className="mt-2 pl-4">
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                              Amount paid by {member.name}
                            </Text>
                            <TextInput
                              className="bg-gray-50 rounded-2xl px-4 py-3 text-gray-900 border border-gray-200"
                              placeholder="0.00"
                              placeholderTextColor="#9CA3AF"
                              keyboardType="decimal-pad"
                              value={payer.amount}
                              onChangeText={(text) =>
                                updatePayerAmount(member.name, text)
                              }
                              onBlur={() => handlePayerAmountBlur(member.name)}
                            />
                          </View>
                        )}
                      </View>
                    );
                  })}

                  {selectedPayers.length > 0 && (
                    <View className="mt-4 p-4 bg-gray-50 rounded-2xl">
                      <Text className="text-sm font-medium text-gray-700">
                        Total Paid:{" "}
                        <Text className="text-primary">
                          NPR{" "}
                          {selectedPayers
                            .reduce(
                              (sum, p) => sum + parseFloat(p.amount || "0"),
                              0,
                            )
                            .toFixed(2)}
                        </Text>
                      </Text>
                      <Text className="text-sm text-gray-500 mt-1">
                        Expense Amount:{" "}
                        <Text className="text-gray-900">
                          NPR {parseFloat(expenseData.amount || "0").toFixed(2)}
                        </Text>
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </ScrollView>

          <View className="absolute bottom-0 left-0 right-0 bg-white px-6 py-4 border-t border-gray-200">
            <Pressable
              onPress={handleSubmit}
              className="bg-primary py-4 rounded-2xl items-center"
              disabled={isLoadingMembers || isSubmitting || isLoadingCategories}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-lg">
                  {editMode ? "Update Expense" : "Add Expense"}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddExpense;
