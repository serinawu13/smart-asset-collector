/**
 * API Client for Smart Asset Collector Backend
 * Base URL: http://localhost:8000/api/v1
 */

const API_BASE_URL = typeof window !== 'undefined'
  ? (window as any).ENV?.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
  : 'http://localhost:8000/api/v1';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Get authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

/**
 * Set authentication token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
}

/**
 * Remove authentication token from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
}

/**
 * Generic API request function with authentication support
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge with any additional headers from options
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      const errorData = isJson ? await response.json() : { detail: response.statusText };
      throw new ApiError(
        errorData.detail || 'An error occurred',
        response.status,
        errorData
      );
    }

    // Return parsed JSON or empty object for 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return isJson ? await response.json() : ({} as T);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred',
      0
    );
  }
}

/**
 * API Client object with all endpoint methods
 */
export const api = {
  // ==================== Authentication ====================
  
  /**
   * Sign up a new user
   */
  signup: async (data: { name: string; email: string; password: string }) => {
    return apiRequest<{
      user: {
        id: string;
        name: string;
        email: string;
        currency: string;
      };
      token: string;
    }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Login existing user
   */
  login: async (data: { email: string; password: string }) => {
    return apiRequest<{
      user: {
        id: string;
        name: string;
        email: string;
        currency: string;
      };
      token: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Logout current user
   */
  logout: async () => {
    return apiRequest<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  },

  /**
   * Get current user information
   */
  getCurrentUser: async () => {
    return apiRequest<{
      id: string;
      name: string;
      email: string;
      currency: string;
    }>('/auth/me');
  },

  // ==================== Portfolio ====================

  /**
   * Get user's portfolio assets
   */
  getPortfolio: async () => {
    const response = await apiRequest<{
      assets: Array<{
        portfolioId: string;
        itemId: string;
        brand: string;
        model: string;
        category: string;
        purchasePrice: number;
        purchaseDate: string;
        condition: string;
        serialNumber?: string;
        material: string;
        size: string;
        color?: string;
        currentMarketValue: number;
        retailPrice?: number;
        trend: string;
        trendPercentage: number;
        imageUrl?: string;
        alertActive?: boolean;
        alertType?: string;
        alertThreshold?: number;
      }>;
    }>('/portfolio');
    
    // Transform the flat camelCase response to match frontend expectations
    const transformedAssets = (response.assets || []).map((asset: any) => {
      const transformed = {
        portfolio_id: asset.portfolioId,
        user_id: '', // Not provided by backend
        item_id: asset.itemId,
        purchase_price: asset.purchasePrice,
        purchase_date: asset.purchaseDate,
        quantity: 1, // Default to 1
        notes: asset.serialNumber ? `Serial: ${asset.serialNumber}` : undefined,
        created_at: '', // Not provided
        updated_at: '', // Not provided
        material: asset.material,
        size: asset.size,
        color: asset.color,
        serial_number: asset.serialNumber,
        alertActive: asset.alertActive ?? false,
        alertType: asset.alertType ?? 'none',
        alertThreshold: asset.alertThreshold ?? 5,
        // Include trend and retail price data from backend (both camelCase and snake_case)
        trendPercentage: asset.trendPercentage,
        trend_percentage: asset.trendPercentage,
        retailPrice: asset.retailPrice,
        retail_price: asset.retailPrice,
        item_details: {
          item_id: asset.itemId,
          category: asset.category,
          brand: asset.brand,
          model: asset.model,
          reference_number: asset.serialNumber,
          year: undefined,
          condition: asset.condition,
          description: undefined,
          image_url: asset.imageUrl,
          created_at: '',
          updated_at: '',
          market_value: asset.currentMarketValue,
        },
        current_market_value: asset.currentMarketValue,
        total_value: asset.currentMarketValue, // Assuming quantity is 1
        gain_loss: asset.currentMarketValue - asset.purchasePrice,
        gain_loss_percentage: ((asset.currentMarketValue - asset.purchasePrice) / asset.purchasePrice) * 100,
      };
      
      return transformed;
    });
    
    return transformedAssets;
  },

  /**
   * Add asset to portfolio
   */
  addToPortfolio: async (data: {
    itemId: string;
    purchasePrice: number;
    purchaseDate: string;
    condition: string;
    material: string;
    size: string;
    color?: string;
    serialNumber?: string;
  }) => {
    return apiRequest<{
      portfolioId: string;
      itemId: string;
      brand: string;
      model: string;
      category: string;
      purchasePrice: number;
      purchaseDate: string;
      condition: string;
      serialNumber?: string;
      material: string;
      size: string;
      color?: string;
      currentMarketValue: number;
      retailPrice?: number;
      trend: string;
      trendPercentage: number;
      imageUrl?: string;
    }>('/portfolio', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get portfolio analytics
   */
  getPortfolioAnalytics: async () => {
    return apiRequest<{
      total_value: number;
      total_cost: number;
      total_gain_loss: number;
      total_gain_loss_percentage: number;
      total_items: number;
      category_breakdown: Array<{
        category: string;
        count: number;
        total_value: number;
        percentage: number;
      }>;
      top_performers: Array<{
        portfolio_id: string;
        brand: string;
        model: string;
        gain_loss_percentage: number;
      }>;
      recent_acquisitions: Array<{
        portfolio_id: string;
        brand: string;
        model: string;
        purchase_date: string;
        purchase_price: number;
      }>;
    }>('/portfolio/analytics');
  },

  /**
   * Update portfolio asset
   */
  updatePortfolioAsset: async (
    portfolioId: string,
    data: {
      purchasePrice?: number;
      purchaseDate?: string;
      condition?: string;
      material?: string;
      size?: string;
      color?: string;
      serialNumber?: string;
      alertActive?: boolean;
      alertType?: string;
      alertThreshold?: number;
    }
  ) => {
    return apiRequest<{
      asset: {
        portfolioId: string;
        itemId: string;
        brand: string;
        model: string;
        category: string;
        purchasePrice: number;
        purchaseDate: string;
        condition: string;
        serialNumber?: string;
        material: string;
        size: string;
        color?: string;
        currentMarketValue: number;
        retailPrice?: number;
        trend: string;
        trendPercentage: number;
        imageUrl?: string;
      };
      message: string;
    }>(`/portfolio/${portfolioId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete portfolio asset
   */
  deletePortfolioAsset: async (portfolioId: string) => {
    return apiRequest<{ message: string }>(`/portfolio/${portfolioId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Sell/liquidate portfolio asset
   */
  sellPortfolioAsset: async (
    portfolioId: string,
    data: {
      salePrice: number;
      saleDate: string;
    }
  ) => {
    return apiRequest<{
      message: string;
      realizedGain: number;
      realizedROI: number;
    }>(`/portfolio/${portfolioId}/sell`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ==================== Luxury Items ====================

  /**
   * Get all luxury items (catalog)
   */
  getItems: async (params?: {
    category?: string;
    brand?: string;
    search?: string;
    skip?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.brand) queryParams.append('brand', params.brand);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/items?${queryString}` : '/items';
    
    const response = await apiRequest<{
      items: Array<{
        id: string;
        item_id?: string;
        category: string;
        brand: string;
        model: string;
        reference_number?: string;
        year?: number;
        condition?: string;
        description?: string;
        image_url?: string;
        imageUrl?: string;
        market_value?: number;
        currentMarketValue?: number;
        created_at?: string;
        updated_at?: string;
      }>;
    }>(endpoint);
    
    // Return the items array directly for easier consumption
    return response.items || [];
  },

  /**
   * Get trending luxury items
   */
  getTrendingItems: async (limit?: number) => {
    const queryParams = new URLSearchParams();
    if (limit !== undefined) queryParams.append('limit', limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/items/trending?${queryString}` : '/items/trending';
    
    const response = await apiRequest<{
      items: Array<{
        id: string;
        brand: string;
        model: string;
        category: string;
        material?: string;
        size?: string;
        color?: string;
        currentMarketValue?: number;
        retailPrice?: number;
        trend?: string;
        trendPercentage?: number;
        mentions30Days?: number;
        imageUrl?: string;
      }>;
    }>(endpoint);
    
    // Return the items array directly for easier consumption
    return response.items || [];
  },

  /**
   * Get single luxury item by ID
   */
  getItemById: async (itemId: string) => {
    return apiRequest<{
      item_id: string;
      category: string;
      brand: string;
      model: string;
      reference_number?: string;
      year?: number;
      condition?: string;
      description?: string;
      image_url?: string;
      market_value: number;
      created_at: string;
      updated_at: string;
    }>(`/items/${itemId}`);
  },

  /**
   * Create new luxury item
   */
  createItem: async (data: {
    category: string;
    brand: string;
    model: string;
    reference_number?: string;
    year?: number;
    condition?: string;
    description?: string;
    image_url?: string;
    market_value: number;
  }) => {
    return apiRequest<{
      item_id: string;
      category: string;
      brand: string;
      model: string;
      reference_number?: string;
      year?: number;
      condition?: string;
      description?: string;
      image_url?: string;
      market_value: number;
      created_at: string;
      updated_at: string;
    }>('/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update luxury item
   */
  updateItem: async (
    itemId: string,
    data: {
      category?: string;
      brand?: string;
      model?: string;
      reference_number?: string;
      year?: number;
      condition?: string;
      description?: string;
      image_url?: string;
      market_value?: number;
    }
  ) => {
    return apiRequest<{
      item_id: string;
      category: string;
      brand: string;
      model: string;
      reference_number?: string;
      year?: number;
      condition?: string;
      description?: string;
      image_url?: string;
      market_value: number;
      created_at: string;
      updated_at: string;
    }>(`/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete luxury item
   */
  deleteItem: async (itemId: string) => {
    return apiRequest<{ message: string }>(`/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  // ==================== Watchlist ====================

  /**
   * Get user's watchlist items
   */
  getWatchlist: async () => {
    const response = await apiRequest<{
      items: Array<{
        watchlistId: string;
        itemId: string;
        brand: string;
        model: string;
        category: string;
        currentMarketValue: number;
        retailPrice?: number;
        trend: string;
        trendPercentage: number;
        targetPrice?: number;
        alertActive: boolean;
        alertType: string;
        alertThreshold: number;
        imageUrl?: string;
        material?: string;
        size?: string;
        color?: string;
      }>;
    }>('/watchlist');
    
    // Transform watchlist items to include both camelCase and snake_case for compatibility
    const transformedItems = (response.items || []).map((item: any) => ({
      ...item,
      // Add snake_case versions for compatibility with ItemDetailModal
      trend_percentage: item.trendPercentage,
      retail_price: item.retailPrice,
      current_market_value: item.currentMarketValue,
      item_details: {
        brand: item.brand,
        model: item.model,
        category: item.category,
        image_url: item.imageUrl,
        market_value: item.currentMarketValue,
      },
    }));
    
    return transformedItems;
  },

  /**
   * Add item to watchlist
   */
  addToWatchlist: async (data: {
    itemId: string;
    targetPrice?: number;
    alertActive: boolean;
    alertType: string;
    alertThreshold: number;
  }) => {
    return apiRequest<{
      item: {
        watchlistId: string;
        itemId: string;
        brand: string;
        model: string;
        category: string;
        currentMarketValue: number;
        targetPrice?: number;
        alertActive: boolean;
        alertType: string;
        alertThreshold: number;
        imageUrl?: string;
      };
      message: string;
    }>('/watchlist', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update watchlist item
   */
  updateWatchlistItem: async (
    watchlistId: string,
    data: {
      targetPrice?: number;
      alertActive?: boolean;
      alertType?: string;
      alertThreshold?: number;
      material?: string;
      size?: string;
      color?: string;
    }
  ) => {
    return apiRequest<{
      item: {
        watchlistId: string;
        itemId: string;
        brand: string;
        model: string;
        category: string;
        currentMarketValue: number;
        targetPrice?: number;
        alertActive: boolean;
        alertType: string;
        alertThreshold: number;
        imageUrl?: string;
      };
      message: string;
    }>(`/watchlist/${watchlistId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete watchlist item
   */
  deleteWatchlistItem: async (watchlistId: string) => {
    return apiRequest<{ message: string }>(`/watchlist/${watchlistId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Update price alert for watchlist item
   */
  updatePriceAlert: async (
    watchlistId: string,
    data: {
      alertActive: boolean;
      alertCondition?: 'above' | 'below' | 'percentage_up' | 'percentage_down';
      alertTargetPrice?: number;
      alertThresholdPercent?: number;
      notificationPrefs: {
        inApp: boolean;
        email: boolean;
      };
    }
  ) => {
    return apiRequest<{
      item: {
        watchlistId: string;
        itemId: string;
        brand: string;
        model: string;
        category: string;
        currentMarketValue: number;
        targetPrice?: number;
        alertActive: boolean;
        alertCondition?: string;
        alertTargetPrice?: number;
        alertThresholdPercent?: number;
        notificationPrefs?: {
          inApp: boolean;
          email: boolean;
        };
        imageUrl?: string;
      };
      message: string;
    }>(`/watchlist/${watchlistId}/alert`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // ==================== Notifications ====================

  /**
   * Get user's notifications (paginated)
   */
  getNotifications: async (page: number = 1, pageSize: number = 20) => {
    return apiRequest<{
      notifications: Array<{
        id: string;
        userId: string;
        type: 'price_alert' | 'system';
        title: string;
        message: string;
        itemId?: string;
        isRead: boolean;
        createdAt: string;
      }>;
      total: number;
      page: number;
      pageSize: number;
      hasMore: boolean;
    }>(`/notifications?page=${page}&page_size=${pageSize}`);
  },

  /**
   * Get unread notification count
   */
  getUnreadNotificationCount: async () => {
    return apiRequest<{
      count: number;
    }>('/notifications/unread-count');
  },

  /**
   * Mark notification as read
   */
  markNotificationRead: async (notificationId: string) => {
    return apiRequest<{
      message: string;
    }>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  /**
   * Mark all notifications as read
   */
  markAllNotificationsRead: async () => {
    return apiRequest<{
      message: string;
      count: number;
    }>('/notifications/read-all', {
      method: 'PUT',
    });
  },

  // ==================== Settings ====================

  /**
   * Get user settings
   */
  getSettings: async () => {
    return apiRequest<{
      currency: string;
      notificationPrefs: {
        inApp: boolean;
        email: boolean;
      };
    }>('/settings');
  },

  /**
   * Update user settings
   */
  updateSettings: async (data: {
    currency?: string;
    notificationPrefs?: {
      inApp: boolean;
      email: boolean;
    };
  }) => {
    return apiRequest<{
      settings: {
        currency: string;
        notificationPrefs: {
          inApp: boolean;
          email: boolean;
        };
      };
      message: string;
    }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // ==================== Market News ====================

  /**
   * Get market news articles
   */
  getNews: async (limit?: number) => {
    const queryParams = new URLSearchParams();
    if (limit !== undefined) queryParams.append('limit', limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/news?${queryString}` : '/news';
    
    return apiRequest<{
      articles: Array<{
        id: string;
        source: string;
        title: string;
        date: string;
        category: string;
        url: string;
        image_url?: string;
      }>;
    }>(endpoint);
  },
};

export default api;
