"use client";

import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Percent, Activity } from 'lucide-react';
import { adjustedPortfolioHistory, initialPortfolio } from '../lib/mockData';

export default function PortfolioOverview() {
  // Calculate totals
  const totalValue = initialPortfolio.reduce((sum, item) => sum + item.currentMarketValue, 0);
  const totalCost = initialPortfolio.reduce((sum, item) => sum + item.purchasePrice, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPercent = (totalGain / totalCost) * 100;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Value Card */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-amber-500/20" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Total Portfolio Value</h3>
            <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-bold text-zinc-100 tracking-tight">
              {formatCurrency(totalValue)}
            </h2>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="flex items-center text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md font-medium">
              <TrendingUp className="w-3 h-3 mr-1" />
              +2.4%
            </span>
            <span className="text-zinc-500">vs last month</span>
          </div>
        </div>

        {/* Total Return Card */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-500/20" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Total Return (All Time)</h3>
            <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
              <Percent className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-bold text-emerald-400 tracking-tight">
              +{formatCurrency(totalGain)}
            </h2>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="flex items-center text-emerald-400 font-medium">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{totalGainPercent.toFixed(2)}% ROI
            </span>
            <span className="text-zinc-500">on {formatCurrency(totalCost)} invested</span>
          </div>
        </div>

        {/* Market Health Card */}
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-blue-500/20" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Market Health</h3>
            <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-bold text-zinc-100 tracking-tight">
              Bullish
            </h2>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-zinc-300">2 of 3 assets trending up</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">Portfolio Performance</h3>
            <p className="text-sm text-zinc-500">12-month historical value</p>
          </div>
          <div className="flex gap-2">
            {['1M', '3M', '6M', '1Y', 'ALL'].map((period) => (
              <button 
                key={period}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  period === '1Y' 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={adjustedPortfolioHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="#71717a" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#71717a" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value / 1000}k`}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  borderColor: '#27272a',
                  borderRadius: '8px',
                  color: '#fafafa'
                }}
                itemStyle={{ color: '#fbbf24' }}
                formatter={(value: number) => [formatCurrency(value), 'Value']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#fbbf24" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

