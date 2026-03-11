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
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="rh-card">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
        <h2 className="font-bold text-lg text-white">Portfolio</h2>
        <button 
          onClick={onAddClick}
          className="p-1.5 rounded-full hover:bg-zinc-800 transition-colors text-white"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col">
        {initialPortfolio.map((asset) => {
          const isPositive = asset.trendPercentage >= 0;
          const trendColor = isPositive ? 'text-[#00C805]' : 'text-[#FF5000]';

          return (
            <div key={asset.portfolioId} className="p-4 flex justify-between items-center rh-hover border-b border-zinc-800 last:border-0">
              {/* Left: Name & Category */}
              <div>
                <div className="font-bold text-white">{asset.brand}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{asset.category} • {asset.model.substring(0, 15)}...</div>
              </div>

              {/* Middle: Mini Chart (Simulated with a simple SVG line for aesthetic) */}
              <div className="hidden sm:block w-16 h-8">
                <svg viewBox="0 0 100 30" className="w-full h-full preserve-3d">
                  <path 
                    d={isPositive ? "M0,25 Q25,25 50,15 T100,5" : "M0,5 Q25,5 50,15 T100,25"} 
                    fill="none" 
                    stroke={isPositive ? "#00C805" : "#FF5000"} 
                    strokeWidth="2"
                  />
                </svg>
              </div>

              {/* Right: Price & Trend */}
              <div className="text-right">
                <div className="font-medium text-white">{formatCurrency(asset.currentMarketValue)}</div>
                <div className={`text-sm font-medium mt-0.5 ${trendColor}`}>
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

