"use client";

import React, { useState } from 'react';
import { X, Edit2, Check, XIcon, Plus, Bell } from 'lucide-react';
import { PortfolioAsset } from '../lib/mockData';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: PortfolioAsset | null;
  isWatchlistItem?: boolean;
}

export default function ItemDetailModal({ isOpen, onClose, asset, isWatchlistItem = false }: ItemDetailModalProps) {
  const [activeTimeframe, setActiveTimeframe] = useState('1Y');
  const [isEditingPurchase, setIsEditingPurchase] = useState(false);
  const [isEditingSpecs, setIsEditingSpecs] = useState(false);
  const [isAddedToWatchlist, setIsAddedToWatchlist] = useState(false);
  
  // Editable fields state
  const [editedPurchasePrice, setEditedPurchasePrice] = useState('');
  const [editedPurchaseDate, setEditedPurchaseDate] = useState('');
  const [editedCondition, setEditedCondition] = useState('');
  const [editedMaterial, setEditedMaterial] = useState('');
  const [editedSize, setEditedSize] = useState('');
  const [editedSerialNumber, setEditedSerialNumber] = useState('');
  const [editedColor, setEditedColor] = useState('');

  if (!isOpen || !asset) return null;

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

  // Calculate ROI
  const totalGain = asset.currentMarketValue - asset.purchasePrice;
  const totalROI = (totalGain / asset.purchasePrice) * 100;
  const isPositive = totalGain >= 0;
  const trendColor = isPositive ? 'text-[#00A82D]' : 'text-[#9B2226]';
  const trendHex = isPositive ? '#00A82D' : '#9B2226';

  // Get retail price
  const retailPrice = asset.retailPrice || asset.purchasePrice;

  // Generate mock historical data for this specific item based on timeframe
  const generateItemHistory = (timeframe: string) => {
    const startValue = asset.purchasePrice;
    const endValue = asset.currentMarketValue;
    const difference = endValue - startValue;
    
    let dataPoints: { label: string; value: number }[] = [];
    
    switch (timeframe) {
      case '1D':
        for (let i = 0; i < 24; i++) {
          const progress = i / 23;
          const value = startValue + (difference * progress) + (Math.random() - 0.5) * (startValue * 0.02);
          dataPoints.push({ label: `${i}:00`, value: Math.round(value) });
        }
        break;
      case '1W':
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        days.forEach((day, i) => {
          const progress = i / 6;
          const value = startValue + (difference * progress) + (Math.random() - 0.5) * (startValue * 0.03);
          dataPoints.push({ label: day, value: Math.round(value) });
        });
        break;
      case '1M':
        for (let i = 0; i < 5; i++) {
          const progress = i / 4;
          const value = startValue + (difference * progress) + (Math.random() - 0.5) * (startValue * 0.04);
          dataPoints.push({ label: `Week ${i + 1}`, value: Math.round(value) });
        }
        break;
      case 'YTD':
        const currentMonth = new Date().getMonth();
        const monthsYTD = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].slice(0, currentMonth + 1);
        
        monthsYTD.forEach((month, i) => {
          const progress = i / Math.max(1, monthsYTD.length - 1);
          const value = startValue + (difference * progress * 0.5) + (Math.random() - 0.5) * (startValue * 0.04);
          dataPoints.push({ label: month, value: Math.round(value) });
        });
        break;
      case '1Y':
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        months.forEach((month, i) => {
          const progress = i / 11;
          const value = startValue + (difference * progress) + (Math.random() - 0.5) * (startValue * 0.05);
          dataPoints.push({ label: month, value: Math.round(value) });
        });
        break;
      case '5Y':
        for (let i = 0; i < 5; i++) {
          const year = new Date().getFullYear() - 4 + i;
          const progress = i / 4;
          const value = startValue + (difference * progress) + (Math.random() - 0.5) * (startValue * 0.1);
          dataPoints.push({ label: year.toString(), value: Math.round(value) });
        }
        break;
      case '10Y':
        for (let i = 0; i < 10; i++) {
          const year = new Date().getFullYear() - 9 + i;
          const progress = i / 9;
          const value = startValue + (difference * progress) + (Math.random() - 0.5) * (startValue * 0.15);
          dataPoints.push({ label: year.toString(), value: Math.round(value) });
        }
        break;
      case 'ALL':
        const purchaseDate = new Date(asset.purchaseDate);
        const now = new Date();
        const monthsDiff = Math.max(1, Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
        const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        for (let i = 0; i < Math.min(monthsDiff, 24); i++) {
          const progress = i / (Math.min(monthsDiff, 24) - 1);
          const value = startValue + (difference * progress) + (Math.random() - 0.5) * (startValue * 0.05);
          dataPoints.push({ label: allMonths[i % 12], value: Math.round(value) });
        }
        break;
    }
    
    return dataPoints;
  };

  const itemHistory = generateItemHistory(activeTimeframe);
  const timeframes = ['1D', '1W', '1M', 'YTD', '1Y', '5Y', '10Y', 'ALL'];

  // Edit handlers
  const handleEditPurchase = () => {
    setEditedPurchasePrice(asset.purchasePrice.toString());
    setEditedPurchaseDate(asset.purchaseDate);
    setIsEditingPurchase(true);
  };

  const handleSavePurchase = () => {
    console.log('Saving purchase details:', { editedPurchasePrice, editedPurchaseDate });
    setIsEditingPurchase(false);
  };

  const handleCancelPurchase = () => {
    setIsEditingPurchase(false);
  };

  const handleEditSpecs = () => {
    setEditedCondition(asset.condition);
    setEditedMaterial(asset.material || '');
    setEditedSize(asset.size || '');
    setEditedSerialNumber(asset.serialNumber || '');
    setEditedColor(asset.color || '');
    setIsEditingSpecs(true);
  };

  const handleSaveSpecs = () => {
    console.log('Saving specifications:', { editedCondition, editedMaterial, editedSize, editedSerialNumber, editedColor });
    setIsEditingSpecs(false);
  };

  const handleCancelSpecs = () => {
    setIsEditingSpecs(false);
  };

  const handleAddToWatchlist = () => {
    setIsAddedToWatchlist(true);
    console.log('Added to watchlist:', asset.brand, asset.model);
    // In a real app, this would trigger an API call to add the item to the user's watchlist
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/60 backdrop-blur-sm">
      <div className="bg-[#FAF9F6] w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-[#E8E8E3] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#FAF9F6] border-b border-[#E8E8E3] p-6 flex justify-between items-start z-10">
          <div className="flex-1">
            <h2 className="font-editorial text-3xl md:text-4xl text-[#1A1A1A] mb-2">{asset.brand}</h2>
            <p className="text-sm text-[#7A7A75] uppercase tracking-wider">{asset.model}</p>
            <div className="flex flex-wrap gap-3 mt-3">
              <span className="text-xs bg-[#F5F5F0] px-3 py-1 text-[#7A7A75] uppercase tracking-widest">{asset.category}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isWatchlistItem && (
              <button 
                onClick={handleAddToWatchlist}
                disabled={isAddedToWatchlist}
                className={`px-4 py-2 text-xs font-medium uppercase tracking-widest transition-colors flex items-center gap-2 ${
                  isAddedToWatchlist 
                    ? 'bg-[#00A82D]/10 text-[#00A82D] border border-[#00A82D]/20' 
                    : 'bg-[#1A1A1A] text-[#FAF9F6] hover:bg-[#333333]'
                }`}
              >
                {isAddedToWatchlist ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Watching
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5" />
                    Add to Watchlist
                  </>
                )}
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 hover:bg-[#E8E8E3] transition-colors rounded-full"
            >
              <X className="w-5 h-5 text-[#1A1A1A]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Current Value Section */}
          <div>
            <p className="text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-2">Current Market Value</p>
            <h3 className="text-4xl md:text-5xl font-editorial text-[#1A1A1A] mb-3">
              {formatCurrency(asset.currentMarketValue)}
            </h3>
            {!isWatchlistItem && (
              <div className="flex items-center gap-3 text-sm font-medium">
                <span className={`${trendColor}`}>
                  {isPositive ? '+' : ''}{formatCurrency(totalGain)} ({isPositive ? '+' : ''}{formatPercentage(totalROI)}%)
                </span>
                <span className="text-[#7A7A75] uppercase tracking-wider text-xs">Today</span>
              </div>
            )}
          </div>

          {/* Performance Chart */}
          <div>
            <p className="text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-4">Performance History</p>
            <div className="h-[250px] md:h-[300px] w-full -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={itemHistory}>
                  <YAxis domain={['dataMin - 500', 'dataMax + 500']} hide />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={trendHex} 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, fill: trendHex, stroke: "#FAF9F6", strokeWidth: 2 }}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center justify-between border-b border-[#E8E8E3] pb-3 mt-4 overflow-x-auto">
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
          </div>

          {/* Stats Grid */}
          <div className={`grid grid-cols-1 ${!isWatchlistItem ? 'sm:grid-cols-2' : ''} gap-6`}>
            {/* Purchase Details - Only show for Collection items */}
            {!isWatchlistItem && (
              <div className="vault-card p-6">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-medium text-[#7A7A75] uppercase tracking-widest">Purchase Details</p>
                  {!isEditingPurchase ? (
                    <button 
                      onClick={handleEditPurchase}
                      className="p-1.5 hover:bg-[#E8E8E3] transition-colors rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#7A7A75]" />
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        onClick={handleSavePurchase}
                        className="p-1.5 hover:bg-[#00A82D]/10 transition-colors rounded"
                      >
                        <Check className="w-3.5 h-3.5 text-[#00A82D]" />
                      </button>
                      <button 
                        onClick={handleCancelPurchase}
                        className="p-1.5 hover:bg-[#9B2226]/10 transition-colors rounded"
                      >
                        <XIcon className="w-3.5 h-3.5 text-[#9B2226]" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-[#E8E8E3]">
                    <span className="text-sm text-[#7A7A75] uppercase tracking-wider">Purchase Price</span>
                    {isEditingPurchase ? (
                      <input
                        type="number"
                        value={editedPurchasePrice}
                        onChange={(e) => setEditedPurchasePrice(e.target.value)}
                        className="font-medium text-[#1A1A1A] bg-white border border-[#E8E8E3] px-2 py-1 text-sm text-right w-32"
                      />
                    ) : (
                      <span className="font-medium text-[#1A1A1A]">{formatCurrency(asset.purchasePrice)}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-[#E8E8E3]">
                    <span className="text-sm text-[#7A7A75] uppercase tracking-wider">Purchase Date</span>
                    {isEditingPurchase ? (
                      <input
                        type="date"
                        value={editedPurchaseDate}
                        onChange={(e) => setEditedPurchaseDate(e.target.value)}
                        className="font-medium text-[#1A1A1A] bg-white border border-[#E8E8E3] px-2 py-1 text-sm"
                      />
                    ) : (
                      <span className="font-medium text-[#1A1A1A]">{new Date(asset.purchaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Performance Metrics */}
            <div className="vault-card p-6">
              <p className="text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-3">Performance Metrics</p>
              <div className="space-y-3">
                {!isWatchlistItem && (
                  <div className="flex justify-between items-center pb-2 border-b border-[#E8E8E3]">
                    <span className="text-sm text-[#7A7A75] uppercase tracking-wider">Total Return</span>
                    <span className={`font-medium ${trendColor}`}>
                      {isPositive ? '+' : ''}{formatCurrency(totalGain)} ({isPositive ? '+' : ''}{formatPercentage(totalROI)}%)
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pb-2 border-b border-[#E8E8E3]">
                  <span className="text-sm text-[#7A7A75] uppercase tracking-wider">Market Trend</span>
                  <span className={`font-medium ${trendColor}`}>
                    {isPositive ? '+' : ''}{formatPercentage(asset.trendPercentage)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#7A7A75] uppercase tracking-wider">Retail Price</span>
                  <span className="font-medium text-[#1A1A1A]">{formatCurrency(retailPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="vault-card p-6">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-medium text-[#7A7A75] uppercase tracking-widest">Specifications</p>
              {!isEditingSpecs ? (
                <button 
                  onClick={handleEditSpecs}
                  className="p-1.5 hover:bg-[#E8E8E3] transition-colors rounded"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#7A7A75]" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={handleSaveSpecs}
                    className="p-1.5 hover:bg-[#00A82D]/10 transition-colors rounded"
                  >
                    <Check className="w-3.5 h-3.5 text-[#00A82D]" />
                  </button>
                  <button 
                    onClick={handleCancelSpecs}
                    className="p-1.5 hover:bg-[#9B2226]/10 transition-colors rounded"
                  >
                    <XIcon className="w-3.5 h-3.5 text-[#9B2226]" />
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {!isWatchlistItem && (
                <div className="flex justify-between items-center pb-2 border-b border-[#E8E8E3]">
                  <span className="text-sm text-[#7A7A75] uppercase tracking-wider">Condition</span>
                  {isEditingSpecs ? (
                    <select
                      value={editedCondition}
                      onChange={(e) => setEditedCondition(e.target.value)}
                      className="font-medium text-[#1A1A1A] bg-white border border-[#E8E8E3] px-2 py-1 text-sm"
                    >
                      <option value="Pristine">Pristine</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                  ) : (
                    <span className="font-medium text-[#1A1A1A]">{asset.condition}</span>
                  )}
                </div>
              )}
              <div className="flex justify-between items-center pb-2 border-b border-[#E8E8E3]">
                <span className="text-sm text-[#7A7A75] uppercase tracking-wider">Material</span>
                {isEditingSpecs ? (
                  <input
                    type="text"
                    value={editedMaterial}
                    onChange={(e) => setEditedMaterial(e.target.value)}
                    placeholder="Enter material"
                    className="font-medium text-[#1A1A1A] bg-white border border-[#E8E8E3] px-2 py-1 text-sm text-right w-40"
                  />
                ) : (
                  <span className="font-medium text-[#1A1A1A]">{asset.material || '—'}</span>
                )}
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#E8E8E3]">
                <span className="text-sm text-[#7A7A75] uppercase tracking-wider">Size</span>
                {isEditingSpecs ? (
                  <input
                    type="text"
                    value={editedSize}
                    onChange={(e) => setEditedSize(e.target.value)}
                    placeholder="Enter size"
                    className="font-medium text-[#1A1A1A] bg-white border border-[#E8E8E3] px-2 py-1 text-sm text-right w-40"
                  />
                ) : (
                  <span className="font-medium text-[#1A1A1A]">{asset.size || '—'}</span>
                )}
              </div>
              
              {/* Color - Only for Bags */}
              {asset.category === 'Bag' && (
                <div className="flex justify-between items-center pb-2 border-b border-[#E8E8E3]">
                  <span className="text-sm text-[#7A7A75] uppercase tracking-wider">Color</span>
                  {isEditingSpecs ? (
                    <input
                      type="text"
                      value={editedColor}
                      onChange={(e) => setEditedColor(e.target.value)}
                      placeholder="Enter color"
                      className="font-medium text-[#1A1A1A] bg-white border border-[#E8E8E3] px-2 py-1 text-sm text-right w-40"
                    />
                  ) : (
                    <span className="font-medium text-[#1A1A1A]">{asset.color || '—'}</span>
                  )}
                </div>
              )}

              {!isWatchlistItem && (
                <div className="flex justify-between items-center pb-2 border-b border-[#E8E8E3]">
                  <span className="text-sm text-[#7A7A75] uppercase tracking-wider">Serial Number</span>
                  {isEditingSpecs ? (
                    <input
                      type="text"
                      value={editedSerialNumber}
                      onChange={(e) => setEditedSerialNumber(e.target.value)}
                      placeholder="Enter serial #"
                      className="font-medium text-[#1A1A1A] bg-white border border-[#E8E8E3] px-2 py-1 text-sm text-right w-40"
                    />
                  ) : (
                    <span className="font-medium text-[#1A1A1A]">{asset.serialNumber || '—'}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

