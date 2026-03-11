"use client";

import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  PieChart, 
  Bell, 
  Settings, 
  LogOut,
  Gem
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'portfolio', label: 'My Assets', icon: Briefcase },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'watchlist', label: 'Watchlist', icon: Bell },
  ];

  return (
    <div className="w-64 h-screen bg-zinc-950 border-r border-zinc-800/50 flex flex-col fixed left-0 top-0 z-20">
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Gem className="w-5 h-5 text-zinc-950" />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-100">SAC</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-8 px-4 space-y-2">
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-2">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-zinc-900 text-amber-400 shadow-sm border border-zinc-800/50' 
                  : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-zinc-800/50 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 transition-all duration-200">
          <Settings className="w-5 h-5 text-zinc-500" />
          <span className="font-medium">Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-zinc-900/50 hover:text-rose-400 transition-all duration-200">
          <LogOut className="w-5 h-5 text-zinc-500" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

