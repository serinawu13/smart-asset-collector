"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '../../components/Header';
import AssetList from '../../components/AssetList';
import Watchlist from '../../components/Watchlist';
import MarketNews from '../../components/MarketNews';
import AddAssetModal from '../../components/AddAssetModal';
import { Plus } from 'lucide-react';

const PortfolioOverview = dynamic(() => import('../../components/PortfolioOverview'), { ssr: false });

export default function Dashboard() {
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true); // Simulate new user state

  // In a real app, this would check if the user has any assets in their portfolio
  // For this mock, we'll just use a toggle to show the empty state
  const hasAssets = !isNewUser;

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-6 sm:pt-8 md:pt-12 pb-12 sm:pb-16 md:pb-24">
        
        {!hasAssets ? (
          /* Empty State / Onboarding View */
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in duration-1000">
            <div className="w-24 h-24 bg-white border border-[#E8E8E3] rounded-full flex items-center justify-center mb-8 shadow-sm">
              <span className="font-editorial text-4xl text-[#1A1A1A]">S</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-editorial text-[#1A1A1A] mb-4">
              Welcome to your private vault.
            </h1>
            <p className="text-lg text-[#7A7A75] max-w-md mb-10 font-light">
              Your collection is currently empty. Begin tracking your net worth by adding your first luxury asset.
            </p>
            <button 
              onClick={() => setIsAddAssetModalOpen(true)}
              className="bg-[#1A1A1A] text-[#FAF9F6] px-8 py-4 text-sm font-medium uppercase tracking-widest hover:bg-[#333333] transition-colors flex items-center gap-3 group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              Acquire First Asset
            </button>
            
            {/* Temporary toggle for demo purposes */}
            <button 
              onClick={() => setIsNewUser(false)}
              className="mt-12 text-xs text-[#7A7A75] underline hover:text-[#1A1A1A] transition-colors"
            >
              (Demo: Skip onboarding and show populated vault)
            </button>
          </div>
        ) : (
          /* Populated Dashboard View */
          <div className="flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-16 animate-in fade-in duration-500">
            {/* Left Column: Main Chart & News */}
            <div className="flex-1 lg:w-[60%]">
              <PortfolioOverview />
              <MarketNews />
            </div>

            {/* Right Column: Sidebar Lists */}
            <div className="w-full lg:w-[40%] space-y-8 md:space-y-12">
              <AssetList onAddClick={() => setIsAddAssetModalOpen(true)} />
              <Watchlist />
            </div>
          </div>
        )}

      </main>

      {/* Add Asset Modal */}
      <AddAssetModal 
        isOpen={isAddAssetModalOpen} 
        onClose={() => {
          setIsAddAssetModalOpen(false);
          // If they were a new user and added an asset, show the dashboard
          // In a real app, this would happen automatically when the portfolio data updates
          if (isNewUser) {
            setTimeout(() => setIsNewUser(false), 500);
          }
        }} 
      />
    </div>
  );
}

