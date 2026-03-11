"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '../components/Header';
import AssetList from '../components/AssetList';
import Watchlist from '../components/Watchlist';
import AddAssetModal from '../components/AddAssetModal';

// Dynamically import components that use Recharts to avoid SSR hydration issues
const PortfolioOverview = dynamic(() => import('../components/PortfolioOverview'), { ssr: false });
const Analytics = dynamic(() => import('../components/Analytics'), { ssr: false });

export default function Dashboard() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 flex flex-col lg:flex-row gap-12">
        
        {/* Left Column: Main Chart & Details */}
        <div className="flex-1 lg:w-[65%]">
          <PortfolioOverview />
          
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-zinc-800 pb-4">Portfolio Analytics</h2>
            <Analytics />
          </div>
        </div>

        {/* Right Column: Sidebar Lists */}
        <div className="w-full lg:w-[35%] space-y-8">
          <AssetList onAddClick={() => setIsAddModalOpen(true)} />
          <Watchlist />
        </div>

      </main>

      {/* Modals */}
      <AddAssetModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}

