import {apiClient} from './client';
import {getAuthToken} from '../storage/authStorage';
import type {User} from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    [key: string]: unknown;
  };
}

export const login = async (
  payload: LoginRequest,
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(
    '/api/auth/login',
    payload,
  );

  return response.data;
};

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export const forgotPassword = async (
  email: string,
): Promise<ForgotPasswordResponse> => {
  const response = await apiClient.post<ForgotPasswordResponse>(
    '/api/auth/forgot-password',
    {email},
  );

  return response.data;
};

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export const resetPassword = async (
  payload: ResetPasswordRequest,
): Promise<ResetPasswordResponse> => {
  const response = await apiClient.post<ResetPasswordResponse>(
    '/api/auth/reset-password',
    payload,
  );

  return response.data;
};

export interface GetCurrentUserResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    [key: string]: unknown;
  };
}

export const getCurrentUser = async (
  authToken?: string,
): Promise<GetCurrentUserResponse> => {
  const token = authToken || (await getAuthToken());

  const response = await apiClient.get<GetCurrentUserResponse>(
    '/api/auth/me',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken?: string;
  };
}

export const refreshAccessToken = async (
  refreshToken: string,
): Promise<RefreshTokenResponse> => {
  const response = await apiClient.post<RefreshTokenResponse>(
    '/api/auth/refresh-token',
    {refreshToken},
  );

  return response.data;
};

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export const changePassword = async (
  payload: ChangePasswordRequest,
  accessToken: string,
): Promise<ChangePasswordResponse> => {
  const response = await apiClient.post<ChangePasswordResponse>(
    '/api/auth/change-password',
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data;
};

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  success: boolean;
  message: string;
  errors?: unknown;
}

export const resendVerificationEmail = async (
  payload: ResendVerificationRequest,
): Promise<ResendVerificationResponse> => {
  const response = await apiClient.post<ResendVerificationResponse>(
    '/api/auth/resend-verification',
    payload,
  );

  return response.data;
};

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export const logout = async (
  accessToken: string,
): Promise<LogoutResponse> => {
  const response = await apiClient.post<LogoutResponse>(
    '/api/auth/logout',
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data;
};