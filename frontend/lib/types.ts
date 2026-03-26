/**
 * Type definitions for the Smart Asset Collector application
 */

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
}

export interface LuxuryItem {
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
}

export interface PortfolioAsset {
  portfolio_id: string;
  user_id: string;
  item_id: string;
  purchase_price: number;
  purchase_date: string;
  quantity: number;
  notes?: string;
  material?: string;
  size?: string;
  color?: string;
  serial_number?: string;
  created_at: string;
  updated_at: string;
  item_details: LuxuryItem;
  current_market_value: number;
  total_value: number;
  gain_loss: number;
  gain_loss_percentage: number;
}

export interface PortfolioAnalytics {
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
}

// Notification types
export interface NotificationPreferences {
  inApp: boolean;
  email: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'price_alert' | 'system';
  title: string;
  message: string;
  itemId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Price Alert types
export type PriceAlertCondition = 'above' | 'below' | 'percentage_up' | 'percentage_down';

export interface PriceAlertUpdate {
  alertActive: boolean;
  alertCondition?: PriceAlertCondition;
  alertTargetPrice?: number;
  alertThresholdPercent?: number;
  notificationPrefs: NotificationPreferences;
}

export interface WatchlistItem {
  watchlistId: string;
  itemId: string;
  brand: string;
  model: string;
  category: string;
  material?: string;
  size?: string;
  color?: string;
  currentMarketValue: number;
  retailPrice?: number;
  trend: string;
  trendPercentage: number;
  mentions30Days?: number;
  imageUrl?: string;
  targetPrice?: number;
  alertActive: boolean;
  alertType: string;
  alertThreshold: number;
  alertCondition?: PriceAlertCondition;
  alertTargetPrice?: number;
  alertThresholdPercent?: number;
  notificationPrefs?: NotificationPreferences;
  lastNotifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Legacy types for compatibility with existing components
export interface PortfolioAssetLegacy {
  portfolioId: string;
  category: string;
  brand: string;
  model: string;
  purchasePrice: number;
  currentMarketValue: number;
  purchaseDate: string;
  imageUrl?: string;
  trendPercentage: number;
}
