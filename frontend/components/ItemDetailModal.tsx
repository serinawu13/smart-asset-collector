"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Edit2, Check, XIcon, Plus, Bell, BellOff, Trash2, DollarSign, ChevronDown } from 'lucide-react';
import { PortfolioAsset } from '../lib/mockData';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: PortfolioAsset | null;
  isWatchlistItem?: boolean;
  isSearchResult?: boolean;
}

export default function ItemDetailModal({ isOpen, onClose, asset, isWatchlistItem = false, isSearchResult = false }: ItemDetailModalProps) {
  const [activeTimeframe, setActiveTimeframe] = useState('1Y');
  const [isEditingPurchase, setIsEditingPurchase] = useState(false);
  const [isEditingSpecs, setIsEditingSpecs] = useState(false);
  const [isSelling, setIsSelling] = useState(false);
  const [isAlertMenuOpen, setIsAlertMenuOpen] = useState(false);
  const sellFormRef = useRef<HTMLDivElement>(null);
  const alertMenuRef = useRef<HTMLDivElement>(null);
  
  // If it's already a watchlist item, it's added. If it's a search result, it's not added yet.
  const [isAddedToWatchlist, setIsAddedToWatchlist] = useState(isWatchlistItem && !isSearchResult);
  
  // Alert state
  const [alertType, setAlertType] = useState<'up' | 'down' | 'both' | 'none'>('none');
  const [alertThreshold, setAlertThreshold] = useState('5');
  
  // Editable fields state
  const [editedPurchasePrice, setEditedPurchasePrice] = useState('');
  const [editedPurchaseDate, setEditedPurchaseDate] = useState('');
  const [editedCondition, setEditedCondition] = useState('');
  const [editedMaterial, setEditedMaterial] = useState('');
  const [editedSize, setEditedSize] = useState('');
  const [editedSerialNumber, setEditedSerialNumber] = useState('');
  const [editedColor, setEditedColor] = useState('');

  // Sell fields state
  const [salePrice, setSalePrice] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);

  // Scroll to sell form when opened
  useEffect(() => {
    if (isSelling && sellFormRef.current) {
      sellFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isSelling]);

  // Close alert menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (alertMenuRef.current && !alertMenuRef.current.contains(event.target as Node)) {
        setIsAlertMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Calculate ROI (Total Return based on Purchase Price)
  const totalGain = asset.currentMarketValue - asset.purchasePrice;
  const totalROI = (totalGain / asset.purchasePrice) * 100;
  const isPositive = totalGain >= 0;
  const trendColor = isPositive ? 'text-[#00A82D]' : 'text-[#9B2226]';
  const trendHex = isPositive ? '#00A82D' : '#9B2226';

  // Get retail price and calculate premium/discount
  const retailPrice = asset.retailPrice || asset.purchasePrice;
  const retailDifference = asset.currentMarketValue - retailPrice;
  const retailPremium = (retailDifference / retailPrice) * 100;
  const isAboveRetail = retailDifference >= 0;
  const retailTrendColor = isAboveRetail ? 'text-[#00A82D]' : 'text-[#9B2226]';

  // Generate mock historical data for this specific item based on timeframe
  // IMPORTANT: This now uses historical market value as the starting point, NOT purchase price
  const generateItemHistory = (timeframe: string) => {
    const endValue = asset.currentMarketValue;
    
    // Calculate the starting market value based on the item's overall trend percentage
    // If trend is +10%, then startValue was 10% lower than endValue
    const historicalMarketValue = endValue / (1 + (asset.trendPercentage / 100));
    
    // For the chart, we need to determine how much of that total historical change 
    // applies to the specific timeframe selected
    let timeframeStartValue = endValue;
    
    switch (timeframe) {
      case '1D':
        timeframeStartValue = endValue / (1 + (asset.trendPercentage * 0.02 / 100));
        break;
      case '1W':
        timeframeStartValue = endValue / (1 + (asset.trendPercentage * 0.05 / 100));
        break;
      case '1M':
        timeframeStartValue = endValue / (1 + (asset.trendPercentage * 0.15 / 100));
        break;
      case 'YTD':
        timeframeStartValue = endValue / (1 + (asset.trendPercentage * 0.4 / 100));
        break;
      case '1Y':
        timeframeStartValue = endValue / (1 + (asset.trendPercentage * 0.6 / 100));
        break;
      case '5Y':
        timeframeStartValue = endValue / (1 + (asset.trendPercentage * 0.9 / 100));
        break;
      case '10Y':
        timeframeStartValue = endValue / (1 + (asset.trendPercentage * 0.95 / 100));
        break;
      case 'ALL':
        timeframeStartValue = historicalMarketValue;
        break;
    }

    const difference = endValue - timeframeStartValue;
    let dataPoints: { label: string; value: number }[] = [];
    
    switch (timeframe) {
      case '1D':
        for (let i = 0; i < 24; i++) {
          const progress = i / 23;
          const value = timeframeStartValue + (difference * progress) + (Math.random() - 0.5) * (timeframeStartValue * 0.005);
          dataPoints.push({ label: `${i}:00`, value: Math.round(value) });
        }
        break;
      case '1W':
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        days.forEach((day, i) => {
          const progress = i / 6;
          const value = timeframeStartValue + (difference * progress) + (Math.random() - 0.5) * (timeframeStartValue * 0.01);
          dataPoints.push({ label: day, value: Math.round(value) });
        });
        break;
      case '1M':
        for (let i = 0; i < 5; i++) {
          const progress = i / 4;
          const value = timeframeStartValue + (difference * progress) + (Math.random() - 0.5) * (timeframeStartValue * 0.02);
          dataPoints.push({ label: `Week ${i + 1}`, value: Math.round(value) });
        }
        break;
      case 'YTD':
        const currentMonth = new Date().getMonth();
        const monthsYTD = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].slice(0, currentMonth + 1);
        
        monthsYTD.forEach((month, i) => {
          const progress = i / Math.max(1, monthsYTD.length - 1);
          const value = timeframeStartValue + (difference * progress) + (Math.random() - 0.5) * (timeframeStartValue * 0.03);
          dataPoints.push({ label: month, value: Math.round(value) });
        });
        break;
      case '1Y':
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        months.forEach((month, i) => {
          const progress = i / 11;
          const value = timeframeStartValue + (difference * progress) + (Math.random() - 0.5) * (timeframeStartValue * 0.04);
          dataPoints.push({ label: month, value: Math.round(value) });
        });
        break;
      case '5Y':
        for (let i = 0; i < 5; i++) {
          const year = new Date().getFullYear() - 4 + i;
          const progress = i / 4;
          const value = timeframeStartValue + (difference * progress) + (Math.random() - 0.5) * (timeframeStartValue * 0.05);
          dataPoints.push({ label: year.toString(), value: Math.round(value) });
        }
        break;
      case '10Y':
        for (let i = 0; i < 10; i++) {
          const year = new Date().getFullYear() - 9 + i;
          const progress = i / 9;
          const value = timeframeStartValue + (difference * progress) + (Math.random() - 0.5) * (timeframeStartValue * 0.08);
          dataPoints.push({ label: year.toString(), value: Math.round(value) });
        }
        break;
      case 'ALL':
        for (let i = 0; i < 24; i++) {
          const progress = i / 23;
          const value = timeframeStartValue + (difference * progress) + (Math.random() - 0.5) * (timeframeStartValue * 0.1);
          dataPoints.push({ label: `M${i+1}`, value: Math.round(value) });
        }
        break;
    }
    
    return dataPoints;
  };

  const itemHistory = generateItemHistory(activeTimeframe);
  const timeframes = ['1D', '1W', '1M', 'YTD', '1Y', '5Y', '10Y', 'ALL'];

  // Dynamic timeframe data calculation for the header
  const getTimeframeData = (timeframe: string) => {
    let change = 0;
    let percent = 0;
    let label = '';

    // Base the mock changes on the item's market trend percentage, NOT purchase price
    const basePercent = asset.trendPercentage;
    const historicalMarketValue = asset.currentMarketValue / (1 + (basePercent / 100));
    const baseChange = asset.currentMarketValue - historicalMarketValue;

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
        change = baseChange;
        percent = basePercent;
        label = 'All Time';
        break;
      default:
        change = baseChange * 0.02;
        percent = basePercent * 0.02;
        label = 'Today';
    }

    return { change, percent, label };
  };

  const timeframeData = getTimeframeData(activeTimeframe);
  const isTimeframePositive = timeframeData.change >= 0;
  const timeframeTrendColor = isTimeframePositive ? 'text-[#00A82D]' : 'text-[#9B2226]';
  const timeframeTrendHex = isTimeframePositive ? '#00A82D' : '#9B2226';

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

  const handleWatchlistAction = () => {
    if (isSearchResult) {
      // If it's a search item, toggle adding/removing
      setIsAddedToWatchlist(!isAddedToWatchlist);
      console.log(isAddedToWatchlist ? 'Removed from watchlist:' : 'Added to watchlist:', asset.brand, asset.model);
    } else {
      // If it's already in the watchlist, this removes it
      console.log('Removed from watchlist:', asset.brand, asset.model);
      onClose(); // Close modal after removing
    }
  };

  const handleRemoveFromCollection = () => {
    // In a real app, this would trigger an API call to remove the item from the user's portfolio
    console.log('Removed from collection:', asset.brand, asset.model);
    onClose(); // Close modal after removing
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    if (rawValue) {
      setSalePrice(Number(rawValue).toLocaleString('en-US'));
    } else {
      setSalePrice('');
    }
  };

  const handleConfirmSale = (e: React.FormEvent) => {
    e.preventDefault();
    const numericSalePrice = Number(salePrice.replace(/,/g, ''));
    const realizedGain = numericSalePrice - asset.purchasePrice;
    const realizedROI = (realizedGain / asset.purchasePrice) * 100;
    
    console.log('Asset Sold:', {
      item: asset.brand + ' ' + asset.model,
      salePrice: numericSalePrice,
      saleDate,
      realizedGain,
      realizedROI
    });
    
    setIsSelling(false);
    onClose();
  };

  const handleSaveAlert = () => {
    console.log('Saving alert preferences:', { alertType, alertThreshold });
    setIsAlertMenuOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/60 backdrop-blur-sm">
      <div className="bg-[#FAF9F6] w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-[#E8E8E3] shadow-2xl flex flex-col">
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
            
            {/* Notification Alert Menu */}
            <div className="relative" ref={alertMenuRef}>
              <button 
                onClick={() => setIsAlertMenuOpen(!isAlertMenuOpen)}
                className={`p-2 transition-colors rounded-full ${
                  alertType !== 'none' || isAlertMenuOpen
                    ? 'bg-[#1A1A1A] text-[#FAF9F6]' 
                    : 'hover:bg-[#E8E8E3] text-[#1A1A1A]'
                }`}
              >
                <Bell className="w-5 h-5" />
              </button>

              {/* Alert Dropdown */}
              {isAlertMenuOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-[#E8E8E3] shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-[#E8E8E3] bg-[#FAF9F6]">
                    <div className="font-editorial text-lg text-[#1A1A1A]">Price Alerts</div>
                    <div className="text-xs text-[#7A7A75] mt-1">Notify me when market value changes</div>
                  </div>

                  <div className="p-4 space-y-6">
                    <div>
                      <label className="block text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-3">
                        Alert Condition
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input 
                            type="radio" 
                            name="alertType" 
                            value="up" 
                            checked={alertType === 'up'}
                            onChange={() => setAlertType('up')}
                            className="accent-[#1A1A1A]"
                          />
                          <span className="text-sm text-[#1A1A1A]">When price goes <span className="text-[#00A82D] font-medium">UP</span></span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input 
                            type="radio" 
                            name="alertType" 
                            value="down" 
                            checked={alertType === 'down'}
                            onChange={() => setAlertType('down')}
                            className="accent-[#1A1A1A]"
                          />
                          <span className="text-sm text-[#1A1A1A]">When price goes <span className="text-[#9B2226] font-medium">DOWN</span></span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input 
                            type="radio" 
                            name="alertType" 
                            value="both" 
                            checked={alertType === 'both'}
                            onChange={() => setAlertType('both')}
                            className="accent-[#1A1A1A]"
                          />
                          <span className="text-sm text-[#1A1A1A]">Both (Up or Down)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-[#E8E8E3] mt-2">
                          <input 
                            type="radio" 
                            name="alertType" 
                            value="none" 
                            checked={alertType === 'none'}
                            onChange={() => setAlertType('none')}
                            className="accent-[#1A1A1A]"
                          />
                          <span className="text-sm text-[#7A7A75]">No alerts</span>
                        </label>
                      </div>
                    </div>

                    {alertType !== 'none' && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        <label className="block text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-2">
                          Threshold Percentage
                        </label>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-[#1A1A1A]">By at least</span>
                          <select 
                            value={alertThreshold}
                            onChange={(e) => setAlertThreshold(e.target.value)}
                            className="bg-white border border-[#E8E8E3] py-1.5 px-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors appearance-none"
                          >
                            <option value="2">2%</option>
                            <option value="5">5%</option>
                            <option value="10">10%</option>
                            <option value="15">15%</option>
                            <option value="20">20%</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-[#E8E8E3] bg-[#FAF9F6] flex justify-end gap-3">
                    <button 
                      onClick={() => setIsAlertMenuOpen(false)}
                      className="px-4 py-2 text-xs font-medium uppercase tracking-widest text-[#7A7A75] hover:text-[#1A1A1A] transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveAlert}
                      className="px-4 py-2 text-xs font-medium uppercase tracking-widest bg-[#1A1A1A] text-[#FAF9F6] hover:bg-[#333333] transition-colors"
                    >
                      Save Alert
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isWatchlistItem && (
              <button 
                onClick={handleWatchlistAction}
                className={`px-4 py-2 text-xs font-medium uppercase tracking-widest transition-colors flex items-center gap-2 ${
                  (!isSearchResult || isAddedToWatchlist)
                    ? 'bg-[#9B2226]/10 text-[#9B2226] border border-[#9B2226]/20 hover:bg-[#9B2226]/20' 
                    : 'bg-[#1A1A1A] text-[#FAF9F6] hover:bg-[#333333]'
                }`}
              >
                {(!isSearchResult || isAddedToWatchlist) ? (
                  <>
                    <BellOff className="w-3.5 h-3.5" />
                    Remove from Watchlist
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
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
        <div className="p-6 space-y-8 flex-1">
          {/* Sell Asset Form (Conditional) */}
          {isSelling && !isWatchlistItem && (
            <div ref={sellFormRef} className="vault-card p-6 border-[#1A1A1A] bg-white animate-in fade-in slide-in-from-top-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-editorial text-2xl text-[#1A1A1A]">Liquidate Asset</h3>
                <button 
                  onClick={() => setIsSelling(false)}
                  className="p-2 hover:bg-[#E8E8E3] transition-colors rounded-full"
                >
                  <X className="w-4 h-4 text-[#7A7A75]" />
                </button>
              </div>
              
              <form onSubmit={handleConfirmSale} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-2">
                      Sale Price (USD) <span className="text-[#9B2226]">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1A1A] font-medium">$</span>
                      <input 
                        type="text" 
                        required
                        value={salePrice}
                        onChange={handlePriceChange}
                        placeholder={asset.currentMarketValue.toLocaleString('en-US')}
                        className="w-full bg-white border border-[#E8E8E3] py-3 pl-8 pr-4 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors font-medium"
                        autoFocus
                      />
                    </div>
                    {salePrice && (
                      <p className={`text-xs mt-2 font-medium ${Number(salePrice.replace(/,/g, '')) >= asset.purchasePrice ? 'text-[#00A82D]' : 'text-[#9B2226]'}`}>
                        Realized Gain/Loss: {formatCurrency(Number(salePrice.replace(/,/g, '')) - asset.purchasePrice)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-2">
                      Date of Sale <span className="text-[#9B2226]">*</span>
                    </label>
                    <input 
                      type="date" 
                      required
                      value={saleDate}
                      onChange={(e) => setSaleDate(e.target.value)}
                      className="w-full bg-white border border-[#E8E8E3] py-3 px-4 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsSelling(false)}
                    className="flex-1 bg-white border border-[#E8E8E3] text-[#1A1A1A] py-4 text-sm font-medium uppercase tracking-widest hover:bg-[#F5F5F0] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!salePrice}
                    className="flex-1 bg-[#1A1A1A] text-[#FAF9F6] py-4 text-sm font-medium uppercase tracking-widest hover:bg-[#333333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Sale
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Current Value Section */}
          <div className={isSelling ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
            <p className="text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-2">Current Market Value</p>
            <h3 className="text-4xl md:text-5xl font-editorial text-[#1A1A1A] mb-3">
              {formatCurrency(asset.currentMarketValue)}
            </h3>
            {!isWatchlistItem && (
              <div className="flex items-center gap-3 text-sm font-medium">
                <span className={`${timeframeTrendColor}`}>
                  {isTimeframePositive ? '+' : ''}{formatCurrency(timeframeData.change)} ({isTimeframePositive ? '+' : ''}{formatPercentage(timeframeData.percent)}%)
                </span>
                <span className="text-[#7A7A75] uppercase tracking-wider text-xs">{timeframeData.label}</span>
              </div>
            )}
          </div>

          {/* Performance Chart */}
          <div className={isSelling ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
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
          <div className={`grid grid-cols-1 ${!isWatchlistItem ? 'sm:grid-cols-2' : ''} gap-6 ${isSelling ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}`}>
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
                <div className="flex justify-between items-center pb-2 border-b border-[#E8E8E3]">
                  <span className="text-sm text-[#7A7A75] uppercase tracking-wider">Retail Price</span>
                  <span className="font-medium text-[#1A1A1A]">{formatCurrency(retailPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#7A7A75] uppercase tracking-wider">Market vs Retail</span>
                  <span className={`font-medium ${retailTrendColor}`}>
                    {isAboveRetail ? '+' : ''}{formatPercentage(retailPremium)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className={`vault-card p-6 ${isSelling ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}`}>
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

        {/* Footer - Only show for Collection items */}
        {!isWatchlistItem && (
          <div className="p-6 border-t border-[#E8E8E3] bg-white flex flex-col sm:flex-row justify-end gap-4">
            <button 
              onClick={handleRemoveFromCollection}
              className="px-6 py-3 text-xs font-medium uppercase tracking-widest text-[#7A7A75] hover:text-[#9B2226] hover:bg-[#9B2226]/5 transition-colors flex items-center justify-center gap-2 border border-transparent hover:border-[#9B2226]/20"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
            <button 
              onClick={() => setIsSelling(true)}
              disabled={isSelling}
              className="px-8 py-3 text-xs font-medium uppercase tracking-widest bg-[#1A1A1A] text-[#FAF9F6] hover:bg-[#333333] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DollarSign className="w-4 h-4" />
              Liquidate Asset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

