"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, User, Menu, X, TrendingUp, MessageCircle, Settings, LogOut, ChevronRight } from 'lucide-react';
import { luxuryDatabase, initialWatchlist } from '../lib/mockData';
import ItemDetailModal from './ItemDetailModal';
import type { PortfolioAsset } from '../lib/mockData';

export default function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PortfolioAsset | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSearchItem, setIsSearchItem] = useState(false);
  
  // Settings state
  const [currency, setCurrency] = useState('USD');
  
  const searchRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper function to remove accents/diacritics from strings
  const removeAccents = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  // Filter database based on search query (ignoring accents)
  const searchResults = searchQuery.trim() === '' 
    ? [] 
    : luxuryDatabase.filter(item => {
        const normalizedQuery = removeAccents(searchQuery.toLowerCase());
        const normalizedBrand = removeAccents(item.brand.toLowerCase());
        const normalizedModel = removeAccents(item.model.toLowerCase());
        
        return normalizedBrand.includes(normalizedQuery) || 
               normalizedModel.includes(normalizedQuery);
      }).slice(0, 5); // Limit to 5 results

  // Trending items based on online mentions in the last 30 days
  const trendingItems = [...luxuryDatabase]
    .sort((a, b) => (b.mentions30Days || 0) - (a.mentions30Days || 0))
    .slice(0, 3);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatMentions = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  const handleResultClick = (item: typeof luxuryDatabase[0]) => {
    // Check if this item is already in the user's watchlist
    const isInWatchlist = initialWatchlist.some(w => w.id === item.id);
    
    // Convert LuxuryItem to PortfolioAsset format for the modal
    const assetForModal: PortfolioAsset = {
      ...item,
      portfolioId: `search-${item.id}`,
      purchasePrice: item.retailPrice || item.currentMarketValue,
      purchaseDate: new Date().toISOString().split('T')[0],
      condition: 'N/A',
      serialNumber: undefined,
    };
    
    setSelectedItem(assetForModal);
    setIsSearchItem(!isInWatchlist); // If it's in the watchlist, it's not a "new" search item
    setIsDetailModalOpen(true);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleSignOut = () => {
    setIsSettingsOpen(false);
    router.push('/');
  };

  return (
    <>
      <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between border-b border-[#E8E8E3] bg-[#FAF9F6] sticky top-0 z-40">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
          <span className="text-2xl md:text-3xl font-editorial font-bold tracking-widest text-[#1A1A1A]">SAC</span>
        </Link>
        
        {/* Search - Hidden on mobile, centered on desktop */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8 relative" ref={searchRef}>
          <div className="relative w-full group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#7A7A75] transition-colors" />
            <input 
              type="text" 
              placeholder="Search the vault..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full bg-white border border-[#E8E8E3] rounded-none py-2.5 pl-11 pr-10 text-sm text-[#1A1A1A] placeholder:text-[#7A7A75] focus:outline-none focus:border-[#1A1A1A] transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#F5F5F0] rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5 text-[#7A7A75]" />
              </button>
            )}
          </div>

          {/* Search Results / Trending Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E8E8E3] shadow-xl z-50 max-h-[400px] overflow-y-auto">
              
              {/* Show Trending when search is empty */}
              {searchQuery.trim() === '' ? (
                <div className="py-2">
                  <div className="px-4 py-3 text-xs font-medium text-[#7A7A75] uppercase tracking-widest border-b border-[#E8E8E3] flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Trending Now
                  </div>
                  {trendingItems.map((item) => (
                    <button
                      key={`trending-${item.id}`}
                      onClick={() => handleResultClick(item)}
                      className="w-full px-4 py-3 flex items-center gap-4 hover:bg-[#F5F5F0] transition-colors text-left border-b border-[#E8E8E3] last:border-0"
                    >
                      <div className="w-10 h-10 bg-[#FAF9F6] border border-[#E8E8E3] flex-shrink-0">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.model} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-editorial text-base text-[#1A1A1A] truncate">{item.brand}</div>
                        <div className="text-xs text-[#7A7A75] truncate">{item.model}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-medium text-[#1A1A1A]">{formatCurrency(item.currentMarketValue)}</div>
                        <div className="flex items-center justify-end gap-1 text-[10px] font-medium text-[#7A7A75] mt-0.5">
                          <MessageCircle className="w-3 h-3" />
                          {formatMentions(item.mentions30Days || 0)} mentions
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                /* Show Search Results when typing */
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-medium text-[#7A7A75] uppercase tracking-widest border-b border-[#E8E8E3]">
                    Market Results
                  </div>
                  {searchResults.length > 0 ? (
                    searchResults.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleResultClick(item)}
                        className="w-full px-4 py-3 flex items-center gap-4 hover:bg-[#F5F5F0] transition-colors text-left border-b border-[#E8E8E3] last:border-0"
                      >
                        <div className="w-10 h-10 bg-[#FAF9F6] border border-[#E8E8E3] flex-shrink-0">
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.model} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-editorial text-base text-[#1A1A1A] truncate">{item.brand}</div>
                          <div className="text-xs text-[#7A7A75] truncate">{item.model}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-medium text-[#1A1A1A]">{formatCurrency(item.currentMarketValue)}</div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-center text-sm text-[#7A7A75]">
                      No items found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Actions */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Mobile Search Button */}
          <button className="lg:hidden p-2 hover:bg-[#E8E8E3] rounded-full transition-colors">
            <Search className="w-5 h-5 text-[#1A1A1A]" />
          </button>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2 hover:bg-[#E8E8E3] rounded-full transition-colors">
            <Menu className="w-5 h-5 text-[#1A1A1A]" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-[#E8E8E3] rounded-full transition-colors">
            <Bell className="w-4 h-4 md:w-5 md:h-5 text-[#1A1A1A]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#9B2226] rounded-full"></span>
          </button>

          {/* Profile / Settings */}
          <div className="relative" ref={settingsRef}>
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-colors ${
                isSettingsOpen ? 'bg-[#333333]' : 'bg-[#1A1A1A] hover:bg-[#333333]'
              }`}
            >
              <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#FAF9F6]" />
            </button>

            {/* Settings Dropdown */}
            {isSettingsOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-white border border-[#E8E8E3] shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-4 border-b border-[#E8E8E3] bg-[#FAF9F6]">
                  <div className="font-editorial text-lg text-[#1A1A1A]">Account Settings</div>
                  <div className="text-xs text-[#7A7A75] mt-1">Manage your vault preferences</div>
                </div>

                <div className="p-4 space-y-6">
                  {/* Currency Preference */}
                  <div>
                    <label className="block text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-2">
                      Preferred Currency
                    </label>
                    <select 
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-white border border-[#E8E8E3] py-2 px-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors appearance-none"
                    >
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                      <option value="CHF">CHF (Fr) - Swiss Franc</option>
                    </select>
                  </div>
                </div>

                <div className="p-2 border-t border-[#E8E8E3] bg-[#FAF9F6]">
                  <button 
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left text-sm font-medium text-[#9B2226] hover:bg-[#9B2226]/10 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Item Detail Modal for Search Results */}
      {isDetailModalOpen && (
        <ItemDetailModal 
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          asset={selectedItem}
          isWatchlistItem={true} // Treat search results like watchlist items (hide purchase details)
          isSearchItem={isSearchItem} // Pass whether it's a new search item or already in watchlist
        />
      )}
    </>
  );
}

