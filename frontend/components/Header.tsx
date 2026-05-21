"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, Settings, Check, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import SearchBar from './SearchBar';
import { NotificationCenter } from './NotificationCenter';

interface HeaderProps {
  userName?: string;
  onDataUpdated?: () => void;
}

export default function Header({ userName, onDataUpdated }: HeaderProps) {
  const router = useRouter();
  const { user, logout, updateSettings } = useAuth();
  const displayName = userName || user?.name || 'Collector';
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [updatingCurrency, setUpdatingCurrency] = useState(false);
  const [updatingNotifications, setUpdatingNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleCurrencyChange = async (currency: string) => {
    try {
      setUpdatingCurrency(true);
      await updateSettings({ currency });
      setShowSettings(false);
    } catch (error) {
      console.error('Failed to update currency:', error);
    } finally {
      setUpdatingCurrency(false);
    }
  };

  const handleNotificationToggle = async (type: 'inApp' | 'email') => {
    try {
      setUpdatingNotifications(true);
      const currentPrefs = user?.notificationPrefs || { inApp: true, email: true };
      const newPrefs = {
        ...currentPrefs,
        [type]: !currentPrefs[type]
      };
      await updateSettings({ notificationPrefs: newPrefs });
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    } finally {
      setUpdatingNotifications(false);
    }
  };

  return (
    <>
      <header className="h-20 px-4 md:px-6 lg:px-12 flex items-center justify-between border-b border-[#E8E8E3] bg-[#FAF9F6] sticky top-0 z-50">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-2 md:gap-8 flex-shrink-0">
          <div className="text-xl md:text-2xl font-editorial font-bold tracking-widest text-[#1A1A1A]">
            SAC
          </div>
          <div className="hidden xl:block text-xs font-medium text-[#7A7A75] uppercase tracking-widest">
            Smart Asset Collector
          </div>
          <button
            onClick={() => router.push('/catalog')}
            className="hidden sm:block text-xs font-medium text-[#7A7A75] uppercase tracking-widest hover:text-[#1A1A1A] transition-colors"
          >
            Catalog
          </button>
        </div>

        {/* Center: Search Bar - Desktop (md and up) */}
        <div className="hidden md:block flex-1 max-w-md mx-4 lg:mx-8">
          <SearchBar onDataUpdated={onDataUpdated} />
        </div>

        {/* Right: User Info, Notifications, Settings & Logout */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {/* Mobile Search Button */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-2 border border-[#E8E8E3] hover:border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#FAF9F6] transition-colors text-[#7A7A75] hover:text-[#FAF9F6]"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white border border-[#E8E8E3]">
            <User className="w-4 h-4 text-[#7A7A75]" />
            <span className="text-sm text-[#1A1A1A] font-medium">{displayName}</span>
          </div>
          
          {/* Notification Center */}
          <NotificationCenter />
        
        {/* Settings Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 border border-[#E8E8E3] hover:border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#FAF9F6] transition-colors text-[#7A7A75] hover:text-[#FAF9F6]"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          {showSettings && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowSettings(false)}
              />
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E8E8E3] shadow-lg z-50">
                {/* Currency Section */}
                <div className="p-3 border-b border-[#E8E8E3]">
                  <div className="text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-2">
                    Currency
                  </div>
                  <div className="space-y-1">
                    {['USD', 'EUR', 'GBP', 'CHF'].map((currency) => (
                      <button
                        key={currency}
                        onClick={() => handleCurrencyChange(currency)}
                        disabled={updatingCurrency}
                        className={`w-full text-left px-2 py-1 text-sm transition-colors ${
                          user?.currency === currency
                            ? 'bg-[#1A1A1A] text-[#FAF9F6]'
                            : 'hover:bg-[#F5F5F0] text-[#1A1A1A]'
                        } ${updatingCurrency ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {currency}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notification Preferences Section */}
                <div className="p-3">
                  <div className="text-xs font-medium text-[#7A7A75] uppercase tracking-widest mb-2">
                    Notifications
                  </div>
                  <div className="space-y-2">
                    <div
                      onClick={() => !updatingNotifications && handleNotificationToggle('inApp')}
                      className={`w-full flex items-center justify-between px-2 py-1.5 text-sm transition-colors hover:bg-[#F5F5F0] select-none cursor-pointer ${
                        updatingNotifications ? 'opacity-50 pointer-events-none' : ''
                      }`}
                      style={{ WebkitTapHighlightColor: 'transparent', WebkitUserSelect: 'none' }}
                    >
                      <span className="text-[#1A1A1A]">In-App</span>
                      <div
                        className={`w-4 h-4 border-2 flex items-center justify-center transition-colors ${
                          user?.notificationPrefs?.inApp
                            ? 'bg-[#1A1A1A] border-[#1A1A1A]'
                            : 'border-[#E8E8E3] bg-white'
                        }`}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        {user?.notificationPrefs?.inApp && (
                          <Check className="w-3 h-3 text-[#FAF9F6]" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                    <div
                      onClick={() => !updatingNotifications && handleNotificationToggle('email')}
                      className={`w-full flex items-center justify-between px-2 py-1.5 text-sm transition-colors hover:bg-[#F5F5F0] select-none cursor-pointer ${
                        updatingNotifications ? 'opacity-50 pointer-events-none' : ''
                      }`}
                      style={{ WebkitTapHighlightColor: 'transparent', WebkitUserSelect: 'none' }}
                    >
                      <span className="text-[#1A1A1A]">Email</span>
                      <div
                        className={`w-4 h-4 border-2 flex items-center justify-center transition-colors ${
                          user?.notificationPrefs?.email
                            ? 'bg-[#1A1A1A] border-[#1A1A1A]'
                            : 'border-[#E8E8E3] bg-white'
                        }`}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        {user?.notificationPrefs?.email && (
                          <Check className="w-3 h-3 text-[#FAF9F6]" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
          <button
            onClick={handleLogout}
            className="p-2 border border-[#E8E8E3] hover:border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#FAF9F6] transition-colors text-[#7A7A75] hover:text-[#FAF9F6] flex items-center gap-2 text-xs uppercase tracking-widest font-medium"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden lg:inline">Exit</span>
          </button>
        </div>
      </header>

      {/* Mobile Search Bar - Slides down below header */}
      {showMobileSearch && (
        <div className="md:hidden sticky top-20 z-40 bg-[#FAF9F6] border-b border-[#E8E8E3] px-4 py-3 animate-in slide-in-from-top-2 duration-200">
          <SearchBar onDataUpdated={onDataUpdated} />
        </div>
      )}
    </>
  );
}
