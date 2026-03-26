"use client";

import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, ChevronRight } from 'lucide-react';
import ItemDetailModal from './ItemDetailModal';
import { api } from '../lib/api';
import { PortfolioAsset, LuxuryItem } from '../lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { convertAndFormatCurrency } from '@/lib/currency';

interface WatchlistItem {
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
}

interface WatchlistProps {
  refreshTrigger?: number;
}

export default function Watchlist({ refreshTrigger }: WatchlistProps = {}) {
  const { user } = useAuth();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Watch', 'Bag', 'Jewelry']);
  const [selectedItem, setSelectedItem] = useState<PortfolioAsset | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currency = user?.currency || 'USD';

  // Fetch watchlist data from API
  useEffect(() => {
    fetchWatchlist();
  }, [currency, refreshTrigger]); // Re-fetch when currency or refreshTrigger changes

  const fetchWatchlist = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const items = await api.getWatchlist();
      setWatchlistItems(items);
    } catch (err) {
      console.error('Error fetching watchlist:', err);
      setError('Failed to load watchlist');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrencyValue = (value: number) => {
    return convertAndFormatCurrency(value, currency, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleItemClick = (item: WatchlistItem) => {
    // Convert WatchlistItem to PortfolioAsset format for the modal
    const itemDetails: LuxuryItem = {
      item_id: item.itemId,
      category: item.category,
      brand: item.brand,
      model: item.model,
      image_url: item.imageUrl,
      market_value: item.currentMarketValue,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const assetForModal: PortfolioAsset & { alertType?: string; alertThreshold?: number; alertActive?: boolean; retailPrice?: number; retail_price?: number; trendPercentage?: number; trend_percentage?: number } = {
      portfolio_id: item.watchlistId,
      user_id: '', // Not needed for watchlist items
      item_id: item.itemId,
      purchase_price: item.targetPrice || item.currentMarketValue,
      purchase_date: new Date().toISOString().split('T')[0],
      quantity: 1,
      material: item.material,
      size: item.size,
      color: item.color,
      serial_number: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      item_details: itemDetails,
      current_market_value: item.currentMarketValue,
      total_value: item.currentMarketValue,
      gain_loss: 0,
      gain_loss_percentage: 0,
      // Include alert data for watchlist items
      alertType: item.alertType,
      alertThreshold: item.alertThreshold,
      alertActive: item.alertActive,
      // Include retail price and trend data from watchlist item
      retailPrice: item.retailPrice,
      retail_price: item.retailPrice,
      trendPercentage: item.trendPercentage,
      trend_percentage: item.trendPercentage,
    };
    setSelectedItem(assetForModal);
    setIsDetailModalOpen(true);
  };

  const handleModalClose = () => {
    setIsDetailModalOpen(false);
    // Refresh watchlist after modal closes (in case changes were made)
    fetchWatchlist();
  };

  // Group watchlist items by category
  const groupedItems = watchlistItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, WatchlistItem[]>);

  // Define category order
  const categoryOrder = ['Jewelry', 'Watch', 'Bag'];

  if (isLoading) {
    return (
      <div className="vault-card mt-6 md:mt-8">
        <div className="p-4 md:p-6 border-b border-[#E8E8E3] bg-[#FAF9F6]">
          <h2 className="font-editorial text-xl md:text-2xl text-[#1A1A1A]">Watchlist</h2>
        </div>
        <div className="p-8 text-center text-[#7A7A75]">
          Loading watchlist...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vault-card mt-6 md:mt-8">
        <div className="p-4 md:p-6 border-b border-[#E8E8E3] bg-[#FAF9F6]">
          <h2 className="font-editorial text-xl md:text-2xl text-[#1A1A1A]">Watchlist</h2>
        </div>
        <div className="p-8 text-center text-[#9B2226]">
          {error}
        </div>
      </div>
    );
  }

  if (watchlistItems.length === 0) {
    return (
      <div className="vault-card mt-6 md:mt-8">
        <div className="p-4 md:p-6 border-b border-[#E8E8E3] bg-[#FAF9F6]">
          <h2 className="font-editorial text-xl md:text-2xl text-[#1A1A1A]">Watchlist</h2>
        </div>
        <div className="p-8 md:p-12 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#F5F5F0] border border-[#E8E8E3] rounded-full flex items-center justify-center">
              <Bell className="w-7 h-7 text-[#7A7A75]" />
            </div>
            <h3 className="font-editorial text-xl text-[#1A1A1A] mb-2">No Items Tracked</h3>
            <p className="text-sm text-[#7A7A75] max-w-xs mx-auto">
              Search the catalog to discover luxury items and add them to your watchlist for price tracking.
            </p>
          </div>
          <button
            onClick={() => {
              // Focus on the search bar in the header
              const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
              if (searchInput) {
                searchInput.focus();
                searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] text-[#FAF9F6] text-xs uppercase tracking-widest hover:bg-[#333333] transition-colors"
          >
            <Bell className="w-4 h-4" />
            Discover Assets
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="vault-card mt-6 md:mt-8">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-[#E8E8E3] bg-[#FAF9F6]">
          <h2 className="font-editorial text-xl md:text-2xl text-[#1A1A1A]">Watchlist</h2>
        </div>

        {/* Categorized List */}
        <div className="flex flex-col">
          {categoryOrder.map((category) => {
            const items = groupedItems[category] || [];
            if (items.length === 0) return null;
            
            const isExpanded = expandedCategories.includes(category);
            const categoryTotal = items.reduce((sum, item) => sum + item.currentMarketValue, 0);

            return (
              <div key={category}>
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full p-3 md:p-4 flex justify-between items-center vault-hover border-b border-[#E8E8E3] bg-[#F5F5F0]"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#7A7A75]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#7A7A75]" />
                    )}
                    <span className="text-xs font-medium text-[#7A7A75] uppercase tracking-widest">
                      {category === 'Watch' ? 'Watches' : category === 'Bag' ? 'Bags' : category}
                    </span>
                    <span className="text-xs text-[#7A7A75]">({items.length})</span>
                  </div>
                  <span className="text-sm font-medium text-[#1A1A1A]">{formatCurrencyValue(categoryTotal)}</span>
                </button>

                {/* Category Items */}
                {isExpanded && items.map((item) => {
                  const isPositive = item.trendPercentage >= 0;
                  const trendColor = isPositive ? 'text-[#00A82D]' : 'text-[#9B2226]';

                  return (
                    <div
                      key={item.watchlistId}
                      className="p-4 md:p-6 pl-8 md:pl-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 vault-hover border-b border-[#E8E8E3] last:border-0"
                    >
                      {/* Left: Image, Name & Model - Clickable */}
                      <button
                        onClick={() => handleItemClick(item)}
                        className="flex items-center gap-4 flex-1 min-w-0 text-left"
                      >
                        {/* Product Image */}
                        <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 bg-[#F5F5F0] border border-[#E8E8E3] overflow-hidden">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={`${item.brand} ${item.model}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#7A7A75] text-[10px]">
                              No Image
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-editorial text-base md:text-lg text-[#1A1A1A] truncate">{item.brand}</div>
                          <div className="text-xs text-[#7A7A75] mt-1 uppercase tracking-wider truncate">{item.model}</div>
                        </div>
                      </button>

                      {/* Right: Price & Alert */}
                      <div className="flex items-center gap-3 md:gap-4 flex-shrink-0 mt-2 sm:mt-0 ml-16 sm:ml-0">
                        <button
                          onClick={() => handleItemClick(item)}
                          className="text-left sm:text-right"
                        >
                          <div className={`font-medium text-sm md:text-base ${trendColor}`}>{formatCurrencyValue(item.currentMarketValue)}</div>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick(item);
                          }}
                          className={`p-2 rounded-full transition-colors ${item.alertActive ? 'bg-[#1A1A1A] text-[#FAF9F6]' : 'bg-[#E8E8E3] text-[#7A7A75]'}`}
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Item Detail Modal */}
      {isDetailModalOpen && (
        <ItemDetailModal 
          isOpen={isDetailModalOpen}
          onClose={handleModalClose}
          asset={selectedItem}
          isWatchlistItem={true}
          onAssetUpdated={fetchWatchlist}
        />
      )}
    </>
  );
}
