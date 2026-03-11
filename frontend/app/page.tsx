"use client";

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import PortfolioOverview from '../components/PortfolioOverview';
import AssetList from '../components/AssetList';
import Analytics from '../components/Analytics';
import Watchlist from '../components/Watchlist';
import AddAssetModal from '../components/AddAssetModal';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <PortfolioOverview />
            <AssetList onAddClick={() => setIsAddModalOpen(true)} />
          </div>
        );
      case 'portfolio':
        return <AssetList onAddClick={() => setIsAddModalOpen(true)} />;
      case 'analytics':
        return <Analytics />;
      case 'watchlist':
        return <Watchlist />;
      default:
        return <PortfolioOverview />;
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'portfolio': return 'My Assets';
      case 'analytics': return 'Analytics & Insights';
      case 'watchlist': return 'Watchlist';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.03)_0%,transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.03)_0%,transparent_50%)] pointer-events-none" />
      
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen relative z-10">
        <Header title={getHeaderTitle()} />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Modals */}
      <AddAssetModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}

