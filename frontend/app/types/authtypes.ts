export interface SignUpRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface SignUpResponse {
  id?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  message?: string;
}

export interface ErrorResponse {
  message: string;
  status: number;
}