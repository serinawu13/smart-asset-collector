export type AssetCategory = 'Watch' | 'Bag' | 'Jewelry';
export type MarketTrend = 'up' | 'down' | 'stable';

export interface LuxuryItem {
  id: string;
  brand: string;
  model: string;
  category: AssetCategory;
  material?: string;
  size?: string;
  color?: string;
  currentMarketValue: number;
  retailPrice?: number;
  trend: MarketTrend;
  trendPercentage: number;
  mentions30Days?: number; // New field for online mentions
  imageUrl?: string;
}

export interface PortfolioAsset extends LuxuryItem {
  portfolioId: string;
  purchasePrice: number;
  purchaseDate: string;
  condition: string;
  serialNumber?: string;
}

export interface WatchlistItem extends LuxuryItem {
  watchlistId: string;
  targetPrice?: number;
  alertActive: boolean;
}

// Pre-populated database of luxury goods
export const luxuryDatabase: LuxuryItem[] = [
  {
    id: 'item-1',
    brand: 'Rolex',
    model: 'Submariner Date 126610LN',
    category: 'Watch',
    material: 'Oystersteel',
    size: '41mm',
    currentMarketValue: 14500,
    retailPrice: 10250,
    trend: 'up',
    trendPercentage: 2.4,
    mentions30Days: 12450, // High mentions
    imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=400&fit=crop',
  },
  {
    id: 'item-2',
    brand: 'Patek Philippe',
    model: 'Nautilus 5711/1A',
    category: 'Watch',
    material: 'Steel',
    size: '40mm',
    currentMarketValue: 115000,
    retailPrice: 34890,
    trend: 'stable',
    trendPercentage: 0.5,
    mentions30Days: 8900,
    imageUrl: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=400&h=400&fit=crop',
  },
  {
    id: 'item-3',
    brand: 'Audemars Piguet',
    model: 'Royal Oak 15500ST',
    category: 'Watch',
    material: 'Steel',
    size: '41mm',
    currentMarketValue: 42000,
    retailPrice: 27800,
    trend: 'down',
    trendPercentage: -1.2,
    mentions30Days: 6200,
    imageUrl: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=400&h=400&fit=crop',
  },
  {
    id: 'item-4',
    brand: 'Hermès',
    model: 'Birkin 30',
    category: 'Bag',
    material: 'Togo Leather',
    size: '30cm',
    color: 'Noir (Black)',
    currentMarketValue: 22500,
    retailPrice: 11900,
    trend: 'up',
    trendPercentage: 5.1,
    mentions30Days: 15800, // Highest mentions
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop',
  },
  {
    id: 'item-5',
    brand: 'Hermès',
    model: 'Kelly 25 Sellier',
    category: 'Bag',
    material: 'Epsom Leather',
    size: '25cm',
    color: 'Gold',
    currentMarketValue: 28000,
    retailPrice: 10400,
    trend: 'up',
    trendPercentage: 8.4,
    mentions30Days: 11200,
    imageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&h=400&fit=crop',
  },
  {
    id: 'item-6',
    brand: 'Chanel',
    model: 'Classic Flap Medium',
    category: 'Bag',
    material: 'Caviar Leather',
    size: 'Medium',
    color: 'Beige',
    currentMarketValue: 10200,
    retailPrice: 10200,
    trend: 'stable',
    trendPercentage: 0.0,
    mentions30Days: 9500,
    imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop',
  },
  {
    id: 'item-7',
    brand: 'Cartier',
    model: 'Love Bracelet',
    category: 'Jewelry',
    material: '18K Yellow Gold',
    size: '17',
    currentMarketValue: 7350,
    retailPrice: 7350,
    trend: 'up',
    trendPercentage: 1.5,
    mentions30Days: 14200, // Very high mentions
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
  },
  {
    id: 'item-8',
    brand: 'Van Cleef & Arpels',
    model: 'Vintage Alhambra Necklace',
    category: 'Jewelry',
    material: '18K Yellow Gold, Onyx',
    size: '10 Motifs',
    currentMarketValue: 8400,
    retailPrice: 7900,
    trend: 'up',
    trendPercentage: 3.2,
    mentions30Days: 10800,
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
  },
];

// User's Portfolio
export const initialPortfolio: PortfolioAsset[] = [
  {
    ...luxuryDatabase[0], // Rolex Submariner
    portfolioId: 'port-1',
    purchasePrice: 10250,
    purchaseDate: '2021-05-15',
    condition: 'Excellent',
    serialNumber: 'M8K12345',
  },
  {
    ...luxuryDatabase[3], // Birkin 30
    portfolioId: 'port-2',
    purchasePrice: 11900,
    purchaseDate: '2022-11-10',
    condition: 'Pristine',
    serialNumber: 'Z1234567',
  },
  {
    ...luxuryDatabase[6], // Cartier Love
    portfolioId: 'port-3',
    purchasePrice: 6900,
    purchaseDate: '2020-02-14',
    condition: 'Good',
  },
  {
    ...luxuryDatabase[2], // Audemars Piguet Royal Oak
    portfolioId: 'port-4',
    purchasePrice: 45000,
    purchaseDate: '2023-01-10',
    condition: 'Excellent',
    serialNumber: 'H12345',
  }
];

// User's Watchlist
export const initialWatchlist: WatchlistItem[] = [
  {
    ...luxuryDatabase[1], // Patek Nautilus
    watchlistId: 'watch-1',
    targetPrice: 100000,
    alertActive: true,
  },
  {
    ...luxuryDatabase[4], // Kelly 25
    watchlistId: 'watch-2',
    targetPrice: 25000,
    alertActive: true,
  },
];

// Historical Portfolio Value (for the line chart)
export const portfolioHistory = [
  { month: 'Jan', value: 26500 },
  { month: 'Feb', value: 27100 },
  { month: 'Mar', value: 27800 },
  { month: 'Apr', value: 28200 },
  { month: 'May', value: 29050 },
  { month: 'Jun', value: 31500 },
  { month: 'Jul', value: 32100 },
  { month: 'Aug', value: 33400 },
  { month: 'Sep', value: 33800 },
  { month: 'Oct', value: 34200 },
  { month: 'Nov', value: 34350 },
  { month: 'Dec', value: 34350 },
];

// Adjusting history to match current total of 86,350
export const adjustedPortfolioHistory = [
  { month: 'Jan', value: 69050 },
  { month: 'Feb', value: 70100 },
  { month: 'Mar', value: 71800 },
  { month: 'Apr', value: 72200 },
  { month: 'May', value: 73050 },
  { month: 'Jun', value: 75500 }, 
  { month: 'Jul', value: 77100 },
  { month: 'Aug', value: 79400 },
  { month: 'Sep', value: 81800 },
  { month: 'Oct', value: 82200 },
  { month: 'Nov', value: 84350 },
  { month: 'Dec', value: 86350 }, 
];

