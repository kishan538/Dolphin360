import axios, {InternalAxiosRequestConfig} from 'axios';
import {
  clearAuthSession,
  getAuthSession,
  getAuthToken,
  saveAuthSession,
} from '../storage/authStorage';

export const API_BASE_URL = 'https://api.dolfin360.com';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

const isPublicAuthEndpoint = (url?: string): boolean => {
  if (!url) {
    return false;
  }
  const publicEndpoints = [
    '/api/auth/login',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/resend-verification',
    '/api/auth/refresh-token',
    '/api/auth/logout',
  ];
  return publicEndpoints.some(endpoint => url.includes(endpoint));
};

let refreshPromise: Promise<string | null> | null = null;

const performTokenRefresh = async (): Promise<string | null> => {
  try {
    const session = await getAuthSession();
    if (!session?.refreshToken) {
      await clearAuthSession();
      return null;
    }

    const response = await axios.post<{
      success: boolean;
      message: string;
      data?: {accessToken?: string; refreshToken?: string};
    }>(
      `${API_BASE_URL}/api/auth/refresh-token`,
      {refreshToken: session.refreshToken},
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 15000,
      },
    );

    const newAccessToken = response.data?.data?.accessToken;
    const newRefreshToken =
      response.data?.data?.refreshToken &&
      typeof response.data.data.refreshToken === 'string' &&
      response.data.data.refreshToken.trim().length > 0
        ? response.data.data.refreshToken
        : session.refreshToken;

    if (
      response.data?.success &&
      typeof newAccessToken === 'string' &&
      newAccessToken.trim().length > 0
    ) {
      await saveAuthSession({
        user: session.user,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
      return newAccessToken;
    }

    await clearAuthSession();
    return null;
  } catch {
    await clearAuthSession();
    return null;
  } finally {
    refreshPromise = null;
  }
};

apiClient.interceptors.request.use(
  async config => {
    if (!config.headers.Authorization && !isPublicAuthEndpoint(config.url)) {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  error => Promise.reject(error),
);

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

    if (
      !error.response ||
      error.response.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isPublicAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = performTokenRefresh();
    }

    const newAccessToken = await refreshPromise;

    if (!newAccessToken) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

    return apiClient(originalRequest);
  },
);