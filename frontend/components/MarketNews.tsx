"use client";

import React from 'react';
import { ArrowUpRight } from 'lucide-react';

// Mock news data
const marketNews = [
  {
    id: 'news-1',
    source: 'Business of Fashion',
    title: 'The Resale Market for Luxury Watches Shows Signs of Stabilization',
    date: '2 hours ago',
    category: 'Watches',
    url: '#'
  },
  {
    id: 'news-2',
    source: 'Vogue Business',
    title: 'Why Hermès Birkin Bags Continue to Outperform Traditional Investments',
    date: '5 hours ago',
    category: 'Bags',
    url: '#'
  },
  {
    id: 'news-3',
    source: 'The New York Times',
    title: 'Cartier and Van Cleef Lead the Surge in High Jewelry Demand',
    date: '1 day ago',
    category: 'Jewelry',
    url: '#'
  },
  {
    id: 'news-4',
    source: 'Forbes',
    title: 'Rolex Prices on the Secondary Market: What Collectors Need to Know for Q4',
    date: '2 days ago',
    category: 'Watches',
    url: '#'
  }
];

export default function MarketNews() {
  return (
    <div className="vault-card mt-8 md:mt-12">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-[#E8E8E3] bg-[#FAF9F6] flex justify-between items-center">
        <h2 className="font-editorial text-xl md:text-2xl text-[#1A1A1A]">Market News</h2>
        <button className="text-xs font-medium text-[#7A7A75] uppercase tracking-widest hover:text-[#1A1A1A] transition-colors flex items-center gap-1">
          View All <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* News List */}
      <div className="flex flex-col">
        {marketNews.map((news) => (
          <a 
            key={news.id} 
            href={news.url}
            className="p-4 md:p-6 border-b border-[#E8E8E3] last:border-0 vault-hover group block"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-[#1A1A1A] uppercase tracking-widest">{news.source}</span>
                  <span className="text-[#E8E8E3]">•</span>
                  <span className="text-xs text-[#7A7A75]">{news.date}</span>
                </div>
                <h3 className="font-editorial text-lg md:text-xl text-[#1A1A1A] leading-snug group-hover:text-[#7A7A75] transition-colors">
                  {news.title}
                </h3>
                <div className="mt-3">
                  <span className="text-[10px] font-medium text-[#7A7A75] uppercase tracking-widest border border-[#E8E8E3] px-2 py-1 bg-[#F5F5F0]">
                    {news.category}
                  </span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

