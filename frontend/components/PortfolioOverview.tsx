"use client";

import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  ResponsiveContainer,
  YAxis
} from 'recharts';
import { adjustedPortfolioHistory, initialPortfolio } from '../lib/mockData';

export default function PortfolioOverview() {
  const [activeTimeframe, setActiveTimeframe] = useState('1Y');

  // Calculate totals
  const totalValue = initialPortfolio.reduce((sum, item) => sum + item.currentMarketValue, 0);
  const totalCost = initialPortfolio.reduce((sum, item) => sum + item.purchasePrice, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPercent = (totalGain / totalCost) * 100;
  
  // Mock daily change
  const dailyChange = 1050;
  const dailyChangePercent = 2.4;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const timeframes = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

  // Determine colors based on performance
  const isOverallPositive = totalGain >= 0;
  const isDailyPositive = dailyChange >= 0;
  
  const overallTrendHex = isOverallPositive ? '#1E3F20' : '#722F37';
  const overallTrendClass = isOverallPositive ? 'text-[#1E3F20]' : 'text-[#722F37]';
  const dailyTrendClass = isDailyPositive ? 'text-[#1E3F20]' : 'text-[#722F37]';

  return (
    <div className="flex flex-col w-full">
      {/* Big Number Header */}
      <div className="mb-10">
        <p className="text-sm font-medium text-[#7A7A75] uppercase tracking-widest mb-4">Total Vault Value</p>
        <h1 className="text-6xl md:text-7xl font-editorial text-[#1A1A1A] mb-4">
          {formatCurrency(totalValue)}
        </h1>
        <div className="flex items-center gap-3 text-base font-medium">
          <span className={`${dailyTrendClass}`}>
            {isDailyPositive ? '+' : ''}{formatCurrency(dailyChange)} ({isDailyPositive ? '+' : ''}{dailyChangePercent}%)
          </span>
          <span className="text-[#7A7A75] uppercase tracking-wider text-xs">Today</span>
        </div>
      </div>

      {/* Minimalist Chart */}
      <div className="h-[300px] md:h-[400px] w-full -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={adjustedPortfolioHistory}>
            <YAxis domain={['dataMin - 1000', 'dataMax + 1000']} hide />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={overallTrendHex} 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: overallTrendHex, stroke: "#FAF9F6", strokeWidth: 2 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Timeframe Selector */}
      <div className="flex items-center justify-between border-b border-[#E8E8E3] pb-4 mt-8">
        <div className="flex gap-2 md:gap-6">
          {timeframes.map((period) => (
            <button 
              key={period}
              onClick={() => setActiveTimeframe(period)}
              className={`px-2 py-1 text-xs font-medium uppercase tracking-widest transition-colors ${
                activeTimeframe === period 
                  ? 'text-[#1A1A1A] border-b border-[#1A1A1A]' 
                  : 'text-[#7A7A75] hover:text-[#1A1A1A]'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Row */}
      <div className="py-6 border-b border-[#E8E8E3] flex justify-between items-center vault-hover px-4 -mx-4">
        <span className="font-editorial text-lg text-[#1A1A1A]">Total Appreciation</span>
        <span className={`font-medium ${overallTrendClass}`}>
          {isOverallPositive ? '+' : ''}{formatCurrency(totalGain)} ({isOverallPositive ? '+' : ''}{totalGainPercent.toFixed(2)}%)
        </span>
      </div>
    </div>
  );
}

