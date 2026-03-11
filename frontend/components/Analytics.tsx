"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { initialPortfolio } from '../lib/mockData';

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

  // Robinhood-esque colors (Green, Dark Green, Gray, etc.)
  const COLORS = ['#00C805', '#008A03', '#333333', '#666666'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Allocation Chart */}
        <div className="rh-card p-6">
          <h3 className="text-lg font-bold text-white mb-4">Asset Allocation</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#000000', borderColor: '#27272a', borderRadius: '8px', color: '#ffffff' }}
                  itemStyle={{ color: '#00C805' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.map((category, index) => (
              <div key={category.name} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-zinc-300">{category.name}</span>
                </div>
                <span className="font-medium text-white">{formatCurrency(category.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="rh-card p-6">
            <p className="text-sm text-zinc-500 mb-1">Total Assets</p>
            <p className="text-3xl font-medium text-white">{initialPortfolio.length}</p>
          </div>
          <div className="rh-card p-6">
            <p className="text-sm text-zinc-500 mb-1">Best Performer</p>
            <p className="text-xl font-medium text-white">{initialPortfolio[1].brand}</p>
            <p className="text-sm text-[#00C805] mt-1">+8.4% All Time</p>
          </div>
        </div>
      </div>
    </div>
  );
}

