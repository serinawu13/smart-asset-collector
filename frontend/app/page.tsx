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
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] font-sans selection:bg-[#1A1A1A] selection:text-[#FAF9F6]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-12 pb-24 flex flex-col lg:flex-row gap-16">
        
        {/* Left Column: Main Chart & Details */}
        <div className="flex-1 lg:w-[60%]">
          <PortfolioOverview />
          
          <div className="mt-20">
            <h2 className="font-editorial text-3xl text-[#1A1A1A] mb-8 border-b border-[#E8E8E3] pb-6">Portfolio Analytics</h2>
            <Analytics />
          </div>
        </div>

        {/* Right Column: Sidebar Lists */}
        <div className="w-full lg:w-[40%] space-y-12">
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

