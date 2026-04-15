import { View, Text } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityItem } from '../app/api/activityApi';

interface ActivityCardProps {
  item: ActivityItem;
  showGroup?: boolean;
}

const getActivityMeta = (type: string): { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string } => {
  switch (type) {
    case 'EXPENSE_ADDED':
      return { icon: 'add-circle-outline', color: '#3B82F6', bg: '#EFF6FF' };
    case 'EXPENSE_UPDATED':
      return { icon: 'create-outline', color: '#F59E0B', bg: '#FFFBEB' };
    case 'EXPENSE_DELETED':
      return { icon: 'trash-outline', color: '#EF4444', bg: '#FEF2F2' };
    case 'MEMBER_JOINED':
      return { icon: 'person-add-outline', color: '#8B5CF6', bg: '#F5F3FF' };
    case 'MEMBER_LEFT':
      return { icon: 'person-remove-outline', color: '#6B7280', bg: '#F3F4F6' };
    case 'SETTLEMENT_INITIATED':
      return { icon: 'arrow-down-circle-outline', color: '#10B981', bg: '#ECFDF5' };
    case 'SETTLEMENT_CONFIRMED':
      return { icon: 'checkmark-circle-outline', color: '#22C55E', bg: '#F0FDF4' };
    case 'GROUP_CREATED':
      return { icon: 'people-outline', color: '#8B5CF6', bg: '#F5F3FF' };
    case 'GROUP_UPDATED':
      return { icon: 'settings-outline', color: '#6B7280', bg: '#F3F4F6' };
    default:
      return { icon: 'ellipse-outline', color: '#6B7280', bg: '#F3F4F6' };
  }
};

const timeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const ActivityCard = ({ item, showGroup = false }: ActivityCardProps) => {
  const meta = getActivityMeta(item.activityType);

  return (
    <View className="bg-white rounded-2xl px-4 py-4 mb-3 mx-6 shadow-sm flex-row items-start">
      
      {/* Icon */}
      <View
        className="w-11 h-11 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: meta.bg }} // dynamic color kept
      >
        <Ionicons name={meta.icon} size={22} color={meta.color} />
      </View>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-900 font-semibold text-base flex-1 mr-2" numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="text-gray-400 text-xs">{timeAgo(item.createdAt)}</Text>
        </View>

        <Text className="text-gray-500 text-sm mt-0.5" numberOfLines={2}>
          {item.description}
        </Text>

        <View className="flex-row items-center mt-2 gap-2">
          {item.amount != null && (
            <View
              className="px-2.5 py-1 rounded-full"
              style={{
                backgroundColor:
                  item.activityType === 'SETTLEMENT_CONFIRMED' ||
                  item.activityType === 'SETTLEMENT_INITIATED'
                    ? '#ECFDF5'
                    : '#EFF6FF',
              }}
            >
              <Text
                className="text-xs font-semibold"
                style={{
                  color:
                    item.activityType === 'SETTLEMENT_CONFIRMED' ||
                    item.activityType === 'SETTLEMENT_INITIATED'
                      ? '#16A34A'
                      : '#3B82F6',
                }}
              >
                NPR {item.amount.toFixed(0)}
              </Text>
            </View>
          )}

          {showGroup && (
            <View className="bg-gray-100 px-2.5 py-1 rounded-full">
              <Text className="text-gray-500 text-xs">{item.groupName}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default ActivityCard;