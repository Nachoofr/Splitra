import axiosInstance from './axiosConfig';

export interface CurrentUser {
  fullName: string;
  id: number
}

export const userApi = {
  getCurrentUser: async (): Promise<CurrentUser> => {
    try{
        const response = await axiosInstance.get<CurrentUser>('/splitra/users/current');
        return response.data;
    }
    catch (error) {
        throw error;
    }
  },
};