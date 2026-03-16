"use client";

import React, { useState } from 'react';
import { initialWatchlist } from '../lib/mockData';
import { Bell, ChevronDown, ChevronRight } from 'lucide-react';
import ItemDetailModal from './ItemDetailModal';
import type { WatchlistItem, PortfolioAsset } from '../lib/mockData';

export default function Watchlist() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Watch', 'Bag', 'Jewelry']);
  const [selectedItem, setSelectedItem] = useState<PortfolioAsset | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
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
    const assetForModal: PortfolioAsset = {
      ...item,
      portfolioId: item.watchlistId,
      purchasePrice: item.targetPrice || item.currentMarketValue,
      purchaseDate: new Date().toISOString().split('T')[0], // Use today's date as placeholder
      condition: 'N/A', // Watchlist items don't have condition yet
      serialNumber: undefined,
    };
    setSelectedItem(assetForModal);
    setIsDetailModalOpen(true);
  };

  // Group watchlist items by category
  const groupedItems = initialWatchlist.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof initialWatchlist>);

  // Define category order
  const categoryOrder = ['Jewelry', 'Watch', 'Bag'];

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
                  <span className="text-sm font-medium text-[#1A1A1A]">{formatCurrency(categoryTotal)}</span>
                </button>

                {/* Category Items */}
                {isExpanded && items.map((item) => {
                  // Use the trend percentage to determine the color of the current market value
                  // In a real app, this would be based on the 1D change specifically
                  const isPositive = item.trendPercentage >= 0;
                  const trendColor = isPositive ? 'text-[#00A82D]' : 'text-[#9B2226]';

                  return (
                    <div
                      key={item.watchlistId}
                      className="p-4 md:p-6 pl-8 md:pl-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 vault-hover border-b border-[#E8E8E3] last:border-0"
                    >
                      {/* Left: Name & Model - Clickable */}
                      <button
                        onClick={() => handleItemClick(item)}
                        className="flex-1 min-w-0 text-left"
                      >
                        <div className="font-editorial text-base md:text-lg text-[#1A1A1A] truncate">{item.brand}</div>
                        <div className="text-xs text-[#7A7A75] mt-1 uppercase tracking-wider truncate">{item.model}</div>
                      </button>

                      {/* Right: Price & Alert */}
                      <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
                        <button
                          onClick={() => handleItemClick(item)}
                          className="text-left sm:text-right"
                        >
                          <div className={`font-medium text-sm md:text-base ${trendColor}`}>{formatCurrency(item.currentMarketValue)}</div>
                          <div className="text-xs text-[#7A7A75] mt-1 uppercase tracking-wider">
                            Target: {formatCurrency(item.targetPrice || 0)}
                          </div>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Toggle alert for:', item.brand);
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
          onClose={() => setIsDetailModalOpen(false)}
          asset={selectedItem}
          isWatchlistItem={true}
        />
      )}
    </>
  );
}

