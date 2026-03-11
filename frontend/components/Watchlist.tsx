"use client";

import React from 'react';
import { initialWatchlist } from '../lib/mockData';
import { Bell, BellRing, TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react';

export default function Watchlist() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Watchlist</h2>
          <p className="text-sm text-zinc-500">Track market prices for your next acquisition</p>
        </div>
        <button className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-100 px-4 py-2 rounded-lg font-medium transition-all">
          <Plus className="w-4 h-4" />
          Add to Watchlist
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Asset</th>
                <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</th>
                <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Market Value</th>
                <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Target Price</th>
                <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Trend</th>
                <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Alerts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {initialWatchlist.map((item) => (
                <tr key={item.watchlistId} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-zinc-100">{item.brand}</div>
                    <div className="text-sm text-zinc-500">{item.model}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-md bg-zinc-800 text-zinc-300">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-zinc-100">
                    {formatCurrency(item.currentMarketValue)}
                  </td>
                  <td className="p-4 text-zinc-400">
                    {item.targetPrice ? formatCurrency(item.targetPrice) : '-'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      {item.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                      {item.trend === 'down' && <TrendingDown className="w-4 h-4 text-rose-400" />}
                      {item.trend === 'stable' && <Minus className="w-4 h-4 text-zinc-400" />}
                      <span className={`text-sm font-medium ${
                        item.trend === 'up' ? 'text-emerald-400' : 
                        item.trend === 'down' ? 'text-rose-400' : 'text-zinc-400'
                      }`}>
                        {item.trendPercentage > 0 ? '+' : ''}{item.trendPercentage}%
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className={`p-2 rounded-lg transition-colors ${
                      item.alertActive 
                        ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' 
                        : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                    }`}>
                      {item.alertActive ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

