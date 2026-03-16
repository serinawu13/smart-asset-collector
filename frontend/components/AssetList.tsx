"use client";

import React, { useState } from 'react';
import { initialPortfolio } from '../lib/mockData';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import ItemDetailModal from './ItemDetailModal';
import type { PortfolioAsset } from '../lib/mockData';

interface AssetListProps {
  onAddClick: () => void;
}

export default function AssetList({ onAddClick }: AssetListProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Watch', 'Bag', 'Jewelry']);
  const [selectedAsset, setSelectedAsset] = useState<PortfolioAsset | null>(null);
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

  const handleAssetClick = (asset: PortfolioAsset) => {
    setSelectedAsset(asset);
    setIsDetailModalOpen(true);
  };

  // Group assets by category
  const groupedAssets = initialPortfolio.reduce((acc, asset) => {
    if (!acc[asset.category]) {
      acc[asset.category] = [];
    }
    acc[asset.category].push(asset);
    return acc;
  }, {} as Record<string, typeof initialPortfolio>);

  // Define category order
  const categoryOrder = ['Watch', 'Jewelry', 'Bag'];

  return (
    <>
      <div className="vault-card">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-[#E8E8E3] flex justify-between items-center bg-[#FAF9F6]">
          <h2 className="font-editorial text-xl md:text-2xl text-[#1A1A1A]">Collection</h2>
          <button 
            onClick={onAddClick}
            className="p-2 border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#FAF9F6] transition-colors text-[#1A1A1A] flex items-center gap-2 text-xs uppercase tracking-widest font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Acquire</span>
          </button>
        </div>

        {/* Categorized List */}
        <div className="flex flex-col">
          {categoryOrder.map((category) => {
            const assets = groupedAssets[category] || [];
            if (assets.length === 0) return null;
            
            const isExpanded = expandedCategories.includes(category);
            const categoryTotal = assets.reduce((sum, asset) => sum + asset.currentMarketValue, 0);

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
                    <span className="text-xs text-[#7A7A75]">({assets.length})</span>
                  </div>
                  <span className="text-sm font-medium text-[#1A1A1A]">{formatCurrency(categoryTotal)}</span>
                </button>

                {/* Category Items */}
                {isExpanded && assets.map((asset) => {
                  // Use the trend percentage to determine the color of the current market value
                  // In a real app, this would be based on the 1D change specifically
                  const isPositive = asset.trendPercentage >= 0;
                  const trendColor = isPositive ? 'text-[#00A82D]' : 'text-[#9B2226]';

                  return (
                    <button
                      key={asset.portfolioId}
                      onClick={() => handleAssetClick(asset)}
                      className="w-full p-4 md:p-6 pl-8 md:pl-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 vault-hover border-b border-[#E8E8E3] last:border-0 text-left"
                    >
                      {/* Left: Name & Model */}
                      <div className="flex-1 min-w-0">
                        <div className="font-editorial text-base md:text-lg text-[#1A1A1A] truncate">{asset.brand}</div>
                        <div className="text-xs text-[#7A7A75] mt-1 uppercase tracking-wider truncate">{asset.model}</div>
                      </div>

                      {/* Right: Price Only (Color-coded) */}
                      <div className="text-left sm:text-right flex-shrink-0">
                        <div className={`font-medium text-sm md:text-base ${trendColor}`}>{formatCurrency(asset.currentMarketValue)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Item Detail Modal */}
      <ItemDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        asset={selectedAsset}
      />
    </>
  );
}

