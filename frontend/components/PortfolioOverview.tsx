"use client";

import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  ResponsiveContainer,
  YAxis
} from 'recharts';
import { initialPortfolio } from '../lib/mockData';

export default function PortfolioOverview() {
  const [activeTimeframe, setActiveTimeframe] = useState('1Y');

  // Calculate totals
  const totalValue = initialPortfolio.reduce((sum, item) => sum + item.currentMarketValue, 0);
  const totalCost = initialPortfolio.reduce((sum, item) => sum + item.purchasePrice, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPercent = (totalGain / totalCost) * 100;
  
  // Dynamic timeframe data calculation for the header
  const getTimeframeData = (timeframe: string) => {
    let change = 0;
    let percent = 0;
    let label = '';

    const baseChange = totalGain;
    const basePercent = totalGainPercent;

    switch (timeframe) {
      case '1D':
        change = baseChange * 0.02;
        percent = basePercent * 0.02;
        label = 'Today';
        break;
      case '1W':
        change = baseChange * 0.05;
        percent = basePercent * 0.05;
        label = 'Past Week';
        break;
      case '1M':
        change = baseChange * 0.15;
        percent = basePercent * 0.15;
        label = 'Past Month';
        break;
      case 'YTD':
        change = baseChange * 0.4;
        percent = basePercent * 0.4;
        label = 'Year to Date';
        break;
      case '1Y':
        change = baseChange * 0.6;
        percent = basePercent * 0.6;
        label = 'Past Year';
        break;
      case '5Y':
        change = baseChange * 0.9;
        percent = basePercent * 0.9;
        label = 'Past 5 Years';
        break;
      case '10Y':
        change = baseChange * 0.95;
        percent = basePercent * 0.95;
        label = 'Past 10 Years';
        break;
      case 'ALL':
        change = totalGain;
        percent = totalGainPercent;
        label = 'All Time';
        break;
      default:
        change = baseChange * 0.02;
        percent = basePercent * 0.02;
        label = 'Today';
    }

    return { change, percent, label };
  };

  // Generate dynamic chart data based on timeframe
  const generateChartData = (timeframe: string) => {
    const endValue = totalValue;
    const timeframeData = getTimeframeData(timeframe);
    const startValue = endValue - timeframeData.change;
    const difference = endValue - startValue;
    
    let dataPoints: { label: string; value: number }[] = [];
    
    switch (timeframe) {
      case '1D':
        for (let i = 0; i < 24; i++) {
          const progress = i / 23;
          const value = startValue + (difference * progress) + (Math.random() - 0.5) * (startValue * 0.005);
          dataPoints.push({ label: `${i}:00`, value: Math.round(value) });
        }
        break;
      case '1W':
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        days.forEach((day, i) => {
          const progress = i / 6;
          const value = startValue + (difference * progress) + (Math.random() - 0.5) * (startValue * 0.01);
          dataPoints.push({ label: day, value: Math.round(value) });
        });
        break;
      case '1M':
        for (let i = 0; i < 5; i++) {
          const progress = i / 4;
          const value = startValue + (difference * progress) + (Math.random() - 0.5) * (startValue * 0.02);
          dataPoints.push({ label: `Week ${i + 1}`, value: Math.round(value) });
        }
        break;
      case 'YTD':
        const currentMonth = new Date().getMonth();
        const monthsYTD = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].slice(0, currentMonth + 1);
        monthsYTD.forEach((month, i) => {
          const progress = i / Math.max(1, monthsYTD.length - 1);
          const value = startValue + (difference * progress) + (Math.random() - 0.5) * (startValue * 0.03);
          dataPoints.push({ label: month, value: Math.round(value) });
        });
        break;
      case '1Y':
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        months.forEach((month, i) => {
          const progress = i / 11;
          const value = startValue + (difference * progress) + (Math.random() - 0.5) * (startValue * 0.04);
          dataPoints.push({ label: month, value: Math.round(value) });
        });
        break;
      case '5Y':
        for (let i = 0; i < 5; i++) {
          const year = new Date().getFullYear() - 4 + i;
          const progress = i / 4;
          const value = startValue + (difference * progress) + (Math.random() - 0.5) * (startValue * 0.05);
          dataPoints.push({ label: year.toString(), value: Math.round(value) });
        }
        break;
      case '10Y':
        for (let i = 0; i < 10; i++) {
          const year = new Date().getFullYear() - 9 + i;
          const progress = i / 9;
          const value = startValue + (difference * progress) + (Math.random() - 0.5) * (startValue * 0.08);
          dataPoints.push({ label: year.toString(), value: Math.round(value) });
        }
        break;
      case 'ALL':
        for (let i = 0; i < 24; i++) {
          const progress = i / 23;
          const value = startValue + (difference * progress) + (Math.random() - 0.5) * (startValue * 0.1);
          dataPoints.push({ label: `M${i+1}`, value: Math.round(value) });
        }
        break;
    }
    
    return dataPoints;
  };

  const timeframeData = getTimeframeData(activeTimeframe);
  const chartData = generateChartData(activeTimeframe);

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

  const timeframes = ['1D', '1W', '1M', 'YTD', '1Y', '5Y', '10Y', 'ALL'];

  // Determine colors based on performance
  const isOverallPositive = totalGain >= 0;
  const isTimeframePositive = timeframeData.change >= 0;
  
  // Updated to brighter, more readable colors
  const overallTrendHex = isOverallPositive ? '#00A82D' : '#9B2226';
  const overallTrendClass = isOverallPositive ? 'text-[#00A82D]' : 'text-[#9B2226]';
  const timeframeTrendClass = isTimeframePositive ? 'text-[#00A82D]' : 'text-[#9B2226]';
  const timeframeTrendHex = isTimeframePositive ? '#00A82D' : '#9B2226';

  return (
    <div className="flex flex-col w-full h-full">
      {/* Big Number Header */}
      <div className="mb-4 md:mb-6">
        <p className="text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-2">All Assets</p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-editorial text-[#1A1A1A] mb-2 md:mb-3">
          {formatCurrency(totalValue)}
        </h1>
        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm font-medium">
          <span className={`${timeframeTrendClass}`}>
            {isTimeframePositive ? '+' : ''}{formatCurrency(timeframeData.change)} ({isTimeframePositive ? '+' : ''}{formatPercentage(timeframeData.percent)}%)
          </span>
          <span className="text-[#7A7A75] uppercase tracking-wider text-xs">{timeframeData.label}</span>
        </div>
      </div>

      {/* Minimalist Chart */}
      <div className="h-[200px] sm:h-[250px] md:h-[300px] w-full -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <YAxis domain={['dataMin - 1000', 'dataMax + 1000']} hide />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={timeframeTrendHex} 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: timeframeTrendHex, stroke: "#FAF9F6", strokeWidth: 2 }}
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
        <span className="font-editorial text-base md:text-lg text-[#1A1A1A]">Total Return</span>
        <span className={`font-medium text-sm md:text-base ${overallTrendClass}`}>
          {isOverallPositive ? '+' : ''}{formatCurrency(totalGain)} ({isOverallPositive ? '+' : ''}{formatPercentage(totalGainPercent)}%)
        </span>
      </div>
    </div>
  );
}

