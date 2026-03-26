"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { api } from '@/lib/api';
import ItemDetailModal from './ItemDetailModal';

interface SearchResult {
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
}

interface SearchBarProps {
  onDataUpdated?: () => void;
}

export default function SearchBar({ onDataUpdated }: SearchBarProps = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [trendingItems, setTrendingItems] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showTrending, setShowTrending] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isWatchlistItem, setIsWatchlistItem] = useState(false);
  const [isSearchResult, setIsSearchResult] = useState(false);
  const [portfolioAssets, setPortfolioAssets] = useState<any[]>([]);
  const [watchlistItems, setWatchlistItems] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Load portfolio, watchlist, and trending items on mount
  useEffect(() => {
    loadUserData();
    loadTrendingItems();
  }, []);

  const loadUserData = async () => {
    try {
      const [portfolio, watchlist] = await Promise.all([
        api.getPortfolio(),
        api.getWatchlist()
      ]);
      setPortfolioAssets(portfolio);
      setWatchlistItems(watchlist);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const loadTrendingItems = async () => {
    try {
      const items = await api.getTrendingItems(5);
      
      // Transform items to match SearchResult interface
      const results: SearchResult[] = items.map((item: any) => ({
        id: item.id || item.item_id,
        brand: item.brand,
        model: item.model,
        category: item.category,
        material: item.material,
        size: item.size,
        color: item.color,
        currentMarketValue: item.currentMarketValue || item.market_value,
        retailPrice: item.retailPrice || item.retail_price,
        trend: item.trend,
        trendPercentage: item.trendPercentage || item.trend_percentage,
        mentions30Days: item.mentions30Days || item.mentions_30_days,
        imageUrl: item.imageUrl || item.image_url,
      }));
      
      setTrendingItems(results);
    } catch (error) {
      console.error('Failed to load trending items:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setShowTrending(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    try {
      setIsSearching(true);
      const items = await api.getItems({ search: query, limit: 10 });
      
      // Transform items to match SearchResult interface
      const results: SearchResult[] = items.map((item: any) => ({
        id: item.id || item.item_id,
        brand: item.brand,
        model: item.model,
        category: item.category,
        material: item.material,
        size: item.size,
        color: item.color,
        currentMarketValue: item.currentMarketValue || item.market_value,
        retailPrice: item.retailPrice || item.retail_price,
        trend: item.trend,
        trendPercentage: item.trendPercentage || item.trend_percentage,
        mentions30Days: item.mentions30Days || item.mentions_30_days,
        imageUrl: item.imageUrl || item.image_url,
      }));
      
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    // Show trending items when search is cleared
    if (trendingItems.length > 0) {
      setShowTrending(true);
    }
  };

  const handleItemClick = async (item: SearchResult) => {
    setShowResults(false);
    
    // Reload user data to get latest portfolio and watchlist
    await loadUserData();
    
    // Check if item is in portfolio
    const portfolioItem = portfolioAssets.find((asset: any) => asset.item_id === item.id);
    
    // Check if item is in watchlist (watchlist uses itemId in camelCase)
    const watchlistItem = watchlistItems.find((wItem: any) => wItem.itemId === item.id);
    
    if (portfolioItem) {
      // Item is in portfolio - show portfolio modal
      setSelectedItem(portfolioItem);
      setIsWatchlistItem(false);
      setIsSearchResult(false);
    } else if (watchlistItem) {
      // Item is in watchlist - show watchlist modal
      // Convert WatchlistItem to PortfolioAsset format (same as Watchlist.tsx does)
      const itemDetails = {
        item_id: watchlistItem.itemId,
        category: watchlistItem.category,
        brand: watchlistItem.brand,
        model: watchlistItem.model,
        image_url: watchlistItem.imageUrl,
        market_value: watchlistItem.currentMarketValue,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const assetForModal = {
        portfolio_id: watchlistItem.watchlistId,
        user_id: '',
        item_id: watchlistItem.itemId,
        purchase_price: watchlistItem.targetPrice || watchlistItem.currentMarketValue,
        purchase_date: new Date().toISOString().split('T')[0],
        quantity: 1,
        material: watchlistItem.material,
        size: watchlistItem.size,
        color: watchlistItem.color,
        serial_number: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        item_details: itemDetails,
        current_market_value: watchlistItem.currentMarketValue,
        total_value: watchlistItem.currentMarketValue,
        gain_loss: 0,
        gain_loss_percentage: 0,
        // Include alert data for watchlist items
        alertType: watchlistItem.alertType,
        alertThreshold: watchlistItem.alertThreshold,
        alertActive: watchlistItem.alertActive,
        // Include retail price and trend data from watchlist item
        retailPrice: watchlistItem.retailPrice,
        retail_price: watchlistItem.retailPrice,
        trendPercentage: watchlistItem.trendPercentage,
        trend_percentage: watchlistItem.trendPercentage,
      };
      
      setSelectedItem(assetForModal);
      setIsWatchlistItem(true);
      setIsSearchResult(false);
    } else {
      // Item is not in portfolio or watchlist - show search result modal
      const itemDetails = {
        item_id: item.id,
        category: item.category,
        brand: item.brand,
        model: item.model,
        image_url: item.imageUrl || '',
        market_value: item.currentMarketValue || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const searchResultAsset = {
        portfolio_id: '',
        user_id: '',
        item_id: item.id,
        purchase_price: 0,
        purchase_date: '',
        quantity: 1,
        notes: '',
        material: item.material,
        size: item.size,
        color: item.color,
        serial_number: '',
        created_at: '',
        updated_at: '',
        item_details: itemDetails,
        current_market_value: item.currentMarketValue || 0,
        total_value: item.currentMarketValue || 0,
        gain_loss: 0,
        gain_loss_percentage: 0,
        trendPercentage: item.trendPercentage,
        trend_percentage: item.trendPercentage,
        retailPrice: item.retailPrice,
        retail_price: item.retailPrice,
        trend: item.trend,
      };
      
      setSelectedItem(searchResultAsset);
      setIsWatchlistItem(false);
      setIsSearchResult(true);
    }
  };

  const handleModalClose = () => {
    setSelectedItem(null);
    setIsWatchlistItem(false);
    setIsSearchResult(false);
    // Reload user data in case they added to watchlist
    loadUserData();
    // Notify parent to refresh dashboard
    if (onDataUpdated) {
      onDataUpdated();
    }
  };

  return (
    <>
      <div className="relative" ref={searchRef}>
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#7A7A75]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowResults(true);
              } else if (searchQuery.trim().length === 0 && trendingItems.length > 0) {
                setShowTrending(true);
              }
            }}
            placeholder="Search luxury items..."
            className="w-full pl-10 pr-10 py-2 border border-[#E8E8E3] bg-white text-sm text-[#1A1A1A] placeholder-[#7A7A75] focus:outline-none focus:border-[#1A1A1A] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-[#1A1A1A] text-[#7A7A75] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Trending Items Dropdown */}
        {showTrending && !searchQuery && trendingItems.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E8E8E3] shadow-lg max-h-96 overflow-y-auto z-50">
            <div className="px-4 py-2 bg-[#F5F5F0] border-b border-[#E8E8E3]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#1A1A1A] uppercase tracking-wider">
                  🔥 Trending Now
                </span>
              </div>
            </div>
            {trendingItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  handleItemClick(item);
                  setShowTrending(false);
                }}
                className="w-full px-4 py-3 hover:bg-[#F5F5F0] transition-colors text-left border-b border-[#E8E8E3] last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  {item.imageUrl && (
                    <div className="w-12 h-12 bg-[#F5F5F0] flex-shrink-0 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={`${item.brand} ${item.model}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#1A1A1A] text-sm">
                        {item.brand}
                      </span>
                      <span className="text-xs text-[#7A7A75] uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-sm text-[#7A7A75] truncate">
                      {item.model}
                    </div>
                    {item.currentMarketValue && (
                      <div className="text-xs text-[#1A1A1A] font-medium mt-1">
                        ${item.currentMarketValue.toLocaleString()}
                      </div>
                    )}
                    {item.mentions30Days && (
                      <div className="text-xs text-[#7A7A75] mt-0.5">
                        {item.mentions30Days.toLocaleString()} mentions
                      </div>
                    )}
                  </div>
                  {item.trend && (
                    <div className={`text-xs font-medium ${
                      item.trend === 'up' ? 'text-green-600' :
                      item.trend === 'down' ? 'text-red-600' :
                      'text-[#7A7A75]'
                    }`}>
                      {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'}
                      {item.trendPercentage ? ` ${Math.abs(item.trendPercentage)}%` : ''}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E8E8E3] shadow-lg max-h-96 overflow-y-auto z-50">
            {searchResults.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="w-full px-4 py-3 hover:bg-[#F5F5F0] transition-colors text-left border-b border-[#E8E8E3] last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  {item.imageUrl && (
                    <div className="w-12 h-12 bg-[#F5F5F0] flex-shrink-0 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={`${item.brand} ${item.model}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#1A1A1A] text-sm">
                        {item.brand}
                      </span>
                      <span className="text-xs text-[#7A7A75] uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-sm text-[#7A7A75] truncate">
                      {item.model}
                    </div>
                    {item.currentMarketValue && (
                      <div className="text-xs text-[#1A1A1A] font-medium mt-1">
                        ${item.currentMarketValue.toLocaleString()}
                      </div>
                    )}
                  </div>
                  {item.trend && (
                    <div className={`text-xs font-medium ${
                      item.trend === 'up' ? 'text-green-600' :
                      item.trend === 'down' ? 'text-red-600' :
                      'text-[#7A7A75]'
                    }`}>
                      {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'}
                      {item.trendPercentage ? ` ${Math.abs(item.trendPercentage)}%` : ''}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {showResults && searchQuery.trim().length >= 2 && searchResults.length === 0 && !isSearching && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E8E8E3] shadow-lg z-50 px-4 py-6 text-center">
            <p className="text-sm text-[#7A7A75]">No items found for "{searchQuery}"</p>
          </div>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E8E8E3] shadow-lg z-50 px-4 py-6 text-center">
            <p className="text-sm text-[#7A7A75]">Searching...</p>
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          isOpen={true}
          onClose={handleModalClose}
          asset={selectedItem}
          isWatchlistItem={isWatchlistItem}
          isSearchResult={isSearchResult}
          onAssetUpdated={loadUserData}
        />
      )}
    </>
  );
}
