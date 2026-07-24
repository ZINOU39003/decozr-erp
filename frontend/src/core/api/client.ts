import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { ApiError, NetworkError, PermissionError, ValidationError } from '../errors';

// Create Axios Instance
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Read token from Zustand persisted storage (no import to avoid circular refs)
    try {
      const stored = localStorage.getItem('decozr-auth-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        const token = parsed?.state?.accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {}
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Simplify response returning just data
    return response.data;
  },
  async (error: AxiosError) => {
    // Handle Network Errors
    if (!error.response) {
      return Promise.reject(new NetworkError());
    }

    const statusCode = error.response.status;
    const responseData = error.response.data as any;
    const message = responseData?.message || error.message;

    // Categorize Errors
    if (statusCode === 401) {
      // Future: Handle Token Refresh logic here
      return Promise.reject(new PermissionError('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً.'));
    }

    if (statusCode === 403) {
      return Promise.reject(new PermissionError('عذراً، ليس لديك الصلاحيات الكافية.'));
    }

    if (statusCode === 400 || statusCode === 422) {
      return Promise.reject(new ValidationError(message, responseData?.errors));
    }

    // Generic API Error
    return Promise.reject(new ApiError(message, statusCode, responseData));
  }
);

export default apiClient;
