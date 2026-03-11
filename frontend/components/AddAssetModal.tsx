"use client";

import React, { useState } from 'react';
import { X, Search, Check } from 'lucide-react';
import { luxuryDatabase, LuxuryItem } from '../lib/mockData';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddAssetModal({ isOpen, onClose }: AddAssetModalProps) {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<LuxuryItem | null>(null);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [condition, setCondition] = useState('Excellent');

  if (!isOpen) return null;

  const filteredItems = luxuryDatabase.filter(item => 
    item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    // In a real app, this would save to the database/state
    console.log('Saving asset:', { selectedItem, purchasePrice, purchaseDate, condition });
    onClose();
    // Reset state
    setTimeout(() => {
      setStep(1);
      setSelectedItem(null);
      setSearchQuery('');
      setPurchasePrice('');
      setPurchaseDate('');
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/40 backdrop-blur-sm">
      <div className="bg-[#FAF9F6] border border-[#E8E8E3] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-[#E8E8E3] bg-white">
          <div>
            <h2 className="font-editorial text-3xl text-[#1A1A1A]">Acquire Asset</h2>
            <p className="text-xs text-[#7A7A75] uppercase tracking-widest mt-2">
              {step === 1 ? 'Select from the archive' : 'Enter acquisition details'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#E8E8E3] text-[#1A1A1A] transition-colors rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1 bg-[#FAF9F6]">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#7A7A75]" />
                <input 
                  type="text" 
                  placeholder="Search by brand or model..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#E8E8E3] py-4 pl-12 pr-4 text-[#1A1A1A] placeholder:text-[#7A7A75] focus:outline-none focus:border-[#1A1A1A] transition-all"
                />
              </div>

              <div className="space-y-3 mt-6">
                {filteredItems.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-5 border cursor-pointer transition-all flex items-center justify-between bg-white ${
                      selectedItem?.id === item.id 
                        ? 'border-[#1A1A1A] shadow-sm' 
                        : 'border-[#E8E8E3] hover:border-[#1A1A1A]/50'
                    }`}
                  >
                    <div>
                      <h4 className="font-editorial text-xl text-[#1A1A1A]">{item.brand}</h4>
                      <p className="text-sm text-[#7A7A75] mt-1">{item.model}</p>
                      <div className="flex gap-3 mt-3">
                        <span className="text-xs text-[#1A1A1A] uppercase tracking-widest border border-[#E8E8E3] px-2 py-1">{item.category}</span>
                        <span className="text-xs text-[#1A1A1A] uppercase tracking-widest border border-[#E8E8E3] px-2 py-1">Est: ${item.currentMarketValue.toLocaleString()}</span>
                      </div>
                    </div>
                    {selectedItem?.id === item.id && (
                      <div className="w-8 h-8 bg-[#1A1A1A] flex items-center justify-center rounded-full">
                        <Check className="w-4 h-4 text-[#FAF9F6]" />
                      </div>
                    )}
                  </div>
                ))}
                {filteredItems.length === 0 && (
                  <div className="text-center py-12 text-[#7A7A75] font-editorial text-lg">
                    No items found in the archive matching "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {selectedItem && (
                <div className="p-6 bg-white border border-[#E8E8E3]">
                  <h4 className="font-editorial text-2xl text-[#1A1A1A]">{selectedItem.brand}</h4>
                  <p className="text-sm text-[#7A7A75] mt-1">{selectedItem.model}</p>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-2">Acquisition Price (USD)</label>
                  <input 
                    type="number" 
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="e.g. 10500"
                    className="w-full bg-white border border-[#E8E8E3] py-3 px-4 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-2">Date of Acquisition</label>
                  <input 
                    type="date" 
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full bg-white border border-[#E8E8E3] py-3 px-4 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-2">Condition</label>
                  <select 
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full bg-white border border-[#E8E8E3] py-3 px-4 text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-all appearance-none"
                  >
                    <option value="Pristine">Pristine / Unworn</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Very Good">Very Good</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#E8E8E3] flex justify-end gap-4 bg-white">
          {step === 2 && (
            <button 
              onClick={() => setStep(1)}
              className="px-6 py-3 text-xs uppercase tracking-widest font-medium text-[#7A7A75] hover:text-[#1A1A1A] transition-colors"
            >
              Back
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-6 py-3 text-xs uppercase tracking-widest font-medium text-[#7A7A75] hover:text-[#1A1A1A] transition-colors"
          >
            Cancel
          </button>
          {step === 1 ? (
            <button 
              onClick={() => setStep(2)}
              disabled={!selectedItem}
              className="px-8 py-3 text-xs uppercase tracking-widest font-medium bg-[#1A1A1A] text-[#FAF9F6] hover:bg-[#333333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button 
              onClick={handleSave}
              disabled={!purchasePrice || !purchaseDate}
              className="px-8 py-3 text-xs uppercase tracking-widest font-medium bg-[#1A1A1A] text-[#FAF9F6] hover:bg-[#333333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Vault
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

