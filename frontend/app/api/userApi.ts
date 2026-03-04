import axiosInstance from './axiosConfig';

export interface CurrentUser {
  fullName: string;
  id: number;
  email: string;
  profilePicture: string;
  phone: string;
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