"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, Bell, User, Menu, X } from 'lucide-react';
import { luxuryDatabase } from '../lib/mockData';
import ItemDetailModal from './ItemDetailModal';
import type { PortfolioAsset } from '../lib/mockData';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PortfolioAsset | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter database based on search query
  const searchResults = searchQuery.trim() === '' 
    ? [] 
    : luxuryDatabase.filter(item => 
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.model.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5); // Limit to 5 results

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleResultClick = (item: typeof luxuryDatabase[0]) => {
    // Convert LuxuryItem to PortfolioAsset format for the modal
    // We treat search results similarly to watchlist items (not owned yet)
    const assetForModal: PortfolioAsset = {
      ...item,
      portfolioId: `search-${item.id}`,
      purchasePrice: item.retailPrice || item.currentMarketValue,
      purchaseDate: new Date().toISOString().split('T')[0],
      condition: 'N/A',
      serialNumber: undefined,
    };
    
    setSelectedItem(assetForModal);
    setIsDetailModalOpen(true);
    setIsSearchOpen(false);
    setSearchQuery('');
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

          {/* Search Results Dropdown */}
          {isSearchOpen && searchQuery.trim() !== '' && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E8E8E3] shadow-xl z-50 max-h-[400px] overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-medium text-[#7A7A75] uppercase tracking-widest border-b border-[#E8E8E3]">
                    Market Results
                  </div>
                  {searchResults.map((item) => (
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
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-[#7A7A75]">
                  No items found matching "{searchQuery}"
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

          {/* Profile */}
          <button className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center hover:bg-[#333333] transition-colors">
            <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#FAF9F6]" />
          </button>
        </div>
      </header>

      {/* Item Detail Modal for Search Results */}
      {isDetailModalOpen && (
        <ItemDetailModal 
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          asset={selectedItem}
          isWatchlistItem={true} // Treat search results like watchlist items (hide purchase details)
        />
      )}
    </>
  );
}

