"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '../components/Header';
import AssetList from '../components/AssetList';
import Watchlist from '../components/Watchlist';
import AddAssetModal from '../components/AddAssetModal';

const PortfolioOverview = dynamic(() => import('../components/PortfolioOverview'), { ssr: false });

export default function Home() {
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-12 pb-24">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Left Column: Main Chart */}
          <div className="flex-1 lg:w-[60%]">
            <PortfolioOverview />
          </div>

          {/* Right Column: Sidebar Lists */}
          <div className="w-full lg:w-[40%] space-y-12">
            <AssetList onAddClick={() => setIsAddAssetModalOpen(true)} />
            <Watchlist />
          </div>

        </div>
      </main>

      {/* Add Asset Modal */}
      <AddAssetModal 
        isOpen={isAddAssetModalOpen} 
        onClose={() => setIsAddAssetModalOpen(false)} 
      />
    </div>
  );
}

