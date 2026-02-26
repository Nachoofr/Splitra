import axiosInstance from './axiosConfig';

export interface CurrentUser {
  fullName: string;
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