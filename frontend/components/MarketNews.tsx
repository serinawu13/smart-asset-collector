"use client";

import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import api from '@/lib/api';

interface NewsArticle {
  id: string;
  source: string;
  title: string;
  date: string;
  category: string;
  url: string;
  image_url?: string;
}

export default function MarketNews() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [allNews, setAllNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await api.getNews(4);
        setNews(response.articles);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch news:', err);
        setError('Failed to load market news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleViewAll = async () => {
    if (showAll) {
      setShowAll(false);
    } else {
      if (allNews.length === 0) {
        try {
          const response = await api.getNews(20); // Fetch more articles
          setAllNews(response.articles);
        } catch (err) {
          console.error('Failed to fetch all news:', err);
        }
      }
      setShowAll(true);
    }
  };

  const displayedNews = showAll ? allNews : news;

  if (loading) {
    return (
      <div className="vault-card mt-8 md:mt-12">
        <div className="p-4 md:p-6 border-b border-[#E8E8E3] bg-[#FAF9F6]">
          <h2 className="font-editorial text-xl md:text-2xl text-[#1A1A1A]">Market News</h2>
        </div>
        <div className="p-8 text-center text-[#7A7A75]">
          Loading news...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vault-card mt-8 md:mt-12">
        <div className="p-4 md:p-6 border-b border-[#E8E8E3] bg-[#FAF9F6]">
          <h2 className="font-editorial text-xl md:text-2xl text-[#1A1A1A]">Market News</h2>
        </div>
        <div className="p-8 text-center text-[#7A7A75]">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="vault-card mt-8 md:mt-12">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-[#E8E8E3] bg-[#FAF9F6] flex justify-between items-center">
        <h2 className="font-editorial text-xl md:text-2xl text-[#1A1A1A]">Market News</h2>
        <button
          onClick={handleViewAll}
          className="text-xs font-medium text-[#7A7A75] uppercase tracking-widest hover:text-[#1A1A1A] transition-colors flex items-center gap-1"
        >
          {showAll ? 'Show Less' : 'View All'}
          {showAll ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* News List */}
      <div className="flex flex-col">
        {displayedNews.map((article) => (
          <a
            key={article.id}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 md:p-6 border-b border-[#E8E8E3] last:border-0 vault-hover group block"
          >
            <div className="flex justify-between items-start gap-4 md:gap-6">
              {/* Article Content (Left Side) */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] md:text-xs font-medium text-[#1A1A1A] uppercase tracking-widest truncate">{article.source}</span>
                  <span className="text-[#E8E8E3] flex-shrink-0">•</span>
                  <span className="text-[10px] md:text-xs text-[#7A7A75] flex-shrink-0">{article.date}</span>
                </div>
                <h3 className="font-editorial text-base md:text-lg text-[#1A1A1A] leading-snug group-hover:text-[#7A7A75] transition-colors line-clamp-3 pr-2">
                  {article.title}
                </h3>
                <div className="mt-3">
                  <span className="text-[9px] md:text-[10px] font-medium text-[#7A7A75] uppercase tracking-widest border border-[#E8E8E3] px-2 py-1 bg-[#F5F5F0]">
                    {article.category}
                  </span>
                </div>
              </div>

              {/* Article Image Thumbnail (Right Side - Google News Style) */}
              {article.image_url && (
                <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 bg-[#F5F5F0] border border-[#E8E8E3] overflow-hidden rounded-sm">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
