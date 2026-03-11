"use client";

import React from 'react';
import { initialPortfolio } from '../lib/mockData';
import { TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">My Assets</h2>
          <p className="text-sm text-zinc-500">Manage your luxury collection</p>
        </div>
        <button 
          onClick={onAddClick}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 px-4 py-2 rounded-lg font-semibold shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Add Asset
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {initialPortfolio.map((asset) => {
          const roi = ((asset.currentMarketValue - asset.purchasePrice) / asset.purchasePrice) * 100;
          const isPositive = roi >= 0;

          return (
            <div key={asset.portfolioId} className="glass-card rounded-2xl p-6 group relative overflow-hidden">
              {/* Category Badge */}
              <div className="absolute top-6 right-6">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {asset.category}
                </span>
              </div>

              {/* Asset Info */}
              <div className="mb-6 pr-16">
                <h3 className="text-lg font-bold text-zinc-100 mb-1">{asset.brand}</h3>
                <p className="text-sm text-zinc-400 line-clamp-1">{asset.model}</p>
                <div className="flex gap-2 mt-2">
                  {asset.material && (
                    <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded-md">{asset.material}</span>
                  )}
                  {asset.size && (
                    <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded-md">{asset.size}</span>
                  )}
                </div>
              </div>

              {/* Financials */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Current Value</p>
                  <p className="text-xl font-bold text-zinc-100">{formatCurrency(asset.currentMarketValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Purchase Price</p>
                  <p className="text-lg font-medium text-zinc-400">{formatCurrency(asset.purchasePrice)}</p>
                </div>
              </div>

              {/* ROI & Trend */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Total ROI</p>
                  <div className={`flex items-center gap-1 font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {isPositive ? '+' : ''}{roi.toFixed(1)}%
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500 mb-1">Market Trend</p>
                  <div className="flex items-center justify-end gap-1">
                    {asset.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                    {asset.trend === 'down' && <TrendingDown className="w-4 h-4 text-rose-400" />}
                    {asset.trend === 'stable' && <Minus className="w-4 h-4 text-zinc-400" />}
                    <span className={`text-sm font-medium ${
                      asset.trend === 'up' ? 'text-emerald-400' : 
                      asset.trend === 'down' ? 'text-rose-400' : 'text-zinc-400'
                    }`}>
                      {asset.trendPercentage > 0 ? '+' : ''}{asset.trendPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

