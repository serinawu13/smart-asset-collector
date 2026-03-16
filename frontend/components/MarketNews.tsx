"use client";

import React from 'react';
import { ArrowUpRight } from 'lucide-react';

// Mock news data with images sourced from actual articles
const marketNews = [
  {
    id: 'news-1',
    source: 'Business of Fashion',
    title: 'The Resale Market for Luxury Watches Shows Signs of Stabilization',
    date: '2 hours ago',
    category: 'Watches',
    url: '#',
    // Using a specific watch market image to simulate an article thumbnail
    imageUrl: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&h=400&fit=crop'
  },
  {
    id: 'news-2',
    source: 'Vogue Business',
    title: 'Why Hermès Birkin Bags Continue to Outperform Traditional Investments',
    date: '5 hours ago',
    category: 'Bags',
    url: '#',
    // Using a specific Birkin image to simulate an article thumbnail
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop'
  },
  {
    id: 'news-3',
    source: 'The New York Times',
    title: 'Cartier and Van Cleef Lead the Surge in High Jewelry Demand',
    date: '1 day ago',
    category: 'Jewelry',
    url: '#',
    // Using a specific high jewelry image to simulate an article thumbnail
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop'
  },
  {
    id: 'news-4',
    source: 'Forbes',
    title: 'Rolex Prices on the Secondary Market: What Collectors Need to Know for Q4',
    date: '2 days ago',
    category: 'Watches',
    url: '#',
    // Using a specific Rolex image to simulate an article thumbnail
    imageUrl: 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=400&h=400&fit=crop'
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
            <div className="flex justify-between items-start gap-4 md:gap-6">
              {/* Article Content (Left Side) */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] md:text-xs font-medium text-[#1A1A1A] uppercase tracking-widest truncate">{news.source}</span>
                  <span className="text-[#E8E8E3] flex-shrink-0">•</span>
                  <span className="text-[10px] md:text-xs text-[#7A7A75] flex-shrink-0">{news.date}</span>
                </div>
                <h3 className="font-editorial text-base md:text-lg text-[#1A1A1A] leading-snug group-hover:text-[#7A7A75] transition-colors line-clamp-3 pr-2">
                  {news.title}
                </h3>
                <div className="mt-3">
                  <span className="text-[9px] md:text-[10px] font-medium text-[#7A7A75] uppercase tracking-widest border border-[#E8E8E3] px-2 py-1 bg-[#F5F5F0]">
                    {news.category}
                  </span>
                </div>
              </div>

              {/* Article Image Thumbnail (Right Side - Google News Style) */}
              <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 bg-[#F5F5F0] border border-[#E8E8E3] overflow-hidden rounded-sm">
                <img 
                  src={news.imageUrl} 
                  alt={news.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

