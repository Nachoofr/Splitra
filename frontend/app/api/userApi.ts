import axiosInstance from './axiosConfig';

export interface QrCode {
  id: number;
  label: string;
  qrImageData: string;
}

export interface QrCodeInput {
  label: string;
  qrImageData: string;
}

export interface CurrentUser {
  fullName: string;
  id: number;
  email: string;
  profilePicture: string;
  phone: string;
  qrCodes: QrCode[];
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  profilePicture?: string;
  qrCodes?: QrCodeInput[];
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
      qrCodes: data.qrCodes,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
},

  deleteUser: async (id: number): Promise<void> => {
    try{
        const response = await axiosInstance.delete<void>(`/splitra/users/${id}`);
        return response.data;
    }
    catch (error) {
        throw error;
    }
  },


};