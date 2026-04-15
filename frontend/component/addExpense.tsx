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
  ItemSplitEntry,
  ItemData,
  AddExpenseRequest,
} from "../app/api/expenseApi";
import { categoryApi, Category } from "../app/api/categoryApi";
import { BillScanResult } from "../app/api/billScanApi";

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  onExpenseAdded?: () => void;
  editMode?: boolean;
  expenseToEdit?: Expense;
  scannedData?: BillScanResult | null;
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
  scannedData,
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
  const [percentageSplits, setPercentageSplits] = useState<
    Record<number, string>
  >({});

  const [itemAssignments, setItemAssignments] = useState<
    Record<number, Set<number>>
  >({});
  const [itemModalMember, setItemModalMember] = useState<GroupMember | null>(
    null,
  );

  const scannedItems = scannedData?.items ?? [];

  const updatePercentage = (memberId: number, value: string) => {
    setPercentageSplits((prev) => ({ ...prev, [memberId]: value }));
  };

  const totalPercentage = splitMembers.reduce(
    (sum, id) => sum + parseFloat(percentageSplits[id] || "0"),
    0,
  );

  const toggleSplitMember = (memberId: number) => {
    if (splitMembers.includes(memberId)) {
      setSplitMembers(splitMembers.filter((id) => id !== memberId));
      setPercentageSplits((prev) => {
        const updated = { ...prev };
        delete updated[memberId];
        return updated;
      });
    } else {
      setSplitMembers([...splitMembers, memberId]);
    }
  };

  const toggleItemForMember = (memberId: number, itemIndex: number) => {
    setItemAssignments((prev) => {
      const current = new Set(prev[memberId] ?? []);
      if (current.has(itemIndex)) {
        current.delete(itemIndex);
      } else {
        current.add(itemIndex);
      }
      return { ...prev, [memberId]: current };
    });
  };

  const getUnassignedItems = (): number[] => {
    const assignedIndexes = new Set<number>();
    Object.values(itemAssignments).forEach((indexes) => {
      indexes.forEach((idx) => assignedIndexes.add(idx));
    });
    return scannedItems
      .map((_, idx) => idx)
      .filter((idx) => !assignedIndexes.has(idx));
  };

  const getMemberTotal = (memberId: number): number => {
    const selections = itemAssignments[memberId] ?? new Set();
    let total = 0;
    selections.forEach((idx) => {
      const shareCount = Object.values(itemAssignments).filter((s) =>
        s.has(idx),
      ).length;
      const itemAmount = scannedItems[idx]?.totalPrice ?? 0;
      total += shareCount > 0 ? itemAmount / shareCount : itemAmount;
    });
    return total;
  };

  const loadScannedData = () => {
    if (!scannedData) return;
    const matchedCategory = categories.find(
      (c) =>
        c.name.toLowerCase() === scannedData.suggestedCategory?.toLowerCase(),
    );
    setExpenseData((prev) => ({
      ...prev,
      description: scannedData.merchantName || prev.description,
      amount: scannedData.totalAmount?.toString() || prev.amount,
      date: scannedData.date || prev.date,
      category: matchedCategory?.id || prev.category,
    }));
  };

  useEffect(() => {
    if (visible && scannedData && categories.length > 0 && !editMode) {
      loadScannedData();
    }
  }, [visible, scannedData, categories]);

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
    } catch {
      Alert.alert("Error", "Failed to load group members.");
      setGroupMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const cats = await categoryApi.getCategoriesByGroupId(Number(groupId));
      setCategories(cats);
      if (cats.length > 0 && expenseData.category === 0) {
        setExpenseData((prev) => ({ ...prev, category: cats[0].id }));
      }
    } catch {
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
        if (p.amount !== "" && p.amount !== "0")
          return sum + parseFloat(p.amount);
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
    setPercentageSplits({});
    setItemAssignments({});
    setItemModalMember(null);
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
    if (expenseData.splitMethod === "PERCENTWISE") {
      if (splitMembers.length < 2) {
        Alert.alert("Error", "Please select at least 2 members to split with");
        return false;
      }
      if (Math.abs(totalPercentage - 100) > 0.01) {
        Alert.alert(
          "Error",
          `Percentages must add up to 100% (currently ${totalPercentage.toFixed(1)}%)`,
        );
        return false;
      }
    }
    if (expenseData.splitMethod === "ITEMWISE") {
      if (scannedItems.length === 0) {
        Alert.alert(
          "Error",
          "No scanned items found. Please use bill scanner first.",
        );
        return false;
      }
      const unassigned = getUnassignedItems();
      if (unassigned.length > 0) {
        const names = unassigned
          .map((idx) => scannedItems[idx]?.name ?? `Item ${idx + 1}`)
          .join(", ");
        Alert.alert("Error", `These items have no one assigned: ${names}`);
        return false;
      }
    }
    const totalPaid = selectedPayers.reduce(
      (sum, p) => sum + parseFloat(p.amount || "0"),
      0,
    );
    if (Math.abs(totalPaid - parseFloat(expenseData.amount)) > 0.01) {
      Alert.alert(
        "Error",
        `Total paid (${totalPaid.toFixed(2)}) must equal expense amount (${parseFloat(expenseData.amount).toFixed(2)})`,
      );
      return false;
    }
    return true;
  };

  const buildItemwiseSplitRequest = () => {
    const items: ItemData[] = scannedItems.map((item, idx) => ({
      index: idx,
      amount: item.totalPrice,
    }));

    const itemwiseSplit: ItemSplitEntry[] = Object.entries(itemAssignments)
      .filter(([, indexes]) => indexes.size > 0)
      .map(([userId, indexes]) => ({
        userId: Number(userId),
        itemIndexes: Array.from(indexes),
      }));

    return { itemwiseSplit, items };
  };

  const handleSubmit = async () => {
    if (!validateExpense()) return;
    try {
      setIsSubmitting(true);

      const paidByData: ExpensePaymentRequest[] = selectedPayers.map(
        (payer) => {
          const member = groupMembers.find((m) => m.name === payer.name);
          if (!member) throw new Error(`Member ${payer.name} not found`);
          return {
            paidByUserId: member.id,
            amountPaid: parseFloat(payer.amount),
          };
        },
      );

      let splitRequest: AddExpenseRequest["splitRequest"] = {};

      if (expenseData.splitMethod === "EQUALLY") {
        splitRequest = { equalSplitId: splitMembers };
      } else if (expenseData.splitMethod === "PERCENTWISE") {
        splitRequest = {
          percentageSplitId: Object.fromEntries(
            splitMembers.map((id) => [
              id,
              parseFloat(percentageSplits[id] || "0"),
            ]),
          ),
        };
      } else if (expenseData.splitMethod === "ITEMWISE") {
        splitRequest = buildItemwiseSplitRequest();
      }

      const requestData: AddExpenseRequest = {
        description: expenseData.description,
        amount: parseFloat(expenseData.amount),
        date: expenseData.date,
        category: expenseData.category,
        splitMethod: expenseData.splitMethod,
        paidBy: paidByData,
        splitRequest,
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
      if (onExpenseAdded) onExpenseAdded();
    } catch (error: any) {
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

  const renderItemPickerModal = () => {
    if (!itemModalMember) return null;

    const memberId = itemModalMember.id;
    const selections = itemAssignments[memberId] ?? new Set();
    const memberTotal = getMemberTotal(memberId);

    return (
      <Modal
        visible={true}
        animationType="slide"
        presentationStyle="fullScreen"
        transparent={false}
        onRequestClose={() => setItemModalMember(null)}
      >
        <View className="flex-1 bg-primary">
          <View className="pt-14 pb-6 px-6">
            <View className="flex-row items-center">
              <Pressable
                onPress={() => setItemModalMember(null)}
                className="w-14 h-14 bg-[#374151] rounded-3xl items-center justify-center"
              >
                <Ionicons name="close" size={24} color="white" />
              </Pressable>

              <View className="ml-4 flex-1">
                <Text className="text-white text-2xl font-semibold">
                  {itemModalMember.name}'s Items
                </Text>
                <Text className="text-[#CAD5E2] text-base mt-1">
                  Select what they consumed
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-1 bg-gray-50">
            <ScrollView
              contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
            >
              {scannedItems.map((item, idx) => {
                const isChecked = selections.has(idx);

                const shareCount = Object.values(itemAssignments).filter((s) =>
                  s.has(idx),
                ).length;

                const projectedShare = isChecked ? shareCount : shareCount + 1;
                const perPersonAmount = item.totalPrice / projectedShare;

                return (
                  <Pressable
                    key={idx}
                    onPress={() => toggleItemForMember(memberId, idx)}
                    className={`flex-row items-center p-5 rounded-3xl mb-3 border-2 ${
                      isChecked
                        ? "bg-primary border-primary"
                        : "bg-white border-gray-100"
                    }`}
                  >
                    <View
                      className={`w-7 h-7 rounded-lg border-2 items-center justify-center mr-4 ${
                        isChecked
                          ? "bg-white border-white"
                          : "border-gray-300 bg-gray-50"
                      }`}
                    >
                      {isChecked && (
                        <Ionicons name="checkmark" size={16} color="#101828" />
                      )}
                    </View>

                    <View className="flex-1">
                      <Text
                        className={`text-lg font-semibold ${
                          isChecked ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.name}
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text
                        className={`text-lg font-bold ${
                          isChecked ? "text-white" : "text-gray-900"
                        }`}
                      >
                        NPR {item.totalPrice?.toFixed(2)}
                      </Text>

                      {shareCount > (isChecked ? 1 : 0) && (
                        <Text
                          className={`text-xs ${
                            isChecked ? "text-white/70" : "text-gray-400"
                          }`}
                        >
                          NPR {perPersonAmount.toFixed(2)} / person
                        </Text>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 bg-white px-6 py-4 border-t border-gray-200">
              <View className="flex-row justify-between mb-3">
                <Text className="text-gray-500">
                  {selections.size} items selected
                </Text>

                <Text className="text-gray-900 font-bold">
                  NPR {memberTotal.toFixed(2)}
                </Text>
              </View>

              <Pressable
                onPress={() => setItemModalMember(null)}
                className="bg-primary py-4 rounded-2xl items-center"
              >
                <Text className="text-white font-semibold text-lg">Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderItemwiseSection = () => {
    if (expenseData.splitMethod !== "ITEMWISE") return null;

    if (scannedItems.length === 0) {
      return (
        <View className="bg-white rounded-3xl p-6 mx-6 mt-4 shadow-sm">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Assign Items
          </Text>
          <View className="bg-orange-50 rounded-2xl p-4">
            <Text className="text-orange-600 text-base font-medium">
              ⚠️ No scanned items available
            </Text>
            <Text className="text-orange-500 text-sm mt-1">
              Please close this form and use the bill scanner first.
            </Text>
          </View>
        </View>
      );
    }

    const unassigned = getUnassignedItems();

    return (
      <View className="bg-white rounded-3xl p-6 mx-6 mt-4 shadow-sm">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Assign Items
        </Text>
        <Text className="text-gray-500 text-base mb-4">
          Tap a member to select what they consumed
        </Text>

        {unassigned.length > 0 && (
          <View className="bg-red-50 rounded-2xl p-3 mb-4 flex-row items-start gap-2">
            <Ionicons name="warning-outline" size={18} color="#EF4444" />
            <Text className="text-red-500 text-sm font-medium flex-1">
              Not assigned:{" "}
              {unassigned
                .map((idx) => scannedItems[idx]?.name ?? `Item ${idx + 1}`)
                .join(", ")}
            </Text>
          </View>
        )}

        {unassigned.length === 0 &&
          Object.values(itemAssignments).some((s) => s.size > 0) && (
            <View className="bg-green-50 rounded-2xl p-3 mb-4 flex-row items-center gap-2">
              <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
              <Text className="text-green-600 text-sm font-medium">
                All items assigned
              </Text>
            </View>
          )}

        {isLoadingMembers ? (
          <ActivityIndicator size="large" color="#1F2937" />
        ) : (
          <View className="gap-3">
            {groupMembers.map((member) => {
              const selections = itemAssignments[member.id] ?? new Set();
              const selectedCount = selections.size;
              const memberTotal = getMemberTotal(member.id);

              return (
                <Pressable
                  key={member.id}
                  onPress={() => {
                    console.log("CLICKED:", member.name);
                    setItemModalMember(member);
                  }}
                  className="flex-row items-center justify-between px-5 py-4 bg-gray-50 rounded-2xl border border-gray-200 active:opacity-80"
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className={`w-11 h-11 rounded-full items-center justify-center ${
                        selectedCount > 0 ? "bg-primary" : "bg-gray-200"
                      }`}
                    >
                      <Text
                        className={`font-bold text-base ${
                          selectedCount > 0 ? "text-white" : "text-gray-500"
                        }`}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-gray-900 text-lg font-medium">
                        {member.name}
                      </Text>
                      <Text className="text-gray-400 text-sm">
                        {selectedCount > 0
                          ? `${selectedCount} item${selectedCount > 1 ? "s" : ""} · NPR ${memberTotal.toFixed(2)}`
                          : "No items selected"}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-2">
                    {selectedCount > 0 && (
                      <View className="bg-primary px-3 py-1 rounded-full">
                        <Text className="text-white text-xs font-bold">
                          {selectedCount}
                        </Text>
                      </View>
                    )}
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#9CA3AF"
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <>
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
              {/* ── Expense Details ── */}
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
                  {(["EQUALLY", "PERCENTWISE", "ITEMWISE"] as const).map(
                    (method) => (
                      <Pressable
                        key={method}
                        onPress={() =>
                          setExpenseData({
                            ...expenseData,
                            splitMethod: method,
                          })
                        }
                        className={`px-6 py-4 rounded-2xl ${
                          expenseData.splitMethod === method
                            ? "bg-primary"
                            : "bg-white border-2 border-gray-200"
                        }`}
                      >
                        <Text
                          className={`text-lg font-medium text-center ${
                            expenseData.splitMethod === method
                              ? "text-white"
                              : "text-gray-900"
                          }`}
                        >
                          {method === "EQUALLY"
                            ? "Split Equally"
                            : method === "PERCENTWISE"
                              ? "Split by Percentage"
                              : "Split by Items"}
                        </Text>
                        {method === "ITEMWISE" && scannedItems.length === 0 && (
                          <Text
                            className={`text-xs text-center mt-1 ${
                              expenseData.splitMethod === method
                                ? "text-white/70"
                                : "text-gray-400"
                            }`}
                          >
                            Requires bill scan
                          </Text>
                        )}
                      </Pressable>
                    ),
                  )}
                </View>
              </View>

              {(expenseData.splitMethod === "EQUALLY" ||
                expenseData.splitMethod === "PERCENTWISE") && (
                <View className="bg-white rounded-3xl p-6 mx-6 mt-4 shadow-sm">
                  <Text className="text-2xl font-bold text-gray-900 mb-2">
                    Split With
                  </Text>
                  <Text className="text-gray-500 text-base mb-4">
                    {expenseData.splitMethod === "EQUALLY"
                      ? "Select at least 2 members to split equally"
                      : "Select members and enter their percentage"}
                  </Text>

                  {isLoadingMembers ? (
                    <ActivityIndicator size="large" color="#1F2937" />
                  ) : (
                    <View className="gap-3">
                      {groupMembers.map((member) => {
                        const isSelected = splitMembers.includes(member.id);
                        return (
                          <View key={member.id}>
                            <Pressable
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
                                      isSelected
                                        ? "text-white"
                                        : "text-gray-600"
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

                            {isSelected &&
                              expenseData.splitMethod === "PERCENTWISE" && (
                                <View className="mt-2 pl-4">
                                  <View className="flex-row items-center bg-gray-50 rounded-2xl border border-gray-200 px-4 py-3">
                                    <TextInput
                                      className="flex-1 text-gray-900"
                                      placeholder="0"
                                      placeholderTextColor="#9CA3AF"
                                      keyboardType="decimal-pad"
                                      value={percentageSplits[member.id] || ""}
                                      onChangeText={(text) =>
                                        updatePercentage(member.id, text)
                                      }
                                    />
                                    <Text className="text-gray-500 font-semibold ml-2">
                                      %
                                    </Text>
                                  </View>
                                </View>
                              )}
                          </View>
                        );
                      })}

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

                      {splitMembers.length > 0 &&
                        expenseData.splitMethod === "PERCENTWISE" && (
                          <View className="mt-2 p-4 bg-gray-50 rounded-2xl">
                            <Text className="text-sm font-medium text-gray-700">
                              Total:{" "}
                              <Text
                                className={
                                  totalPercentage === 100
                                    ? "text-green-600"
                                    : "text-primary"
                                }
                              >
                                {totalPercentage.toFixed(1)}%
                              </Text>{" "}
                              / 100%
                            </Text>
                            {totalPercentage !== 100 && (
                              <Text className="text-xs text-red-400 mt-1">
                                ⚠️ Percentages must add up to 100%
                              </Text>
                            )}
                          </View>
                        )}
                    </View>
                  )}
                </View>
              )}

              {renderItemwiseSection()}

              <View className="bg-white rounded-3xl p-6 mx-6 mt-4 shadow-sm">
                <Text className="text-2xl font-bold text-gray-900 mb-2">
                  Who Paid?
                </Text>
                <Text className="text-gray-500 text-base mb-4">
                  Select one or more people and enter amounts
                </Text>

                {isLoadingMembers ? (
                  <ActivityIndicator size="large" color="#1F2937" />
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
                              <TextInput
                                className="bg-gray-50 rounded-2xl px-4 py-3 text-gray-900 border border-gray-200"
                                placeholder="0.00"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="decimal-pad"
                                value={payer.amount}
                                onChangeText={(text) =>
                                  updatePayerAmount(member.name, text)
                                }
                                onBlur={() =>
                                  handlePayerAmountBlur(member.name)
                                }
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
                            NPR{" "}
                            {parseFloat(expenseData.amount || "0").toFixed(2)}
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
                disabled={
                  isLoadingMembers || isSubmitting || isLoadingCategories
                }
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
        {renderItemPickerModal()}
      </Modal>
    </>
  );
};

export default AddExpense;
