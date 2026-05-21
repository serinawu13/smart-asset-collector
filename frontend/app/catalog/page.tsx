"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeft, TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { PortfolioAsset } from '@/lib/types';
import ItemDetailModal from '@/components/ItemDetailModal';
import AddAssetModal from '@/components/AddAssetModal';

type Category = 'Watch' | 'Bag' | 'Jewelry';

interface CatalogItem {
  id: string;
  brand: string;
  model: string;
  category: string;
  material?: string;
  size?: string;
  color?: string;
  currentMarketValue: number;
  retailPrice?: number;
  trend: string;
  trendPercentage: number;
  mentions30Days: number;
  imageUrl?: string;
}

const CATEGORIES: Category[] = ['Watch', 'Bag', 'Jewelry'];
const PAGE_SIZE = 20;

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5" />;
  if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5" />;
  return <Minus className="w-3.5 h-3.5" />;
}

function trendColor(trend: string) {
  if (trend === 'up') return 'text-emerald-600';
  if (trend === 'down') return 'text-red-500';
  return 'text-[#7A7A75]';
}

function toPortfolioAsset(item: CatalogItem): PortfolioAsset {
  return {
    portfolio_id: '',
    user_id: '',
    item_id: item.id,
    purchase_price: 0,
    purchase_date: '',
    quantity: 1,
    material: item.material,
    size: item.size,
    color: item.color,
    created_at: '',
    updated_at: '',
    item_details: {
      item_id: item.id,
      category: item.category,
      brand: item.brand,
      model: item.model,
      image_url: item.imageUrl,
      market_value: item.currentMarketValue,
      created_at: '',
      updated_at: '',
    },
    current_market_value: item.currentMarketValue,
    total_value: item.currentMarketValue,
    gain_loss: 0,
    gain_loss_percentage: 0,
    // Extra fields read via (asset as any) in ItemDetailModal
    ...(item.trendPercentage !== undefined && { trendPercentage: item.trendPercentage }),
    ...(item.retailPrice !== undefined && { retailPrice: item.retailPrice }),
  } as PortfolioAsset;
}

export default function CatalogPage() {
  const router = useRouter();

  const [items, setItems] = useState<CatalogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [page, setPage] = useState(1);

  const [selectedItem, setSelectedItem] = useState<{ asset: PortfolioAsset; raw: CatalogItem } | null>(null);
  const [addToVaultItem, setAddToVaultItem] = useState<CatalogItem | null>(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getItems({
        ...(category ? { category } : {}),
        ...(search ? { search } : {}),
        page,
        pageSize: PAGE_SIZE,
      });
      setItems(response.items);
      setTotal(response.total);
      setHasMore(response.hasMore);
    } catch {
      setError('Failed to load catalog. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [category, search, page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Reset to page 1 when filters change
  const handleCategoryChange = (c: Category | null) => {
    setCategory(c);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Top bar */}
      <div className="border-b border-[#E8E8E3] bg-[#FAF9F6] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-16 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[#7A7A75] hover:text-[#1A1A1A] transition-colors text-sm uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-[#E8E8E3]">|</span>
          <span className="text-sm uppercase tracking-widest text-[#1A1A1A] font-medium">
            Catalog
          </span>
          {total > 0 && !isLoading && (
            <span className="ml-auto text-xs text-[#7A7A75] uppercase tracking-widest">
              {total.toLocaleString()} items
            </span>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Category tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-4 py-2 text-xs font-medium uppercase tracking-widest border transition-colors ${
                !category
                  ? 'bg-[#1A1A1A] text-[#FAF9F6] border-[#1A1A1A]'
                  : 'bg-white text-[#7A7A75] border-[#E8E8E3] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => handleCategoryChange(c)}
                className={`px-4 py-2 text-xs font-medium uppercase tracking-widest border transition-colors ${
                  category === c
                    ? 'bg-[#1A1A1A] text-[#FAF9F6] border-[#1A1A1A]'
                    : 'bg-white text-[#7A7A75] border-[#E8E8E3] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 sm:ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7A7A75]" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search brand or model..."
                className="pl-9 pr-4 py-2 border border-[#E8E8E3] bg-white text-sm text-[#1A1A1A] placeholder-[#7A7A75] focus:outline-none focus:border-[#1A1A1A] w-64"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#1A1A1A] text-[#FAF9F6] text-xs font-medium uppercase tracking-widest hover:bg-[#333333] transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <span className="text-[#7A7A75] text-sm uppercase tracking-widest animate-pulse">
              Loading catalog...
            </span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-[#7A7A75] text-sm">{error}</p>
            <button
              onClick={fetchItems}
              className="px-6 py-2 border border-[#1A1A1A] text-xs uppercase tracking-widest hover:bg-[#1A1A1A] hover:text-[#FAF9F6] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-[#7A7A75] text-sm uppercase tracking-widest">No items found</p>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-[#E8E8E3]">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem({ asset: toPortfolioAsset(item), raw: item })}
                  className="bg-[#FAF9F6] p-5 flex flex-col gap-3 hover:bg-white transition-colors cursor-pointer"
                >
                  {/* Image */}
                  {item.imageUrl ? (
                    <div className="aspect-square bg-white overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={`${item.brand} ${item.model}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-[#E8E8E3] flex items-center justify-center">
                      <span className="text-[#7A7A75] text-xs uppercase tracking-widest">
                        {item.category}
                      </span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-[#7A7A75] uppercase tracking-widest">
                      {item.category}
                    </span>
                    <p className="text-sm font-medium text-[#1A1A1A] leading-tight">
                      {item.brand}
                    </p>
                    <p className="text-xs text-[#7A7A75] leading-tight line-clamp-2">
                      {item.model}
                    </p>
                  </div>

                  {/* Value & trend */}
                  <div className="mt-auto flex items-end justify-between">
                    <span className="text-sm font-medium text-[#1A1A1A]">
                      ${item.currentMarketValue.toLocaleString()}
                    </span>
                    <span className={`flex items-center gap-1 text-xs font-medium ${trendColor(item.trend)}`}>
                      <TrendIcon trend={item.trend} />
                      {item.trendPercentage > 0 ? '+' : ''}{item.trendPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1.5 px-4 py-2 border border-[#E8E8E3] text-xs uppercase tracking-widest text-[#7A7A75] hover:border-[#1A1A1A] hover:text-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>

                <span className="text-xs text-[#7A7A75] uppercase tracking-widest">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasMore}
                  className="flex items-center gap-1.5 px-4 py-2 border border-[#E8E8E3] text-xs uppercase tracking-widest text-[#7A7A75] hover:border-[#1A1A1A] hover:text-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <ItemDetailModal
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        asset={selectedItem?.asset ?? null}
        isSearchResult={true}
        onAddToVault={() => {
          setAddToVaultItem(selectedItem?.raw ?? null);
          setSelectedItem(null);
        }}
      />

      <AddAssetModal
        isOpen={addToVaultItem !== null}
        onClose={() => setAddToVaultItem(null)}
        initialItem={addToVaultItem ?? undefined}
        onAssetAdded={() => setAddToVaultItem(null)}
      />
    </div>
  );
}
