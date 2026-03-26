"use client";

import React, { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import type { PortfolioAsset } from '@/lib/types';
import ItemDetailModal from './ItemDetailModal';
import { useAuth } from '@/contexts/AuthContext';
import { convertAndFormatCurrency } from '@/lib/currency';

interface AssetListProps {
  onAddClick: () => void;
  onAssetDeleted?: () => void;
}

export default function AssetList({ onAddClick, onAssetDeleted }: AssetListProps) {
  const { user } = useAuth();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Watch', 'Bag', 'Jewelry']);
  const [selectedAsset, setSelectedAsset] = useState<PortfolioAsset | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currency = user?.currency || 'USD';

  useEffect(() => {
    fetchPortfolio();
  }, [currency]); // Re-fetch when currency changes

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const data = await api.getPortfolio();
      console.log('📦 Portfolio data loaded:', data.map((a: any) => ({
        id: a.portfolio_id,
        brand: a.item_details?.brand,
        alertActive: a.alertActive,
        alertType: a.alertType,
        alertThreshold: a.alertThreshold
      })));
      setPortfolio(data);
      setError(null);
      
      // If an asset was selected and it no longer exists, clear the selection
      if (selectedAsset) {
        const updatedAsset = data.find(asset => asset.portfolio_id === selectedAsset.portfolio_id);
        if (updatedAsset) {
          setSelectedAsset(updatedAsset);
        } else {
          setSelectedAsset(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch portfolio:', err);
      setError('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAssetDeleted = async () => {
    await fetchPortfolio();
    if (onAssetDeleted) {
      onAssetDeleted();
    }
  };
  

  const formatCurrencyValue = (value: number) => {
    return convertAndFormatCurrency(value, currency, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleAssetClick = (asset: PortfolioAsset) => {
    setSelectedAsset(asset);
    setIsDetailModalOpen(true);
  };

  // Group assets by category
  const groupedAssets = portfolio.reduce((acc, asset) => {
    const category = asset.item_details.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(asset);
    return acc;
  }, {} as Record<string, PortfolioAsset[]>);

  // Define category order
  const categoryOrder = ['Watch', 'Jewelry', 'Bag'];

  if (loading) {
    return (
      <div className="vault-card">
        <div className="p-4 md:p-6 border-b border-[#E8E8E3] flex justify-between items-center bg-[#FAF9F6]">
          <h2 className="font-editorial text-xl md:text-2xl text-[#1A1A1A]">Collection</h2>
          <button 
            onClick={onAddClick}
            className="p-2 border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#FAF9F6] transition-colors text-[#1A1A1A] flex items-center gap-2 text-xs uppercase tracking-widest font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Acquire</span>
          </button>
        </div>
        <div className="p-12 text-center">
          <div className="text-[#7A7A75] text-sm uppercase tracking-widest">Loading assets...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vault-card">
        <div className="p-4 md:p-6 border-b border-[#E8E8E3] flex justify-between items-center bg-[#FAF9F6]">
          <h2 className="font-editorial text-xl md:text-2xl text-[#1A1A1A]">Collection</h2>
          <button 
            onClick={onAddClick}
            className="p-2 border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#FAF9F6] transition-colors text-[#1A1A1A] flex items-center gap-2 text-xs uppercase tracking-widest font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Acquire</span>
          </button>
        </div>
        <div className="p-12 text-center">
          <div className="text-[#9B2226] text-sm mb-2">{error}</div>
          <button 
            onClick={fetchPortfolio}
            className="text-[#7A7A75] text-xs hover:text-[#1A1A1A] underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="vault-card">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-[#E8E8E3] flex justify-between items-center bg-[#FAF9F6]">
          <h2 className="font-editorial text-xl md:text-2xl text-[#1A1A1A]">Collection</h2>
          <button 
            onClick={onAddClick}
            className="p-2 border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#FAF9F6] transition-colors text-[#1A1A1A] flex items-center gap-2 text-xs uppercase tracking-widest font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Acquire</span>
          </button>
        </div>

        {/* Empty State */}
        {portfolio.length === 0 ? (
          <div className="p-8 md:p-12 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#F5F5F0] border border-[#E8E8E3] rounded-full flex items-center justify-center">
                <Plus className="w-7 h-7 text-[#7A7A75]" />
              </div>
              <h3 className="font-editorial text-xl text-[#1A1A1A] mb-2">No Assets Yet</h3>
              <p className="text-sm text-[#7A7A75] max-w-xs mx-auto">
                Start building your luxury collection by adding your first watch, bag, or jewelry piece.
              </p>
            </div>
            <button
              onClick={onAddClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] text-[#FAF9F6] text-xs uppercase tracking-widest hover:bg-[#333333] transition-colors group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              Add First Asset
            </button>
          </div>
        ) : (
          /* Categorized List */
          <div className="flex flex-col">
            {categoryOrder.map((category) => {
              const assets = groupedAssets[category] || [];
              if (assets.length === 0) return null;
              
              const isExpanded = expandedCategories.includes(category);
              const categoryTotal = assets.reduce((sum, asset) => sum + asset.total_value, 0);

              return (
                <div key={category}>
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full p-3 md:p-4 flex justify-between items-center vault-hover border-b border-[#E8E8E3] bg-[#F5F5F0]"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-[#7A7A75]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-[#7A7A75]" />
                      )}
                      <span className="text-xs font-medium text-[#7A7A75] uppercase tracking-widest">
                        {category === 'Watch' ? 'Watches' : category === 'Bag' ? 'Bags' : category}
                      </span>
                      <span className="text-xs text-[#7A7A75]">({assets.length})</span>
                    </div>
                    <span className="text-sm font-medium text-[#1A1A1A]">{formatCurrencyValue(categoryTotal)}</span>
                  </button>

                  {/* Category Items */}
                  {isExpanded && assets.map((asset) => {
                    const isPositive = asset.gain_loss_percentage >= 0;
                    const trendColor = isPositive ? 'text-[#00A82D]' : 'text-[#9B2226]';

                    return (
                      <button
                        key={asset.portfolio_id}
                        onClick={() => handleAssetClick(asset)}
                        className="w-full p-4 md:p-6 pl-8 md:pl-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 vault-hover border-b border-[#E8E8E3] last:border-0 text-left"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Product Image */}
                          <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 bg-[#F5F5F0] border border-[#E8E8E3] overflow-hidden">
                            {asset.item_details.image_url ? (
                              <img 
                                src={asset.item_details.image_url} 
                                alt={`${asset.item_details.brand} ${asset.item_details.model}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#7A7A75] text-[10px]">
                                No Image
                              </div>
                            )}
                          </div>

                          {/* Left: Name & Model */}
                          <div className="flex-1 min-w-0">
                            <div className="font-editorial text-base md:text-lg text-[#1A1A1A] truncate">
                              {asset.item_details.brand}
                            </div>
                            <div className="text-xs text-[#7A7A75] mt-1 uppercase tracking-wider truncate">
                              {asset.item_details.model}
                            </div>
                          </div>
                        </div>

                        {/* Right: Price Only (Color-coded) */}
                        <div className="text-left sm:text-right flex-shrink-0 mt-2 sm:mt-0 ml-16 sm:ml-0">
                          <div className={`font-medium text-sm md:text-base ${trendColor}`}>
                            {formatCurrencyValue(asset.total_value)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      <ItemDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        asset={selectedAsset}
        onAssetUpdated={handleAssetDeleted}
      />
    </>
  );
}
