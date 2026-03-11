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

  return (
    <div className="flex flex-col w-full">
      {/* Big Number Header */}
      <div className="mb-6">
        <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-white mb-2">
          {formatCurrency(totalValue)}
        </h1>
        <div className="flex items-center gap-2 text-sm md:text-base font-medium">
          <span className="text-[#00C805]">
            +{formatCurrency(dailyChange)} (+{dailyChangePercent}%)
          </span>
          <span className="text-zinc-500">Today</span>
        </div>
      </div>

      {/* Minimalist Chart */}
      <div className="h-[250px] md:h-[300px] w-full -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={adjustedPortfolioHistory}>
            <YAxis domain={['dataMin - 1000', 'dataMax + 1000']} hide />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#00C805" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#00C805", stroke: "#000", strokeWidth: 2 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Timeframe Selector */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mt-4">
        <div className="flex gap-1 md:gap-4">
          {timeframes.map((period) => (
            <button 
              key={period}
              onClick={() => setActiveTimeframe(period)}
              className={`px-3 py-1.5 text-sm font-bold rounded-md transition-colors ${
                activeTimeframe === period 
                  ? 'text-[#00C805] bg-[#00C805]/10' 
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Buying Power / Summary Row */}
      <div className="py-5 border-b border-zinc-800 flex justify-between items-center hover:bg-zinc-900/30 transition-colors cursor-pointer px-2 -mx-2 rounded-lg">
        <span className="font-medium text-white">Buying Power</span>
        <span className="font-medium text-white">{formatCurrency(12450)}</span>
      </div>
      
      <div className="py-5 border-b border-zinc-800 flex justify-between items-center hover:bg-zinc-900/30 transition-colors cursor-pointer px-2 -mx-2 rounded-lg">
        <span className="font-medium text-white">Total Return</span>
        <span className="font-medium text-[#00C805]">+{formatCurrency(totalGain)} (+{totalGainPercent.toFixed(2)}%)</span>
      </div>
    </div>
  );
}

