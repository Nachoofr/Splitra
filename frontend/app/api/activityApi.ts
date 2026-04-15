import axiosInstance from './axiosConfig';

export interface ActivityItem {
  id: number;
  activityType: string;
  groupId: number;
  groupName: string;
  actorId: number;
  actorName: string;
  title: string;
  description: string;
  amount: number | null;
  createdAt: string;
}

export const activityApi = {
  getGroupActivities: async (groupId: number): Promise<ActivityItem[]> => {
    const response = await axiosInstance.get<ActivityItem[]>(`/splitra/activity/group/${groupId}`);
    return response.data;
  },

  getAllActivities: async (): Promise<ActivityItem[]> => {
    const response = await axiosInstance.get<ActivityItem[]>('/splitra/activity/all');
    return response.data;
  },
};