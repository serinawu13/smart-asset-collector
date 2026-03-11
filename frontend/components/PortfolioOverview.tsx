"use client";

import React from 'react';
import { initialPortfolio, adjustedPortfolioHistory } from '../lib/mockData';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

export default function PortfolioOverview() {
  const totalValue = initialPortfolio.reduce((sum, item) => sum + item.currentMarketValue, 0);
  const totalPurchasePrice = initialPortfolio.reduce((sum, item) => sum + item.purchasePrice, 0);
  
  const totalAppreciation = totalValue - totalPurchasePrice;
  const totalAppreciationPercentage = (totalAppreciation / totalPurchasePrice) * 100;
  
  const isPositive = totalAppreciation >= 0;
  // Using a much brighter, almost neon green for better visibility against the white background
  const trendColor = isPositive ? 'text-[#00A82D]' : 'text-[#9B2226]';
  const overallTrendHex = isPositive ? '#00A82D' : '#9B2226';

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Main Balance Area */}
      <div className="mb-12">
        <h1 className="text-7xl font-editorial font-bold text-[#1A1A1A] tracking-tight mb-4">
          {formatCurrency(totalValue)}
        </h1>
        
        <div className="flex items-center gap-6">
          <div>
            <div className="text-xs text-[#7A7A75] uppercase tracking-widest mb-1">Today</div>
            <div className={`text-xl font-medium ${trendColor}`}>
              {isPositive ? '+' : ''}{formatCurrency(1250)} (+1.4%)
            </div>
          </div>
          
          <div className="w-px h-10 bg-[#E8E8E3]"></div>
          
          <div>
            <div className="text-xs text-[#7A7A75] uppercase tracking-widest mb-1">Total Appreciation</div>
            <div className={`text-xl font-medium ${trendColor}`}>
              {isPositive ? '+' : ''}{formatCurrency(totalAppreciation)} ({isPositive ? '+' : ''}{totalAppreciationPercentage.toFixed(0)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Minimalist Chart */}
      <div className="flex-1 min-h-[400px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={adjustedPortfolioHistory}>
            <YAxis domain={['dataMin - 5000', 'dataMax + 5000']} hide />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={overallTrendHex} 
              strokeWidth={3} 
              dot={false}
              activeDot={{ r: 6, fill: overallTrendHex, stroke: '#FAF9F6', strokeWidth: 2 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Timeframe Selector */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center border-t border-[#E8E8E3] pt-4">
          <div className="flex gap-6">
            {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((tf) => (
              <button 
                key={tf}
                className={`text-sm font-medium transition-colors ${
                  tf === '1Y' 
                    ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A] pb-1' 
                    : 'text-[#7A7A75] hover:text-[#1A1A1A] pb-1'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

