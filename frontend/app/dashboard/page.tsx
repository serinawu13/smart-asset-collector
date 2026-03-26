"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Header from '../../components/Header';
import AssetList from '../../components/AssetList';
import Watchlist from '../../components/Watchlist';
import MarketNews from '../../components/MarketNews';
import AddAssetModal from '../../components/AddAssetModal';

const PortfolioOverview = dynamic(() => import('../../components/PortfolioOverview'), { ssr: false });

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Function to trigger refresh of asset list and portfolio overview
  const handleAssetAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    // After adding first asset, check if we should exit onboarding
    checkOnboardingStatus();
  };

  // Check if user has any assets or watchlist items
  const checkOnboardingStatus = async () => {
    try {
      setIsCheckingOnboarding(true);
      const [portfolio, watchlist] = await Promise.all([
        api.getPortfolio(),
        api.getWatchlist()
      ]);
      
      // User is "new" if they have no portfolio assets AND no watchlist items
      const hasNoData = portfolio.length === 0 && watchlist.length === 0;
      setIsNewUser(hasNoData);
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      // On error, assume not a new user to show the dashboard
      setIsNewUser(false);
    } finally {
      setIsCheckingOnboarding(false);
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [loading, isAuthenticated, router]);

  // Check onboarding status when user is authenticated (only on initial load)
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      checkOnboardingStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAuthenticated]);

  // Get initials from name
  const getInitials = (name: string) => {
    if (!name) return 'S';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const initials = user ? getInitials(user.name) : 'S';
  const firstName = user?.name.split(' ')[0] || '';

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-[#7A7A75] text-sm uppercase tracking-widest">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Header userName={user.name} onDataUpdated={handleAssetAdded} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-6 sm:pt-8 md:pt-12 pb-12 sm:pb-16 md:pb-24">
        
        {isCheckingOnboarding ? (
          /* Loading onboarding state */
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-[#7A7A75] text-sm uppercase tracking-widest">Loading your vault...</div>
          </div>
        ) : isNewUser ? (
          /* Empty State / Onboarding View */
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in duration-1000">
            <div className="w-24 h-24 bg-white border border-[#E8E8E3] rounded-full flex items-center justify-center mb-8 shadow-sm">
              <span className="font-editorial text-4xl text-[#1A1A1A]">{initials}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-editorial text-[#1A1A1A] mb-4">
              Welcome to your private vault{firstName ? `, ${firstName}` : ''}.
            </h1>
            <p className="text-lg text-[#7A7A75] max-w-md mb-10 font-light">
              Your collection is currently empty. Begin tracking your net worth by adding your first luxury asset.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setIsAddAssetModalOpen(true)}
                className="bg-[#1A1A1A] text-[#FAF9F6] px-8 py-4 text-sm font-medium uppercase tracking-widest hover:bg-[#333333] transition-colors flex items-center justify-center gap-3 group"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                Acquire First Asset
              </button>
              <button
                onClick={() => {
                  // Focus on the search bar in the header
                  const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
                  if (searchInput) {
                    searchInput.focus();
                    searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                className="bg-white border border-[#E8E8E3] text-[#1A1A1A] px-8 py-4 text-sm font-medium uppercase tracking-widest hover:border-[#1A1A1A] transition-colors flex items-center justify-center gap-3 group"
              >
                <Search className="w-4 h-4" />
                Explore Catalog
              </button>
            </div>
          </div>
        ) : (
          /* Populated Dashboard View */
          <div className="flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-16 animate-in fade-in duration-500">
            {/* Left Column: Main Chart */}
            <div className="flex-1 lg:w-[60%]">
              <PortfolioOverview key={`portfolio-${refreshTrigger}`} />
            </div>

            {/* Right Column: Sidebar Lists & News */}
            <div className="w-full lg:w-[40%] space-y-8 md:space-y-12">
              <AssetList
                key={`assetlist-${refreshTrigger}`}
                onAddClick={() => setIsAddAssetModalOpen(true)}
                onAssetDeleted={handleAssetAdded}
              />
              <Watchlist refreshTrigger={refreshTrigger} />
              <MarketNews />
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
          if (isNewUser) {
            setTimeout(() => setIsNewUser(false), 500);
          }
        }}
        onAssetAdded={handleAssetAdded}
      />
    </div>
  );
}
