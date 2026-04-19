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

  sendVerificationCode: async (email: string, purpose: 'SIGNUP' | 'FORGOT_PASSWORD'): Promise<void> => {
    await AxiosInstance.post('/splitra/users/send-verification', { email, purpose });
  },

  verifyCode: async (email: string, code: string, purpose: 'SIGNUP' | 'FORGOT_PASSWORD'): Promise<void> => {
    await AxiosInstance.post('/splitra/users/verify-code', { email, code, purpose });
  },

  forgotPasswordReset: async (email: string, code: string, newPassword: string): Promise<void> => {
    await AxiosInstance.post('/splitra/users/forgot-password-reset', { email, code, new_password: newPassword });
  },
};