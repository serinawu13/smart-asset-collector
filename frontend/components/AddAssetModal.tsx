"use client";

import React, { useState } from 'react';
import { X, Search, ChevronRight, ArrowLeft } from 'lucide-react';
import { luxuryDatabase, AssetCategory } from '../lib/mockData';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'category' | 'search' | 'details';

export default function AddAssetModal({ isOpen, onClose }: AddAssetModalProps) {
  const [step, setStep] = useState<Step>('category');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<typeof luxuryDatabase[0] | null>(null);
  
  // Form state
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [condition, setCondition] = useState('Excellent');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('');
  const [serialNumber, setSerialNumber] = useState('');

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

  const handleItemSelect = (item: typeof luxuryDatabase[0]) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Remove commas before saving to backend
    const numericPrice = Number(purchasePrice.replace(/,/g, ''));
    
    // In a real app, this would save to backend/state
    console.log('Adding asset:', {
      item: selectedItem,
      purchasePrice: numericPrice,
      purchaseDate,
      condition,
      size,
      color: color || undefined,
      material: material || undefined,
      serialNumber: serialNumber || undefined
    });
    handleClose();
  };

  // Helper function to remove accents/diacritics from strings
  const removeAccents = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  // Filter database based on selected category and search query (ignoring accents)
  const filteredItems = luxuryDatabase.filter(item => {
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    
    const normalizedQuery = removeAccents(searchQuery.toLowerCase());
    const normalizedBrand = removeAccents(item.brand.toLowerCase());
    const normalizedModel = removeAccents(item.model.toLowerCase());
    
    const matchesSearch = normalizedBrand.includes(normalizedQuery) || 
                         normalizedModel.includes(normalizedQuery);
                         
    return matchesCategory && matchesSearch;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
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
                />
              </div>

              <div className="space-y-2">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
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
                          <div className="text-sm font-medium text-[#1A1A1A]">Market: {formatCurrency(item.currentMarketValue)}</div>
                          {item.retailPrice && (
                            <div className="text-xs text-[#7A7A75] mt-1">Retail: {formatCurrency(item.retailPrice)}</div>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#7A7A75]" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-12 text-[#7A7A75]">
                    No items found matching your search.
                  </div>
                )}
              </div>
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
                      Current Market Value: {formatCurrency(selectedItem.currentMarketValue)}
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

                <div className="pt-4 border-t border-[#E8E8E3]">
                  <h3 className="text-sm font-medium text-[#1A1A1A] mb-4">Optional Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-2">
                        Material
                      </label>
                      <input 
                        type="text" 
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

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-[#1A1A1A] text-[#FAF9F6] py-4 text-sm font-medium uppercase tracking-widest hover:bg-[#333333] transition-colors"
                >
                  Add to Vault
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

