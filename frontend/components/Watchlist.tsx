"use client";

import React from 'react';
import { initialWatchlist } from '../lib/mockData';
import { Plus } from 'lucide-react';

export default function Watchlist() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="vault-card mt-8">
      {/* Header */}
      <div className="p-6 border-b border-[#E8E8E3] flex justify-between items-center bg-[#FAF9F6]">
        <h2 className="font-editorial text-2xl text-[#1A1A1A]">Watchlist</h2>
        <button className="p-2 border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#FAF9F6] transition-colors text-[#1A1A1A]">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col">
        {initialWatchlist.map((item) => {
          const isPositive = item.trendPercentage >= 0;
          const trendColor = isPositive ? 'text-[#2D6A4F]' : 'text-[#9B2226]';

          return (
            <div key={item.watchlistId} className="p-6 flex justify-between items-center vault-hover border-b border-[#E8E8E3] last:border-0">
              {/* Left: Name & Category */}
              <div>
                <div className="font-editorial text-lg text-[#1A1A1A]">{item.brand}</div>
                <div className="text-xs text-[#7A7A75] mt-1 uppercase tracking-wider">{item.category}</div>
              </div>

              {/* Right: Price & Trend */}
              <div className="text-right">
                <div className={`font-medium ${trendColor}`}>{formatCurrency(item.currentMarketValue)}</div>
                <div className={`text-xs font-medium mt-1 uppercase tracking-wider ${trendColor}`}>
                  {isPositive ? '+' : ''}{item.trendPercentage}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

