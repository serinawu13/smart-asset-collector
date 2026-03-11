"use client";

import React from 'react';
import { initialWatchlist } from '../lib/mockData';
import { Bell } from 'lucide-react';

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
      <div className="p-6 border-b border-[#E8E8E3] bg-[#FAF9F6]">
        <h2 className="font-editorial text-2xl text-[#1A1A1A]">Watchlist</h2>
      </div>

      {/* List */}
      <div className="flex flex-col">
        {initialWatchlist.map((item) => {
          const isPositive = item.trendPercentage >= 0;
          // Using a much brighter, almost neon green for better visibility against the white background
          const trendColor = isPositive ? 'text-[#00A82D]' : 'text-[#9B2226]';

          return (
            <div key={item.watchlistId} className="p-6 flex justify-between items-center vault-hover border-b border-[#E8E8E3] last:border-0">
              {/* Left: Name & Category */}
              <div>
                <div className="font-editorial text-lg text-[#1A1A1A]">{item.brand}</div>
                <div className="text-xs text-[#7A7A75] mt-1 uppercase tracking-wider">{item.category} • {item.model}</div>
              </div>

              {/* Right: Price & Alert */}
              <div className="text-right flex items-center gap-4">
                <div>
                  <div className={`font-medium ${trendColor}`}>{formatCurrency(item.currentMarketValue)}</div>
                  <div className="text-xs text-[#7A7A75] mt-1 uppercase tracking-wider">
                    Target: {formatCurrency(item.targetPrice || 0)}
                  </div>
                </div>
                <button className={`p-2 rounded-full transition-colors ${item.alertActive ? 'bg-[#1A1A1A] text-[#FAF9F6]' : 'bg-[#E8E8E3] text-[#7A7A75]'}`}>
                  <Bell className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

