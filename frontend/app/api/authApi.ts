import AxiosInstance from './axiosConfig';
import { SignUpRequest, SignUpResponse } from '../types/authtypes';

export const authApi = {
  signUp: async (data: SignUpRequest): Promise<SignUpResponse> => {
    const response = await AxiosInstance.post<SignUpResponse>('/splitra/users', data);
    return response.data;
  },
};