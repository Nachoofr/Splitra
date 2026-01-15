import axiosInstance from './axiosConfig';

export interface Group {
  groupName: string;
  groupPicture: string;
  Status: string;
  createdBy: number;
}

export const groupApi = {
  // Get all groups
  getAllGroups: async (): Promise<Group[]> => {
    try {
      const response = await axiosInstance.get('/splitra/groups');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};