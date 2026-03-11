"use client";

import React from 'react';
import { Search, Bell, User, Gem } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-zinc-800 bg-black sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer">
        <Gem className="w-6 h-6 text-[#00C805]" />
        <span className="text-xl font-bold tracking-tight text-white">SAC</span>
      </div>
      
      {/* Search - Centered */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full group">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" />
          <input 
            type="text" 
            placeholder="Search assets, brands..." 
            className="w-full bg-zinc-900 hover:bg-zinc-800 border border-transparent rounded-full py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:bg-zinc-900 focus:border-zinc-700 transition-all"
          />
        </div>
      </div>

      {/* Navigation & Profile */}
      <div className="flex items-center gap-6">
        <nav className="hidden lg:flex items-center gap-6 text-sm font-bold text-white">
          <a href="#" className="hover:text-[#00C805] transition-colors">Portfolio</a>
          <a href="#" className="hover:text-[#00C805] transition-colors">Cash</a>
          <a href="#" className="hover:text-[#00C805] transition-colors">Messages</a>
          <a href="#" className="hover:text-[#00C805] transition-colors">Account</a>
        </nav>

        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-zinc-900 rounded-full transition-colors">
            <Bell className="w-5 h-5 text-white" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00C805] rounded-full"></span>
          </button>
          <button className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors">
            <User className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
}

