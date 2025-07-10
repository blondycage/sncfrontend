const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  user?: T
  message?: string
  error?: string
}

export interface AuthResponse {
  success: boolean
  token?: string
  user?: {
    id: string
    username: string
    email: string
    firstName: string
    lastName: string
    role: string
    avatar?: string
    isVerified: boolean
    uploadQuota?: {
      freeUploadsUsed: number
      freeUploadsLimit: number
      paidUploadsRemaining: number
      canUpload: boolean
    }
  }
  message?: string
  error?: string
}

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Generic API request function
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, defaultOptions)
    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(response.status, data.message || data.error || 'Request failed', data)
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    // Handle network errors
    throw new ApiError(0, 'Network error or server unavailable')
  }
}

// Authentication API functions
export const authApi = {
  register: async (userData: {
    username: string
    email: string
    password: string
    firstName: string
    lastName: string
    role: string
  }): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  login: async (credentials: {
    email: string
    password: string
  }): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  logout: async (): Promise<ApiResponse> => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    })
  },

  getProfile: async (token: string): Promise<ApiResponse> => {
    return apiRequest('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  forgotPassword: async (email: string): Promise<ApiResponse> => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  resetPassword: async (token: string, password: string): Promise<ApiResponse> => {
    return apiRequest(`/auth/reset-password/${token}`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    })
  },

  telegramAuth: async (authData: {
    telegramData: {
      id: string | null
      first_name: string | null
      last_name: string | null
      username: string | null
      photo_url: string | null
      auth_date: string | null
      hash: string | null
    }
    role: string
    email?: string
  }): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/telegram', {
      method: 'POST',
      body: JSON.stringify(authData),
    })
  },
}

// Listings API functions
export const listingsApi = {
  // Get all listings (main endpoint)
  getListings: async (params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
    minPrice?: number
    maxPrice?: number
    pricing_frequency?: string
    sortBy?: string
  }): Promise<ApiResponse> => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }
    
    const endpoint = `/listings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    console.log('🔍 API CLIENT - Getting listings from:', endpoint);
    return apiRequest(endpoint)
  },

  // Get all free listings (legacy - redirects to main endpoint)
  getFreeListings: async (params = {}) => {
    console.log('⚠️ getFreeListings is deprecated, using main getListings endpoint');
    return listingsApi.getListings(params);
  },

  createFreeListing: async (listingData: any, token: string) => {
    console.log('🚀 API CLIENT - Creating listing with data:', listingData);
    console.log('🔑 Using token:', token ? 'Token present' : 'No token');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL2 || 'http://localhost:5000'}/api/listings/free`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(listingData)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('📥 Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('❌ API CLIENT ERROR:', error);
      throw error;
    }
  },

  // Get user's own listings (for dashboard)
  getUserListings: async (token: string, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/listings/user/me?${queryString}` : '/listings/user/me';
    return apiRequest(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Get single listing by ID
  getListingById: async (id: string, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return apiRequest(`/listings/${id}`, { headers });
  },

  createListing: async (listingData: any, token: string): Promise<ApiResponse> => {
    return apiRequest('/listings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(listingData),
    })
  },

  updateListing: async (id: string, listingData: any, token: string): Promise<ApiResponse> => {
    return apiRequest(`/listings/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(listingData),
    })
  },

  deleteListing: async (id: string, token: string): Promise<ApiResponse> => {
    return apiRequest(`/listings/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  // Get user's favorite listings
  getFavoriteListings: async (token: string, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/listings/favorites?${queryString}` : '/listings/favorites';
    return apiRequest(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
}

// User API functions
export const userApi = {
  // Get current user's complete profile with all data
  getUserProfile: async (token: string): Promise<ApiResponse> => {
    return apiRequest('/users/me/complete', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Get user's dashboard data (listings, favorites, stats)
  getDashboardData: async (token: string): Promise<ApiResponse> => {
    return apiRequest('/users/me/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

// Upload API functions - Direct Cloudinary Upload
export const uploadApi = {
  uploadImages: async (files: File[]): Promise<{ success: boolean; data: { urls: string[] }; message: string }> => {
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'ml_default');
        formData.append('folder', 'listings');

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/dtuorzemy/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to upload image');
        }

        const data = await response.json();
        return data.secure_url;
      });

      const urls = await Promise.all(uploadPromises);

      return {
        success: true,
        data: { urls },
        message: `Successfully uploaded ${urls.length} image(s)`
      };
    } catch (error: any) {
      throw new Error(error.message || 'Upload failed');
    }
  },

  uploadImage: async (file: File): Promise<{ success: boolean; data: { url: string }; message: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default');
      formData.append('folder', 'listings');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dtuorzemy/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to upload image');
      }

      const data = await response.json();

      return {
        success: true,
        data: { url: data.secure_url },
        message: 'Image uploaded successfully'
      };
    } catch (error: any) {
      throw new Error(error.message || 'Upload failed');
    }
  },

  uploadAvatar: async (file: File): Promise<{ success: boolean; data: { url: string }; message: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default');
      formData.append('folder', 'avatars');
      formData.append('transformation', 'w_200,h_200,c_fill,g_face');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dtuorzemy/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to upload avatar');
      }

      const data = await response.json();

      return {
        success: true,
        data: { url: data.secure_url },
        message: 'Avatar uploaded successfully'
      };
    } catch (error: any) {
      throw new Error(error.message || 'Upload failed');
    }
  }
};

export default apiRequest 