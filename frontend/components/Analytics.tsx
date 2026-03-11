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

  // Sort by value descending
  categoryData.sort((a, b) => b.value - a.value);

  // Editorial neutral colors for the pie chart
  const COLORS = ['#1A1A1A', '#4A4A4A', '#7A7A75', '#B0B0AB'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Find best and worst performers
  const sortedByPerformance = [...initialPortfolio].sort((a, b) => b.trendPercentage - a.trendPercentage);
  const bestPerformer = sortedByPerformance[0];
  const worstPerformer = sortedByPerformance[sortedByPerformance.length - 1];

  return (
    <div className="mt-12 pt-12 border-t border-[#E8E8E3]">
      <h2 className="font-editorial text-2xl text-[#1A1A1A] mb-8">Vault Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Allocation Chart */}
        <div className="md:col-span-1">
          <h3 className="text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-6">Asset Allocation</h3>
          <div className="h-[200px] w-full relative">
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
                  contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', borderRadius: '0px', color: '#FAF9F6' }}
                  itemStyle={{ color: '#FAF9F6' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-[#7A7A75] uppercase tracking-widest">Total Assets</span>
              <span className="font-editorial text-xl text-[#1A1A1A]">{initialPortfolio.length}</span>
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-6 space-y-3">
            {categoryData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-[#1A1A1A]">{entry.name}</span>
                </div>
                <span className="font-medium text-[#1A1A1A]">{formatCurrency(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Highlights */}
        <div className="md:col-span-2 space-y-8">
          <div>
            <h3 className="text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-4">Top Performer</h3>
            <div className="p-6 border border-[#E8E8E3] bg-white flex justify-between items-center">
              <div>
                <div className="font-editorial text-xl text-[#1A1A1A]">{bestPerformer.brand}</div>
                <div className="text-sm text-[#7A7A75] mt-1">{bestPerformer.model}</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-[#00A82D]">{formatCurrency(bestPerformer.currentMarketValue)}</div>
                <div className="text-sm font-medium mt-1 text-[#00A82D]">
                  +{bestPerformer.trendPercentage}%
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-4">Bottom Performer</h3>
            <div className="p-6 border border-[#E8E8E3] bg-white flex justify-between items-center">
              <div>
                <div className="font-editorial text-xl text-[#1A1A1A]">{worstPerformer.brand}</div>
                <div className="text-sm text-[#7A7A75] mt-1">{worstPerformer.model}</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-[#9B2226]">{formatCurrency(worstPerformer.currentMarketValue)}</div>
                <div className="text-sm font-medium mt-1 text-[#9B2226]">
                  {worstPerformer.trendPercentage}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

