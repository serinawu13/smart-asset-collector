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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return value.toFixed(2);
  };

  const timeframes = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

  // Determine colors based on performance
  const isOverallPositive = totalGain >= 0;
  const isDailyPositive = dailyChange >= 0;
  
  // Updated to brighter, more readable colors
  const overallTrendHex = isOverallPositive ? '#00A82D' : '#9B2226';
  const overallTrendClass = isOverallPositive ? 'text-[#00A82D]' : 'text-[#9B2226]';
  const dailyTrendClass = isDailyPositive ? 'text-[#00A82D]' : 'text-[#9B2226]';

  return (
    <div className="flex flex-col w-full h-full">
      {/* Big Number Header */}
      <div className="mb-4 md:mb-6">
        <p className="text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-2">All Assets</p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-editorial text-[#1A1A1A] mb-2 md:mb-3">
          {formatCurrency(totalValue)}
        </h1>
        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm font-medium">
          <span className={`${dailyTrendClass}`}>
            {isDailyPositive ? '+' : ''}{formatCurrency(dailyChange)} ({isDailyPositive ? '+' : ''}{formatPercentage(dailyChangePercent)}%)
          </span>
          <span className="text-[#7A7A75] uppercase tracking-wider text-xs">Today</span>
        </div>
      </div>

      {/* Minimalist Chart */}
      <div className="h-[200px] sm:h-[250px] md:h-[300px] w-full -ml-2">
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
      <div className="flex items-center justify-between border-b border-[#E8E8E3] pb-3 mt-3 md:mt-4 overflow-x-auto">
        <div className="flex gap-3 md:gap-6">
          {timeframes.map((period) => (
            <button 
              key={period}
              onClick={() => setActiveTimeframe(period)}
              className={`px-2 py-1 text-xs font-medium uppercase tracking-widest transition-colors whitespace-nowrap ${
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
      <div className="py-3 md:py-4 border-b border-[#E8E8E3] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 vault-hover px-4 -mx-4">
        <span className="font-editorial text-base md:text-lg text-[#1A1A1A]">Total Appreciation</span>
        <span className={`font-medium text-sm md:text-base ${overallTrendClass}`}>
          {isOverallPositive ? '+' : ''}{formatCurrency(totalGain)} ({isOverallPositive ? '+' : ''}{formatPercentage(totalGainPercent)}%)
        </span>
      </div>
    </div>
  );
}

