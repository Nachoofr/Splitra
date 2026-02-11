import AxiosInstance from './axiosConfig';
import { SignInRequest, SignInResponse, SignUpRequest, SignUpResponse } from '../types/authTypes';

export const authApi = {
  signUp: async (data: SignUpRequest): Promise<SignUpResponse> => {
    const response = await AxiosInstance.post<SignUpResponse>('/splitra/users/signup', data);
    return response.data;
  },

  signIn: async (data: SignInRequest): Promise<SignInResponse> => {
    const response = await AxiosInstance.post<SignInResponse>('/splitra/users/login', data);
    return response.data;
  },


};