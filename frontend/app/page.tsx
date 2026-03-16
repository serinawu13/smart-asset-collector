"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      // In a real app, you would save this to state/context/localStorage
      // For this MVP, we'll just pass it via URL parameters to simulate state
      router.push(`/dashboard?name=${encodeURIComponent(name)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col overflow-hidden selection:bg-[#1A1A1A] selection:text-[#FAF9F6]">
      {/* Minimal Header */}
      <header className="h-24 px-8 md:px-12 flex items-center justify-between z-10 relative">
        <div className="text-3xl font-editorial font-bold tracking-widest text-[#1A1A1A]">SAC</div>
        <div className="text-sm font-medium text-[#7A7A75] uppercase tracking-widest">Smart Asset Collector</div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row items-center relative z-10">
        
        {/* Left Column - Copy & Form */}
        <div className="w-full lg:w-1/2 px-8 md:px-16 lg:px-24 py-12 lg:py-0 flex flex-col justify-center">
          <div className="max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-block border border-[#1A1A1A] px-3 py-1 mb-8">
              <span className="text-xs font-medium uppercase tracking-widest text-[#1A1A1A]">Private Beta</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-editorial text-[#1A1A1A] leading-[1.1] mb-8">
              The standard for luxury asset management.
            </h1>
            
            <p className="text-lg md:text-xl text-[#7A7A75] font-light leading-relaxed mb-12 max-w-md">
              Track the value of your collection of fine watches, jewelry, and bags with real-time market data, news, and analytics.
            </p>

            {/* Sign In Form */}
            <form onSubmit={handleSignIn} className="w-full max-w-md relative z-20 space-y-4">
              <div className="flex flex-col gap-4">
                <input 
                  type="text" 
                  required
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-[#E8E8E3] px-6 py-4 text-[#1A1A1A] placeholder:text-[#7A7A75] focus:outline-none focus:border-[#1A1A1A] transition-colors text-sm"
                />
                <input 
                  type="email" 
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#E8E8E3] px-6 py-4 text-[#1A1A1A] placeholder:text-[#7A7A75] focus:outline-none focus:border-[#1A1A1A] transition-colors text-sm"
                />
                <button 
                  type="submit"
                  className="w-full bg-[#1A1A1A] text-[#FAF9F6] px-8 py-4 text-sm font-medium uppercase tracking-widest hover:bg-[#333333] transition-colors flex items-center justify-center gap-2 group"
                >
                  Enter Vault
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <p className="text-xs text-[#7A7A75] mt-4 uppercase tracking-wider text-center">
                By entering, you agree to our Terms of Service.
              </p>
            </form>
          </div>
        </div>

        {/* Right Column - Editorial Visuals */}
        <div className="w-full lg:w-1/2 h-[60vh] lg:h-screen relative hidden lg:block">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#1A1A1A 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
          
          {/* Grid Elements Container */}
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
              
              {/* Image 1 - Watch */}
              <div className="relative bg-white border border-[#E8E8E3] shadow-xl p-3 group animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
                <div className="w-full h-full relative overflow-hidden bg-[#F5F5F0] aspect-square">
                  <img 
                    src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=800&fit=crop" 
                    alt="Luxury Watch" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                {/* Glassmorphic Price Tag */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md border border-[#E8E8E3] p-3 shadow-lg">
                  <div className="text-[10px] text-[#7A7A75] uppercase tracking-widest mb-1 truncate">Rolex Submariner</div>
                  <div className="font-editorial text-lg text-[#1A1A1A]">$14,500</div>
                  <div className="text-[10px] font-medium text-[#00A82D] mt-1">+41.46% since purchase</div>
                </div>
              </div>

              {/* Image 2 - Bag */}
              <div className="relative bg-white border border-[#E8E8E3] shadow-lg p-3 group animate-in fade-in slide-in-from-right-8 duration-1000 delay-500">
                <div className="w-full h-full relative overflow-hidden bg-[#F5F5F0] aspect-square">
                  <img 
                    src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=800&fit=crop" 
                    alt="Luxury Bag" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                {/* Glassmorphic Price Tag */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md border border-[#E8E8E3] p-3 shadow-lg">
                  <div className="text-[10px] text-[#7A7A75] uppercase tracking-widest mb-1 truncate">Hermès Birkin 30</div>
                  <div className="font-editorial text-lg text-[#1A1A1A]">$22,500</div>
                  <div className="text-[10px] font-medium text-[#00A82D] mt-1">+89.08% since purchase</div>
                </div>
              </div>

              {/* Image 3 - Jewelry */}
              <div className="relative bg-white border border-[#E8E8E3] shadow-lg p-3 group animate-in fade-in slide-in-from-right-8 duration-1000 delay-700">
                <div className="w-full h-full relative overflow-hidden bg-[#F5F5F0] aspect-square">
                  <img 
                    src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop" 
                    alt="Luxury Jewelry" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                {/* Glassmorphic Price Tag */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md border border-[#E8E8E3] p-3 shadow-lg">
                  <div className="text-[10px] text-[#7A7A75] uppercase tracking-widest mb-1 truncate">Cartier Love Bracelet</div>
                  <div className="font-editorial text-lg text-[#1A1A1A]">$7,350</div>
                  <div className="text-[10px] font-medium text-[#00A82D] mt-1">+6.52% since purchase</div>
                </div>
              </div>

              {/* Image 4 - Watch 2 */}
              <div className="relative bg-white border border-[#E8E8E3] shadow-lg p-3 group animate-in fade-in slide-in-from-right-8 duration-1000 delay-900">
                <div className="w-full h-full relative overflow-hidden bg-[#F5F5F0] aspect-square">
                  <img 
                    src="https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&h=800&fit=crop" 
                    alt="Patek Philippe" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                {/* Glassmorphic Price Tag */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md border border-[#E8E8E3] p-3 shadow-lg">
                  <div className="text-[10px] text-[#7A7A75] uppercase tracking-widest mb-1 truncate">Patek Nautilus</div>
                  <div className="font-editorial text-lg text-[#1A1A1A]">$115,000</div>
                  <div className="text-[10px] font-medium text-[#00A82D] mt-1">+229.57% since purchase</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

