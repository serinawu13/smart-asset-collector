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

  // Neutral editorial colors for the pie chart (reserving green/red strictly for gains/losses)
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
    <div className="space-y-8 mt-12 pt-12 border-t border-[#E8E8E3]">
      <h2 className="font-editorial text-2xl text-[#1A1A1A] mb-8">Vault Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Allocation Chart */}
        <div className="vault-card p-8">
          <h3 className="font-editorial text-2xl text-[#1A1A1A] mb-8">Asset Allocation</h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
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
                  contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#1A1A1A', borderRadius: '0px', color: '#FAF9F6' }}
                  itemStyle={{ color: '#FAF9F6' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-4">
            {categoryData.map((category, index) => (
              <div key={category.name} className="flex justify-between items-center text-sm border-b border-[#E8E8E3] pb-2 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-[#7A7A75] uppercase tracking-widest text-xs">{category.name}</span>
                </div>
                <span className="font-medium text-[#1A1A1A]">{formatCurrency(category.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-8">
          <div className="vault-card p-8 bg-[#1A1A1A] text-[#FAF9F6]">
            <p className="text-xs text-[#7A7A75] mb-2 uppercase tracking-widest">Total Assets</p>
            <p className="font-editorial text-5xl">{initialPortfolio.length}</p>
          </div>
          
          <div className="vault-card p-8">
            <p className="text-xs text-[#7A7A75] mb-2 uppercase tracking-widest">Top Performer</p>
            <p className="font-editorial text-3xl text-[#1A1A1A]">{bestPerformer.brand}</p>
            <p className="text-sm text-[#00A82D] mt-2 font-medium uppercase tracking-wider">+{bestPerformer.trendPercentage}% All Time</p>
          </div>

          <div className="vault-card p-8">
            <p className="text-xs text-[#7A7A75] mb-2 uppercase tracking-widest">Bottom Performer</p>
            <p className="font-editorial text-3xl text-[#1A1A1A]">{worstPerformer.brand}</p>
            <p className="text-sm text-[#9B2226] mt-2 font-medium uppercase tracking-wider">{worstPerformer.trendPercentage}% All Time</p>
          </div>
        </div>
      </div>
    </div>
  );
}

