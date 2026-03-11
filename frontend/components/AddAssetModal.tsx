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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800/50">
          <div>
            <h2 className="text-xl font-bold text-zinc-100">Add New Asset</h2>
            <p className="text-sm text-zinc-500">
              {step === 1 ? 'Select an item from the database' : 'Enter purchase details'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Search by brand or model (e.g., Rolex Submariner)" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-zinc-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                />
              </div>

              <div className="space-y-2 mt-4">
                {filteredItems.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedItem?.id === item.id 
                        ? 'bg-amber-500/10 border-amber-500/50' 
                        : 'bg-zinc-950/50 border-zinc-800/50 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-zinc-100">{item.brand}</h4>
                      <p className="text-sm text-zinc-400">{item.model}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded-md">{item.category}</span>
                        <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded-md">Market: ${item.currentMarketValue.toLocaleString()}</span>
                      </div>
                    </div>
                    {selectedItem?.id === item.id && (
                      <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-zinc-950" />
                      </div>
                    )}
                  </div>
                ))}
                {filteredItems.length === 0 && (
                  <div className="text-center py-8 text-zinc-500">
                    No items found matching "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {selectedItem && (
                <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50 mb-6">
                  <h4 className="font-bold text-zinc-100">{selectedItem.brand}</h4>
                  <p className="text-sm text-zinc-400">{selectedItem.model}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Purchase Price (USD)</label>
                  <input 
                    type="number" 
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="e.g. 10500"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Purchase Date</label>
                  <input 
                    type="date" 
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Condition</label>
                  <select 
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-zinc-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all appearance-none"
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
        <div className="p-6 border-t border-zinc-800/50 flex justify-end gap-3 bg-zinc-950/50">
          {step === 2 && (
            <button 
              onClick={() => setStep(1)}
              className="px-6 py-2 rounded-lg font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Back
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          {step === 1 ? (
            <button 
              onClick={() => setStep(2)}
              disabled={!selectedItem}
              className="px-6 py-2 rounded-lg font-medium bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button 
              onClick={handleSave}
              disabled={!purchasePrice || !purchaseDate}
              className="px-6 py-2 rounded-lg font-medium bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Portfolio
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

