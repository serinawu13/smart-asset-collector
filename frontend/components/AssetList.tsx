"use client";

import React from 'react';
import { initialPortfolio } from '../lib/mockData';
import { Plus } from 'lucide-react';

interface AssetListProps {
  onAddClick: () => void;
}

export default function AssetList({ onAddClick }: AssetListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="vault-card">
      {/* Header */}
      <div className="p-6 border-b border-[#E8E8E3] flex justify-between items-center bg-[#FAF9F6]">
        <h2 className="font-editorial text-2xl text-[#1A1A1A]">Collection</h2>
        <button 
          onClick={onAddClick}
          className="p-2 border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#FAF9F6] transition-colors text-[#1A1A1A] flex items-center gap-2 text-xs uppercase tracking-widest font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Acquire</span>
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col">
        {initialPortfolio.map((asset) => {
          const isPositive = asset.trendPercentage >= 0;
          const trendColor = isPositive ? 'text-[#1E3F20]' : 'text-[#722F37]';

          return (
            <div key={asset.portfolioId} className="p-6 flex justify-between items-center vault-hover border-b border-[#E8E8E3] last:border-0">
              {/* Left: Name & Category */}
              <div>
                <div className="font-editorial text-lg text-[#1A1A1A]">{asset.brand}</div>
                <div className="text-xs text-[#7A7A75] mt-1 uppercase tracking-wider">{asset.category} • {asset.model}</div>
              </div>

              {/* Right: Price & Trend */}
              <div className="text-right">
                <div className="font-medium text-[#1A1A1A]">{formatCurrency(asset.currentMarketValue)}</div>
                <div className={`text-xs font-medium mt-1 uppercase tracking-wider ${trendColor}`}>
                  {isPositive ? '+' : ''}{asset.trendPercentage}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

