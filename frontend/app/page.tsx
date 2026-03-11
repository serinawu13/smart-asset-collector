"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '../components/Header';
import AssetList from '../components/AssetList';
import Watchlist from '../components/Watchlist';
import AddAssetModal from '../components/AddAssetModal';

const PortfolioOverview = dynamic(() => import('../components/PortfolioOverview'), { ssr: false });
const Analytics = dynamic(() => import('../components/Analytics'), { ssr: false });

export default function Home() {
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Header />
      
      <main className="max-w-[1600px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Portfolio Chart */}
          <div className="lg:col-span-2">
            <PortfolioOverview />
            <Analytics />
          </div>

          {/* Right Column - Asset List & Watchlist */}
          <div className="lg:col-span-1">
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

