"use client";

import React from 'react';
import { Search, Bell, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-20 px-8 flex items-center justify-between border-b border-[#E8E8E3] bg-[#FAF9F6] sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer">
        <span className="text-3xl font-editorial font-bold tracking-widest text-[#1A1A1A]">SAC.</span>
      </div>
      
      {/* Search - Centered */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full group">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#7A7A75] transition-colors" />
          <input 
            type="text" 
            placeholder="Search the vault..." 
            className="w-full bg-white border border-[#E8E8E3] rounded-none py-2.5 pl-11 pr-4 text-sm text-[#1A1A1A] placeholder:text-[#7A7A75] focus:outline-none focus:border-[#1A1A1A] transition-all"
          />
        </div>
      </div>

      {/* Navigation & Profile */}
      <div className="flex items-center gap-8">
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#7A7A75] uppercase tracking-widest">
          <a href="#" className="text-[#1A1A1A] border-b border-[#1A1A1A] pb-1">Portfolio</a>
          <a href="#" className="hover:text-[#1A1A1A] transition-colors pb-1">Markets</a>
        </nav>

        <div className="flex items-center gap-5 border-l border-[#E8E8E3] pl-8">
          <button className="relative p-2 hover:bg-[#E8E8E3] rounded-full transition-colors">
            <Bell className="w-5 h-5 text-[#1A1A1A]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#9B2226] rounded-full"></span>
          </button>
          <button className="w-9 h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center hover:bg-[#333333] transition-colors">
            <User className="w-4 h-4 text-[#FAF9F6]" />
          </button>
        </div>
      </div>
    </header>
  );
}

