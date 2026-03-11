"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { initialPortfolio } from '../lib/mockData';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function Analytics() {
  // Calculate category allocation
  const categoryData = initialPortfolio.reduce((acc, item) => {
    const existing = acc.find(c => c.name === item.category);
    if (existing) {
      existing.value += item.currentMarketValue;
    } else {
      acc.push({ name: item.category, value: item.currentMarketValue });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = ['#fbbf24', '#f59e0b', '#d97706', '#b45309'];

  // Calculate best/worst performers
  const performanceData = initialPortfolio.map(item => ({
    ...item,
    roi: ((item.currentMarketValue - item.purchasePrice) / item.purchasePrice) * 100,
    profit: item.currentMarketValue - item.purchasePrice
  })).sort((a, b) => b.roi - a.roi);

  const bestPerformer = performanceData[0];
  const worstPerformer = performanceData[performanceData.length - 1];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-zinc-100">Analytics & Insights</h2>
        <p className="text-sm text-zinc-500">Deep dive into your portfolio performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Allocation Chart */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-zinc-100 mb-6">Asset Allocation</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fafafa' }}
                  itemStyle={{ color: '#fbbf24' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-zinc-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Highlights */}
        <div className="space-y-6">
          {/* Best Performer */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <h3 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Top Performer</h3>
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-xl font-bold text-zinc-100">{bestPerformer.brand}</h4>
                <p className="text-sm text-zinc-400">{bestPerformer.model}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-emerald-400 font-bold text-xl">
                  <TrendingUp className="w-5 h-5" />
                  +{bestPerformer.roi.toFixed(1)}%
                </div>
                <p className="text-sm text-zinc-500">+{formatCurrency(bestPerformer.profit)}</p>
              </div>
            </div>
          </div>

          {/* Worst Performer */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <h3 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Needs Attention</h3>
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-xl font-bold text-zinc-100">{worstPerformer.brand}</h4>
                <p className="text-sm text-zinc-400">{worstPerformer.model}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-rose-400 font-bold text-xl">
                  {worstPerformer.roi >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  {worstPerformer.roi > 0 ? '+' : ''}{worstPerformer.roi.toFixed(1)}%
                </div>
                <p className="text-sm text-zinc-500">
                  {worstPerformer.profit > 0 ? '+' : ''}{formatCurrency(worstPerformer.profit)}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
              <p className="text-xs text-zinc-500 mb-1">Total Assets</p>
              <p className="text-2xl font-bold text-zinc-100">{initialPortfolio.length}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4">
              <p className="text-xs text-zinc-500 mb-1">Avg. ROI</p>
              <p className="text-2xl font-bold text-amber-400">
                +{(performanceData.reduce((acc, item) => acc + item.roi, 0) / performanceData.length).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

