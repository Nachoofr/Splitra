import {
  View,
  Text,
  Pressable,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import TotalExpenseCard from "../../../component/totalExpensesCard";
import { expenseApi, Expense } from "../../api/expenseApi";
import CommonTitle from "../../../component/commonTitleGroups";
import { useGroup } from "./groupContext";
import CreateCategoryModal from "../../../component/createCategory";

interface CategorySummary {
  name: string;
  total: number;
  percentage: number;
  count: number;
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
  Transport: "🚗",
  Accommodation: "🏨",
};

const CATEGORY_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#84cc16",
  "#06b6d4",
];

const Category = () => {
  const { group } = useGroup();
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateCategory, setShowCreateCategory] = useState(false);

  useEffect(() => {
    if (group?.id) {
      fetchData(Number(group.id));
    }
  }, [group.id]);

  const fetchData = async (groupId: number) => {
    try {
      setError(null);
      const [total, expenses] = await Promise.all([
        expenseApi.getTotalExpenseByGroup(groupId),
        expenseApi.getAllExpenses(groupId),
      ]);
      setTotalExpense(total);
      buildCategoryStats(expenses, total);
    } catch (err: any) {
      setError("Failed to load category data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const buildCategoryStats = (expenses: Expense[], total: number) => {
    const map: Record<string, { total: number; count: number }> = {};
    for (const exp of expenses) {
      const name = exp.categoryName || "Other";
      if (!map[name]) map[name] = { total: 0, count: 0 };
      map[name].total += exp.amount;
      map[name].count += 1;
    }
    const result: CategorySummary[] = Object.entries(map)
      .map(([name, { total: catTotal, count }]) => ({
        name,
        total: catTotal,
        count,
        percentage: total > 0 ? (catTotal / total) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
    setCategories(result);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData(Number(group.id));
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#101828" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#101828"
          />
        }
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <TotalExpenseCard totalExpense={totalExpense} status={group.Status} />

        <View className="ml-6 mr-6 flex-row justify-between items-center mt-3">
          <CommonTitle text="Categories" />
          <Pressable
            className="bg-primary p-4 rounded-3xl flex-row items-center"
            onPress={() => setShowCreateCategory(true)}
          >
            <Ionicons name="add" color="white" size={20} />
            <Text className="text-white ml-1">Add Category</Text>
          </Pressable>
        </View>

        {error ? (
          <View className="mx-6 mt-4 bg-red-50 rounded-2xl p-4">
            <Text className="text-red-500 text-base">{error}</Text>
          </View>
        ) : categories.length === 0 ? (
          <View className="mx-6 mt-6 bg-white rounded-3xl p-8 items-center shadow-sm">
            <Ionicons name="grid-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-400 text-base mt-3 text-center">
              No expenses yet.{"\n"}Add expenses to see category breakdown.
            </Text>
          </View>
        ) : (
          <>
            <View className="mx-6 mt-4 bg-white rounded-3xl p-6 shadow-sm">
              <Text className="text-gray-500 text-sm font-semibold uppercase tracking-widest mb-4">
                Spending Breakdown
              </Text>

              {categories.map((cat, index) => {
                const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
                const emoji = CATEGORY_EMOJIS[cat.name] || "📦";
                return (
                  <View key={cat.name} className="mb-5">
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center gap-2 flex-1">
                        <View
                          style={{ backgroundColor: color }}
                          className="w-3 h-3 rounded-full"
                        />
                        <Text className="text-base font-semibold text-gray-900">
                          {emoji} {cat.name}
                        </Text>
                        <View className="bg-gray-100 px-2 py-0.5 rounded-full ml-1">
                          <Text className="text-gray-400 text-xs">
                            {cat.count} item{cat.count !== 1 ? "s" : ""}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-gray-900 font-bold text-base">
                        NPR {cat.total.toFixed(0)}
                      </Text>
                    </View>

                    <View className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <View
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: color,
                        }}
                        className="h-full rounded-full"
                      />
                    </View>

                    <Text className="text-gray-400 text-xs mt-1 text-right">
                      {cat.percentage.toFixed(1)}%
                    </Text>
                  </View>
                );
              })}
            </View>

            <View className="mx-6 mt-2">
              {categories.map((cat, index) => {
                const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
                const emoji = CATEGORY_EMOJIS[cat.name] || "📦";
                return (
                  <View
                    key={`card-${cat.name}`}
                    className="bg-white rounded-3xl p-5 mb-3 shadow-sm"
                    style={{ borderLeftWidth: 4, borderLeftColor: color }}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <View
                          style={{ backgroundColor: `${color}20` }}
                          className="w-12 h-12 rounded-2xl items-center justify-center"
                        >
                          <Text className="text-2xl">{emoji}</Text>
                        </View>
                        <View>
                          <Text className="text-gray-900 text-lg font-semibold">
                            {cat.name}
                          </Text>
                          <Text className="text-gray-400 text-sm">
                            {cat.count} expense{cat.count !== 1 ? "s" : ""}
                          </Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-gray-900 text-xl font-bold">
                          NPR {cat.total.toFixed(0)}
                        </Text>
                        <View
                          style={{ backgroundColor: `${color}15` }}
                          className="px-2 py-0.5 rounded-full mt-1"
                        >
                          <Text
                            style={{ color }}
                            className="text-xs font-semibold"
                          >
                            {cat.percentage.toFixed(1)}%
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      <CreateCategoryModal
        visible={showCreateCategory}
        onClose={() => setShowCreateCategory(false)}
        groupId={group.id}
        onCategoryCreated={() => fetchData(Number(group.id))}
      />
    </View>
  );
};

export default Category;
