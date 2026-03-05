import axiosInstance from './axiosConfig';

export interface CurrentUser {
  fullName: string;
  id: number;
  email: string;
  profilePicture: string;
  phone: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  profilePicture?: string;
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

  updateUser: async (id: number, data: UpdateUserRequest): Promise<CurrentUser> => {
  try {
    const response = await axiosInstance.post<CurrentUser>(`/splitra/users/${id}`, {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      profilePicture: data.profilePicture,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
},


};