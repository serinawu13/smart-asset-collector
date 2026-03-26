"use client";

import React, { useState, useEffect } from 'react';
import { X, Search, ChevronRight, ArrowLeft } from 'lucide-react';
import { AssetCategory } from '../lib/mockData';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { convertAndFormatCurrency } from '@/lib/currency';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetAdded?: () => void; // Callback to refresh the asset list
}

type Step = 'category' | 'search' | 'details';

interface CatalogItem {
  id: string;
  item_id?: string;
  brand: string;
  model: string;
  category: string;
  currentMarketValue: number;
  current_market_value?: number;
  retailPrice?: number;
  retail_price?: number;
  imageUrl?: string;
  image_url?: string;
  size?: string;
  color?: string;
  material?: string;
}

export default function AddAssetModal({ isOpen, onClose, onAssetAdded }: AddAssetModalProps) {
  const [step, setStep] = useState<Step>('category');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  
  // API state
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Form state
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [condition, setCondition] = useState('Excellent');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch items when category is selected
  useEffect(() => {
    if (selectedCategory && step === 'search') {
      fetchCatalogItems();
    }
  }, [selectedCategory, step]);

  const fetchCatalogItems = async () => {
    if (!selectedCategory) return;
    
    setIsLoadingItems(true);
    setLoadError(null);
    
    try {
      const items = await api.getItems({ category: selectedCategory });
      
      // Normalize the items to handle both snake_case and camelCase
      const normalizedItems = items.map((item: any) => ({
        id: item.id || item.item_id,
        item_id: item.item_id || item.id,
        brand: item.brand,
        model: item.model,
        category: item.category,
        currentMarketValue: item.current_market_value || item.currentMarketValue,
        current_market_value: item.current_market_value || item.currentMarketValue,
        retailPrice: item.retail_price || item.retailPrice,
        retail_price: item.retail_price || item.retailPrice,
        imageUrl: item.image_url || item.imageUrl,
        image_url: item.image_url || item.imageUrl,
        size: item.size,
        color: item.color,
        material: item.material,
      }));
      
      setCatalogItems(normalizedItems);
    } catch (error) {
      console.error('Failed to fetch catalog items:', error);
      setLoadError('Failed to load items. Please try again.');
    } finally {
      setIsLoadingItems(false);
    }
  };

  if (!isOpen) return null;

  const handleClose = () => {
    setStep('category');
    setSelectedCategory(null);
    setSearchQuery('');
    setSelectedItem(null);
    setPurchasePrice('');
    setCondition('Excellent');
    setSize('');
    setColor('');
    setMaterial('');
    setSerialNumber('');
    onClose();
  };

  const handleCategorySelect = (category: AssetCategory) => {
    setSelectedCategory(category);
    setStep('search');
  };

  const handleItemSelect = (item: CatalogItem) => {
    setSelectedItem(item);
    // Format the initial price with commas
    const initialPrice = item.retailPrice?.toString() || item.currentMarketValue.toString();
    setPurchasePrice(Number(initialPrice).toLocaleString('en-US'));
    
    // Pre-fill size, color and material if they exist in the database for this item
    setSize(item.size || '');
    setColor(item.color || '');
    setMaterial(item.material || '');
    setStep('details');
  };

  const handleBack = () => {
    if (step === 'details') setStep('search');
    if (step === 'search') {
      setStep('category');
      setSelectedCategory(null);
      setSearchQuery('');
      setCatalogItems([]);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any non-digit characters (except decimal point if needed)
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    if (rawValue) {
      // Format with commas
      setPurchasePrice(Number(rawValue).toLocaleString('en-US'));
    } else {
      setPurchasePrice('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Remove commas before saving to backend
      const numericPrice = Number(purchasePrice.replace(/,/g, ''));
      
      console.log('🔍 DEBUG: Starting asset addition process');
      console.log('🔍 DEBUG: Selected item:', selectedItem);
      
      // Step 1: Search for the item in the backend by brand and model
      console.log('🔍 Searching for item in backend...');
      console.log('🔍 Looking for:', { brand: selectedItem.brand, model: selectedItem.model, category: selectedItem.category });
      
      const searchResponse = await api.getItems({
        category: selectedItem.category,
        brand: selectedItem.brand,
      });
      
      console.log('🔍 Search response:', searchResponse);
      
      // The API returns an array of items directly
      const searchResults = Array.isArray(searchResponse) ? searchResponse : [];
      
      console.log('🔍 Search results array:', searchResults);
      console.log('🔍 Number of results:', searchResults.length);
      
      // Find exact match by model (try both exact and partial match)
      let matchingItem = searchResults.find(
        (item: any) => {
          console.log('🔍 Comparing:', {
            backendModel: item.model,
            frontendModel: selectedItem.model,
            match: item.model === selectedItem.model
          });
          return item.model === selectedItem.model && item.brand === selectedItem.brand;
        }
      );
      
      // If no exact match, try partial match (e.g., "Birkin 30" matches "Birkin 30")
      if (!matchingItem) {
        matchingItem = searchResults.find(
          (item: any) => {
            const backendModelLower = item.model.toLowerCase();
            const frontendModelLower = selectedItem.model.toLowerCase();
            return backendModelLower.includes(frontendModelLower) || frontendModelLower.includes(backendModelLower);
          }
        );
      }
      
      if (!matchingItem) {
        console.error('❌ No matching item found');
        console.error('Available items:', searchResults.map((i: any) => ({ brand: i.brand, model: i.model })));
        throw new Error(
          `Item "${selectedItem.brand} ${selectedItem.model}" not found in catalog. Please contact support to add this item.`
        );
      }
      
      console.log('✅ Found matching item in backend:', matchingItem);
      
      // Step 2: Add the item to the user's portfolio
      console.log('📝 Adding item to portfolio...');
      const itemId = matchingItem.id || matchingItem.item_id;
      if (!itemId) {
        throw new Error('Item ID not found');
      }
      
      await api.addToPortfolio({
        itemId: itemId,
        purchasePrice: numericPrice,
        purchaseDate: purchaseDate,
        condition: condition,
        material: material,
        size: size,
        color: color || undefined,
        serialNumber: serialNumber || undefined,
      });
      
      // Step 3: Trigger refresh of the asset list
      if (onAssetAdded) {
        onAssetAdded();
      }
      
      // Close the modal
      handleClose();
    } catch (error) {
      console.error('❌ ERROR: Failed to add asset:', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Failed to add asset. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to remove accents/diacritics from strings
  const removeAccents = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  // Filter catalog items based on search query (ignoring accents)
  const filteredItems = catalogItems.filter((item: CatalogItem) => {
    const normalizedQuery = removeAccents(searchQuery.toLowerCase());
    const normalizedBrand = removeAccents(item.brand.toLowerCase());
    const normalizedModel = removeAccents(item.model.toLowerCase());
    
    const matchesSearch = normalizedBrand.includes(normalizedQuery) ||
                         normalizedModel.includes(normalizedQuery);
                         
    return matchesSearch;
  });

  const { user } = useAuth();
  const currency = user?.currency || 'USD';
  
  const formatCurrencyValue = (value: number) => {
    return convertAndFormatCurrency(value, currency, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/60 backdrop-blur-sm">
      <div className="bg-[#FAF9F6] w-full max-w-2xl max-h-[90vh] flex flex-col border border-[#E8E8E3] shadow-2xl">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-[#E8E8E3] p-6 flex justify-between items-center bg-[#FAF9F6]">
          <div className="flex items-center gap-4">
            {step !== 'category' && (
              <button 
                onClick={handleBack}
                className="p-2 hover:bg-[#E8E8E3] transition-colors rounded-full -ml-2"
              >
                <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
              </button>
            )}
            <h2 className="font-editorial text-2xl text-[#1A1A1A]">
              {step === 'category' && 'Select Category'}
              {step === 'search' && `Select ${selectedCategory}`}
              {step === 'details' && 'Purchase Details'}
            </h2>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-[#E8E8E3] transition-colors rounded-full"
          >
            <X className="w-5 h-5 text-[#1A1A1A]" />
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Step 1: Category Selection */}
          {step === 'category' && (
            <div className="flex flex-col gap-4">
              {(['Watch', 'Jewelry', 'Bag'] as AssetCategory[]).map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className="vault-card p-6 flex items-center justify-between hover:border-[#1A1A1A] transition-colors group w-full text-left"
                >
                  <span className="font-editorial text-2xl text-[#1A1A1A] group-hover:translate-x-2 transition-transform">
                    {category === 'Watch' ? 'Watches' : category === 'Bag' ? 'Bags' : 'Jewelry'}
                  </span>
                  <ChevronRight className="w-5 h-5 text-[#7A7A75] group-hover:text-[#1A1A1A] transition-colors" />
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Search & Select Item */}
          {step === 'search' && (
            <div className="space-y-6">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#7A7A75]" />
                <input
                  type="text"
                  placeholder="Search by brand or model"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#E8E8E3] py-4 pl-12 pr-4 text-[#1A1A1A] placeholder:text-[#7A7A75] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                  autoFocus
                  disabled={isLoadingItems}
                />
              </div>

              {loadError && (
                <div className="p-4 bg-[#9B2226]/10 border border-[#9B2226] text-[#9B2226] text-sm">
                  {loadError}
                </div>
              )}

              {isLoadingItems ? (
                <div className="text-center py-12 text-[#7A7A75]">
                  Loading items...
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item: CatalogItem) => (
                    <button
                      key={item.id}
                      onClick={() => handleItemSelect(item)}
                      className="w-full vault-card p-4 flex items-center justify-between hover:border-[#1A1A1A] transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#F5F5F0] border border-[#E8E8E3] flex-shrink-0">
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.model} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <div className="font-editorial text-lg text-[#1A1A1A]">{item.brand}</div>
                          <div className="text-xs text-[#7A7A75] mt-1 uppercase tracking-wider">{item.model}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <div className="text-sm font-medium text-[#1A1A1A]">Market: {formatCurrencyValue(item.currentMarketValue)}</div>
                          {item.retailPrice && (
                            <div className="text-xs text-[#7A7A75] mt-1">Retail: {formatCurrencyValue(item.retailPrice)}</div>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#7A7A75]" />
                      </div>
                    </button>
                    ))
                  ) : (
                    <div className="text-center py-12 text-[#7A7A75]">
                      {catalogItems.length === 0
                        ? 'No items available in this category.'
                        : 'No items found matching your search.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Purchase Details Form */}
          {step === 'details' && selectedItem && (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Selected Item Summary */}
              <div className="vault-card p-4 flex items-center gap-4 bg-[#F5F5F0]">
                <div className="w-16 h-16 bg-white border border-[#E8E8E3] flex-shrink-0">
                  {selectedItem.imageUrl && (
                    <img src={selectedItem.imageUrl} alt={selectedItem.model} className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <div className="font-editorial text-xl text-[#1A1A1A]">{selectedItem.brand}</div>
                  <div className="text-sm text-[#7A7A75] mt-1 uppercase tracking-wider">{selectedItem.model}</div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-2">
                      Purchase Price (USD) <span className="text-[#9B2226]">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A1A1A] font-medium">$</span>
                      <input 
                        type="text" 
                        required
                        value={purchasePrice}
                        onChange={handlePriceChange}
                        className="w-full bg-white border border-[#E8E8E3] py-3 pl-8 pr-4 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors font-medium"
                      />
                    </div>
                    <p className="text-xs text-[#7A7A75] mt-2">
                      Current Market Value: {formatCurrencyValue(selectedItem.currentMarketValue)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-2">
                      Purchase Date <span className="text-[#9B2226]">*</span>
                    </label>
                    <input 
                      type="date" 
                      required
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="w-full bg-white border border-[#E8E8E3] py-3 px-4 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-2">
                      Condition <span className="text-[#9B2226]">*</span>
                    </label>
                    <select 
                      required
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full bg-white border border-[#E8E8E3] py-3 px-4 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors appearance-none"
                    >
                      <option value="Pristine">Pristine (Unworn/New)</option>
                      <option value="Excellent">Excellent (Barely worn, no scratches)</option>
                      <option value="Good">Good (Light wear, minor scratches)</option>
                      <option value="Fair">Fair (Visible wear and tear)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-2">
                      Size <span className="text-[#9B2226]">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      placeholder={selectedCategory === 'Watch' ? 'e.g. 41mm' : selectedCategory === 'Bag' ? 'e.g. 30cm' : 'e.g. 17'}
                      className="w-full bg-white border border-[#E8E8E3] py-3 px-4 text-[#1A1A1A] placeholder:text-[#7A7A75]/50 focus:outline-none focus:border-[#1A1A1A] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-2">
                      Material <span className="text-[#9B2226]">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      placeholder="e.g. 18K Gold, Epsom Leather"
                      className="w-full bg-white border border-[#E8E8E3] py-3 px-4 text-[#1A1A1A] placeholder:text-[#7A7A75]/50 focus:outline-none focus:border-[#1A1A1A] transition-colors"
                    />
                  </div>

                  {/* Only show Color field for Bags */}
                  {selectedCategory === 'Bag' && (
                    <div>
                      <label className="block text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-2">
                        Color
                      </label>
                      <input 
                        type="text" 
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        placeholder="e.g. Noir, Gold, Etoupe"
                        className="w-full bg-white border border-[#E8E8E3] py-3 px-4 text-[#1A1A1A] placeholder:text-[#7A7A75]/50 focus:outline-none focus:border-[#1A1A1A] transition-colors"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#E8E8E3]">
                  <h3 className="text-sm font-medium text-[#1A1A1A] mb-4">Optional Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-2">
                        Serial Number
                      </label>
                      <input 
                        type="text" 
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        placeholder="e.g. M8K12345"
                        className="w-full bg-white border border-[#E8E8E3] py-3 px-4 text-[#1A1A1A] placeholder:text-[#7A7A75]/50 focus:outline-none focus:border-[#1A1A1A] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="p-4 bg-[#9B2226]/10 border border-[#9B2226] text-[#9B2226] text-sm">
                  {submitError}
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1A1A1A] text-[#FAF9F6] py-4 text-sm font-medium uppercase tracking-widest hover:bg-[#333333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Adding to Vault...' : 'Add to Vault'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

