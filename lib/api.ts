// Note: Direct toast calls will be handled by the components that use these API functions

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
  
  console.log('🌐 API Request:', {
    method: options.method || 'GET',
    url,
    headers: options.headers,
    timestamp: new Date().toISOString()
  })
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    // Include cookies by default (for middleware/session cases)
    credentials: options.credentials || 'include',
    ...options,
  }

  // Auto-attach Authorization from localStorage if running in browser and not already provided
  try {
    if (typeof window !== 'undefined') {
      const hasAuthHeader = (defaultOptions.headers as any)?.Authorization || (defaultOptions.headers as any)?.authorization
      const token = localStorage.getItem('authToken')
      if (!hasAuthHeader && token) {
        console.log('🔑 Attaching auth token to request')
        ;(defaultOptions.headers as any) = {
          ...(defaultOptions.headers as any),
          Authorization: `Bearer ${token}`,
        }
      } else if (!token && !hasAuthHeader) {
        console.log('⚠️  No auth token available')
      }
    }
  } catch (tokenError) {
    console.error('❌ Error handling auth token:', tokenError)
  }

  try {
    const response = await fetch(url, defaultOptions)
    
    console.log('📡 API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      timestamp: new Date().toISOString()
    })

    let data
    try {
      data = await response.json()
    } catch (jsonError) {
      console.error('❌ Failed to parse response as JSON:', jsonError)
      throw new ApiError(response.status, 'Invalid response format')
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || 'Request failed'
      console.error('❌ API Error Response:', {
        status: response.status,
        message: errorMessage,
        data,
        timestamp: new Date().toISOString()
      })
      
      throw new ApiError(response.status, errorMessage, data)
    }

    console.log('✅ API Success:', {
      status: response.status,
      data: data.success ? 'Success response' : data,
      timestamp: new Date().toISOString()
    })

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    console.error('❌ Network or unexpected error:', {
      error: error.message || error,
      url,
      timestamp: new Date().toISOString()
    })
    
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
    console.log('👤 Registration attempt:', {
      email: userData.email,
      username: userData.username,
      role: userData.role,
      timestamp: new Date().toISOString()
    })
    
    try {
      const result = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }) as Promise<AuthResponse>
      
      console.log('✅ Registration successful:', {
        success: true,
        user: result.user?.id,
        timestamp: new Date().toISOString()
      })
      
      return result
    } catch (error) {
      console.error('❌ Registration failed:', {
        error: error instanceof Error ? error.message : error,
        email: userData.email,
        timestamp: new Date().toISOString()
      })
      throw error
    }
  },

  login: async (credentials: {
    email: string
    password: string
  }): Promise<AuthResponse> => {
    console.log('🔐 Login attempt:', {
      email: credentials.email,
      timestamp: new Date().toISOString()
    })
    
    try {
      const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }) as Promise<AuthResponse>
      
      console.log('✅ Login successful:', {
        success: true,
        user: result.user?.id,
        role: result.user?.role,
        hasToken: !!result.token,
        timestamp: new Date().toISOString()
      })
      
      return result
    } catch (error) {
      console.error('❌ Login failed:', {
        error: error instanceof Error ? error.message : error,
        email: credentials.email,
        timestamp: new Date().toISOString()
      })
      throw error
    }
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
    return apiRequest('/auth/telegram', {
      method: 'POST',
      body: JSON.stringify(authData),
    }) as Promise<AuthResponse>
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
  },

  uploadDocument: async (file: File): Promise<{ success: boolean; data: { url: string; public_id: string; resource_type: string; format: string; bytes: number }; message: string }> => {
    try {
      const formData = new FormData();
      formData.append('document', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/upload/document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload document');
      }

      const data = await response.json();

      return {
        success: data.success,
        data: data.data,
        message: data.message
      };
    } catch (error: any) {
      throw new Error(error.message || 'Upload failed');
    }
  }
};

export default apiRequest 

// Categories API functions
export const categoriesApi = {
  getProperties: async (params: { limit?: number; city?: string; category?: string; sortBy?: string } = {}) => {
    const query = new URLSearchParams()
    if (params.limit) query.append('limit', params.limit.toString())
    if (params.city) query.append('city', params.city)
    if (params.category) query.append('category', params.category)
    if (params.sortBy) query.append('sortBy', params.sortBy)
    const qs = query.toString() ? `?${query.toString()}` : ''
    return apiRequest(`/listings${qs}`)
  },

  getJobs: async (params: { limit?: number; city?: string; sortBy?: string } = {}) => {
    const query = new URLSearchParams()
    if (params.limit) query.append('limit', params.limit.toString())
    if (params.city) query.append('city', params.city)
    if (params.sortBy) query.append('sortBy', params.sortBy)
    const qs = query.toString() ? `?${query.toString()}` : ''
    return apiRequest(`/jobs${qs}`)
  },

  getEducationPrograms: async (params: { limit?: number; city?: string; sortBy?: string } = {}) => {
    const query = new URLSearchParams()
    if (params.limit) query.append('limit', params.limit.toString())
    if (params.city) query.append('city', params.city)
    if (params.sortBy) query.append('sortBy', params.sortBy)
    const qs = query.toString() ? `?${query.toString()}` : ''
    return apiRequest(`/education/programs${qs}`)
  },

  getServices: async (params: { limit?: number; city?: string; sortBy?: string } = {}) => {
    const query = new URLSearchParams()
    if (params.limit) query.append('limit', params.limit.toString())
    if (params.city) query.append('city', params.city)
    if (params.sortBy) query.append('sortBy', params.sortBy)
    const qs = query.toString() ? `?${query.toString()}` : ''
    return apiRequest(`/listings${qs}`)
  }
}

// Promotions API functions
export const promotionsApi = {
  // Get active promotions for homepage hero
  getActiveForHomepage: async () => {
    return apiRequest('/promotions/active?placement=homepage');
  },

  // Get active top promotions for a category (rental|sale|service)
  getActiveTopForCategory: async (category: string) => {
    return apiRequest(`/promotions/active-top?category=${encodeURIComponent(category)}`);
  },

  // Track click for a promotion
  trackClick: async (promotionId: string) => {
    return apiRequest(`/promotions/${promotionId}/click`, { method: 'POST' });
  },

  // Get public config (prices, available chains)
  getPublicConfig: async () => {
    return apiRequest('/promotions/config-public');
  },

  // Create a promotion draft
  createPromotion: async (payload: { listingId: string; placement: 'homepage' | 'category_top'; durationDays: number; chain: string }) => {
    return apiRequest('/promotions', { method: 'POST', body: JSON.stringify(payload) });
  },

  // Submit payment proof
  submitPaymentProof: async (promotionId: string, txHash: string, screenshotUrl: string) => {
    return apiRequest(`/promotions/${promotionId}/payment-proof`, { method: 'PUT', body: JSON.stringify({ txHash, screenshotUrl }) });
  },

  // Get user's promotions
  getUserPromotions: async (params: any = {}) => {
    const query = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined) {
        query.append(key, params[key].toString());
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/promotions/user/promotions${qs}`);
  },
};

// Admin Promotions API
export const adminPromotionsApi = {
  list: async (params: { status?: string; placement?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.placement) query.append('placement', params.placement);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/promotions/admin/promotions${qs}`);
  },
  updateStatus: async (id: string, action: 'approve'|'reject'|'expire', durationDays?: number) => {
    return apiRequest(`/promotions/admin/promotions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ action, durationDays })
    });
  },
  getConfig: async () => {
    return apiRequest('/promotions/admin/promotion-config');
  },
  updateConfig: async (config: any) => {
    return apiRequest('/promotions/admin/promotion-config', {
      method: 'PUT',
      body: JSON.stringify(config)
    });
  }
};

// User Promotions API
export const userPromotionsApi = {
  // Get user's promotions
  getUserPromotions: async (params: any = {}) => {
    const query = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined) {
        query.append(key, params[key].toString());
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/promotions/user/promotions${qs}`);
  }
};