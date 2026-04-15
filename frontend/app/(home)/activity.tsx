import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { activityApi, ActivityItem } from '../api/activityApi';
import ActivityCard from '../../component/activityCard';
import CommonTitle from '../../component/commonTitle';

const Activity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setError(null);
      const data = await activityApi.getAllActivities();
      setActivities(data);
    } catch (err: any) {
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#101828" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="pl-6">
        <CommonTitle text="Activity" />
      </View>

      {error ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-red-500 text-base mb-4">{error}</Text>
          <Pressable onPress={fetchActivities} className="bg-primary px-6 py-3 rounded-xl">
            <Text className="text-white font-semibold">Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#101828" />
          }
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
        >
          {activities.length === 0 ? (
            <View className="flex-1 items-center mt-20 px-6">
              <Text className="text-gray-400 text-lg text-center">No activity yet.</Text>
              <Text className="text-gray-300 text-sm text-center mt-2">
                Actions across all your groups will appear here.
              </Text>
            </View>
          ) : (
            activities.map((item) => (
              <ActivityCard key={item.id} item={item} showGroup={true} />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default Activity;