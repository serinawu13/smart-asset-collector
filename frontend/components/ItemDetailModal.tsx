"use client";

import React from 'react';
import { X } from 'lucide-react';
import { PortfolioAsset } from '../lib/mockData';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: PortfolioAsset | null;
}

export default function ItemDetailModal({ isOpen, onClose, asset }: ItemDetailModalProps) {
  if (!isOpen || !asset) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return value.toFixed(2);
  };

  // Calculate ROI
  const totalGain = asset.currentMarketValue - asset.purchasePrice;
  const totalROI = (totalGain / asset.purchasePrice) * 100;
  const isPositive = totalGain >= 0;
  const trendColor = isPositive ? 'text-[#00A82D]' : 'text-[#9B2226]';
  const trendHex = isPositive ? '#00A82D' : '#9B2226';

  // Generate mock historical data for this specific item
  const generateItemHistory = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const startValue = asset.purchasePrice;
    const endValue = asset.currentMarketValue;
    const difference = endValue - startValue;
    
    return months.map((month, index) => {
      // Create a gradual progression from purchase price to current value
      const progress = index / (months.length - 1);
      const value = startValue + (difference * progress) + (Math.random() - 0.5) * (startValue * 0.05);
      return { month, value: Math.round(value) };
    });
  };

  const itemHistory = generateItemHistory();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/60 backdrop-blur-sm">
      <div className="bg-[#FAF9F6] w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-[#E8E8E3] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#FAF9F6] border-b border-[#E8E8E3] p-6 flex justify-between items-start z-10">
          <div className="flex-1">
            <h2 className="font-editorial text-3xl md:text-4xl text-[#1A1A1A] mb-2">{asset.brand}</h2>
            <p className="text-sm text-[#7A7A75] uppercase tracking-wider">{asset.model}</p>
            <div className="flex flex-wrap gap-3 mt-3">
              <span className="text-xs bg-[#F5F5F0] px-3 py-1 text-[#7A7A75] uppercase tracking-widest">{asset.category}</span>
              <span className="text-xs bg-[#F5F5F0] px-3 py-1 text-[#7A7A75] uppercase tracking-widest">{asset.condition}</span>
              {asset.material && <span className="text-xs bg-[#F5F5F0] px-3 py-1 text-[#7A7A75] uppercase tracking-widest">{asset.material}</span>}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#E8E8E3] transition-colors rounded-full"
          >
            <X className="w-5 h-5 text-[#1A1A1A]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Current Value Section */}
          <div>
            <p className="text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-2">Current Market Value</p>
            <h3 className="text-4xl md:text-5xl font-editorial text-[#1A1A1A] mb-3">
              {formatCurrency(asset.currentMarketValue)}
            </h3>
            <div className="flex items-center gap-3 text-sm font-medium">
              <span className={`${trendColor}`}>
                {isPositive ? '+' : ''}{formatCurrency(totalGain)} ({isPositive ? '+' : ''}{formatPercentage(totalROI)}%)
              </span>
              <span className="text-[#7A7A75] uppercase tracking-wider text-xs">Since Purchase</span>
            </div>
          </div>

          {/* Performance Chart */}
          <div>
            <p className="text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-4">12-Month Performance</p>
            <div className="h-[250px] md:h-[300px] w-full -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={itemHistory}>
                  <YAxis domain={['dataMin - 500', 'dataMax + 500']} hide />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={trendHex} 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, fill: trendHex, stroke: "#FAF9F6", strokeWidth: 2 }}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Purchase Details */}
            <div className="vault-card p-6">
              <p className="text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-3">Purchase Details</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-[#E8E8E3]">
                  <span className="text-sm text-[#7A7A75] uppercase tracking-wider">Purchase Price</span>
                  <span className="font-medium text-[#1A1A1A]">{formatCurrency(asset.purchasePrice)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-[#E8E8E3]">
                  <span className="text-sm text-[#7A7A75] uppercase tracking-wider">Purchase Date</span>
                  <span className="font-medium text-[#1A1A1A]">{new Date(asset.purchaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#7A7A75] uppercase tracking-wider">Condition</span>
                  <span className="font-medium text-[#1A1A1A]">{asset.condition}</span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="vault-card p-6">
              <p className="text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-3">Performance Metrics</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-[#E8E8E3]">
                  <span className="text-sm text-[#7A7A75] uppercase tracking-wider">Total ROI</span>
                  <span className={`font-medium ${trendColor}`}>
                    {isPositive ? '+' : ''}{formatPercentage(totalROI)}%
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-[#E8E8E3]">
                  <span className="text-sm text-[#7A7A75] uppercase tracking-wider">Total Gain/Loss</span>
                  <span className={`font-medium ${trendColor}`}>
                    {isPositive ? '+' : ''}{formatCurrency(totalGain)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#7A7A75] uppercase tracking-wider">Market Trend</span>
                  <span className={`font-medium ${trendColor}`}>
                    {isPositive ? '+' : ''}{formatPercentage(asset.trendPercentage)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          {(asset.material || asset.size) && (
            <div className="vault-card p-6">
              <p className="text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-3">Specifications</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {asset.material && (
                  <div className="flex justify-between items-center pb-2 border-b border-[#E8E8E3]">
                    <span className="text-sm text-[#7A7A75] uppercase tracking-wider">Material</span>
                    <span className="font-medium text-[#1A1A1A]">{asset.material}</span>
                  </div>
                )}
                {asset.size && (
                  <div className="flex justify-between items-center pb-2 border-b border-[#E8E8E3]">
                    <span className="text-sm text-[#7A7A75] uppercase tracking-wider">Size</span>
                    <span className="font-medium text-[#1A1A1A]">{asset.size}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

