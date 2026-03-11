"use client";

import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between border-b border-[#E8E8E3] bg-[#FAF9F6] sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer">
        <span className="text-2xl md:text-3xl font-editorial font-bold tracking-widest text-[#1A1A1A]">SAC.</span>
      </div>
      
      {/* Search - Hidden on mobile, centered on desktop */}
      <div className="hidden lg:flex flex-1 max-w-md mx-8">
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
      <div className="flex items-center gap-3 md:gap-8">
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#7A7A75] uppercase tracking-widest">
          <a href="#" className="text-[#1A1A1A] border-b border-[#1A1A1A] pb-1">Portfolio</a>
        </nav>

        <div className="flex items-center gap-3 md:gap-5 md:border-l border-[#E8E8E3] md:pl-8">
          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2 hover:bg-[#E8E8E3] rounded-full transition-colors">
            <Menu className="w-5 h-5 text-[#1A1A1A]" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-[#E8E8E3] rounded-full transition-colors">
            <Bell className="w-4 h-4 md:w-5 md:h-5 text-[#1A1A1A]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#9B2226] rounded-full"></span>
          </button>

          {/* Profile */}
          <button className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#1A1A1A] flex items-center justify-center hover:bg-[#333333] transition-colors">
            <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#FAF9F6]" />
          </button>
        </div>
      </div>
    </header>
  );
}

