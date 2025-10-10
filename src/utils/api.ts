// API utility functions for KIMU Transport & Multiservices

import { ApiResponse } from '@/types';

/**
 * Base API configuration
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Default headers for API requests
 */
const getDefaultHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add authorization header if token exists
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Generic API request function
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: getDefaultHeaders(),
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP error! status: ${response.status}`,
      };
    }

    return {
      success: true,
      data,
      message: data.message,
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

/**
 * GET request
 */
export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

/**
 * POST request
 */
export async function apiPost<T>(
  endpoint: string,
  data: any
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request
 */
export async function apiPut<T>(
  endpoint: string,
  data: any
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * PATCH request
 */
export async function apiPatch<T>(
  endpoint: string,
  data: any
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request
 */
export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}

/**
 * File upload request
 */
export async function apiUpload<T>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
      const defaultHeaders = getDefaultHeaders();
  const config: RequestInit = {
    method: 'POST',
    headers: {
      ...defaultHeaders,
    },
    body: formData,
  };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Upload failed! status: ${response.status}`,
      };
    }

    return {
      success: true,
      data,
      message: data.message,
    };
  } catch (error) {
    console.error('File upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.error) {
    return error.error;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Retry API request with exponential backoff
 */
export async function apiRetry<T>(
  requestFn: () => Promise<ApiResponse<T>>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<ApiResponse<T>> {
  let lastError: string = '';
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await requestFn();
      if (result.success) {
        return result;
      }
      lastError = result.error || 'Request failed';
    } catch (error) {
      lastError = handleApiError(error);
    }
    
    if (attempt < maxRetries - 1) {
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return {
    success: false,
    error: `Request failed after ${maxRetries} attempts. Last error: ${lastError}`,
  };
}

/**
 * Check if response indicates authentication is required
 */
export function isAuthRequired(response: Response): boolean {
  return response.status === 401 || response.status === 403;
}

/**
 * Check if response indicates rate limiting
 */
export function isRateLimited(response: Response): boolean {
  return response.status === 429;
}

/**
 * Extract pagination info from response headers
 */
export function extractPagination(headers: Headers) {
  return {
    total: parseInt(headers.get('X-Total-Count') || '0'),
    page: parseInt(headers.get('X-Page') || '1'),
    limit: parseInt(headers.get('X-Limit') || '10'),
    totalPages: parseInt(headers.get('X-Total-Pages') || '0'),
  };
}

/**
 * Create query string from object
 */
export function createQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/staff/login',
    LOGOUT: '/api/staff/logout',
    VERIFY_TOTP: '/api/verify-totp',
    TOTP_SETUP: '/api/users/totp-setup',
    CHECK_TRUSTED_DEVICE: '/api/check-trusted-device',
    TRUSTED_DEVICES: '/api/trusted-devices',
  },
  
  // Users
  USERS: {
    LIST: '/api/users',
    CREATE: '/api/users/create',
    UPDATE: (id: string) => `/api/users/${id}`,
    DELETE: (id: string) => `/api/users/${id}`,
    PROFILE: '/api/users/profile',
    CHANGE_PASSWORD: '/api/users/change-password',
    RESET_PASSWORD: '/api/users/reset-password',
    UPDATE_PROFILE: '/api/users/update-profile',
    PROFILE_PICTURE: '/api/users/profile-picture',
  },
  
  // Employees
  EMPLOYEES: {
    LIST: '/api/employees',
    CREATE: '/api/employees',
    UPDATE: (id: string) => `/api/employees/${id}`,
    DELETE: (id: string) => `/api/employees/${id}`,
  },
  
  // Payroll
  PAYROLL: {
    LIST: '/api/payroll',
    CREATE: '/api/payroll',
    PROCESS: '/api/payroll/process',
  },
  
  // Vehicles
  VEHICLES: {
    LIST: '/api/vehicles',
    CREATE: '/api/vehicles/create',
    UPDATE: (id: string) => `/api/vehicles/${id}`,
    DELETE: (id: string) => `/api/vehicles/${id}`,
    UPLOAD: '/api/vehicles/upload',
  },
  
  // Bookings
  BOOKINGS: {
    LIST: '/api/bookings',
    CREATE: '/api/bookings',
    UPDATE: (id: string) => `/api/bookings/${id}`,
    DELETE: (id: string) => `/api/bookings/${id}`,
  },
  
  // Notifications
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    UPDATE: (id: string) => `/api/notifications/${id}`,
    STATUS_UPDATE: '/api/notifications/status-update',
  },
  
  // Reports
  REPORTS: {
    BOOKING_STATS: '/api/reports/booking-stats',
    STAFF_PERFORMANCE: '/api/reports/staff-performance',
    FINANCIAL_SUMMARY: '/api/financial-summary',
  },
  
  // Activity
  ACTIVITY: {
    LOG: '/api/activity-log',
    LIST: '/api/activities',
  },
  
  // System
  SYSTEM: {
    LOGS: '/api/system-logs',
    TEST_ENV: '/api/test-env',
  },
} as const;
