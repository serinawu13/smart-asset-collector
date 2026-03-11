"use client";

import React from 'react';
import { Bell, Search, User } from 'lucide-react';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="h-20 px-8 flex items-center justify-between border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-10">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-100">{title}</h1>
      
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search assets, brands..." 
            className="w-64 bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-zinc-900 transition-colors">
          <Bell className="w-5 h-5 text-zinc-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full border-2 border-zinc-950"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-zinc-800/50">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-zinc-200">Alex Collector</p>
            <p className="text-xs text-zinc-500">Premium Member</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <User className="w-5 h-5 text-zinc-400" />
          </div>
        </div>
      </div>
    </header>
  );
}

