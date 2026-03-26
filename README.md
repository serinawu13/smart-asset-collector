# Smart Asset Collector

A comprehensive luxury asset portfolio tracking application that helps users monitor and manage their high-value collectibles and investments.

## Features

- **Portfolio Management**: Track your luxury assets including watches, art, wine, and collectibles
- **Real-time Price Tracking**: Monitor asset values and market trends
- **Watchlist**: Keep track of items you're interested in acquiring
- **Market News**: Stay updated with the latest luxury market news
- **Price Alerts**: Get notified when assets reach your target prices
- **Search Functionality**: Easily find and discover luxury items
- **Notifications**: Receive updates on portfolio changes and market movements

## Tech Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Context** - State management

### Backend
- **FastAPI** - Python web framework
- **MongoDB** - Database
- **Pydantic** - Data validation
- **JWT** - Authentication
- **APScheduler** - Background tasks for price alerts

## Project Structure

```
smart-asset-collector/
├── frontend/           # Next.js frontend application
│   ├── app/           # Next.js app directory
│   ├── components/    # React components
│   ├── contexts/      # React contexts
│   ├── lib/           # Utilities and API client
│   └── public/        # Static assets
├── backend/           # FastAPI backend application
│   ├── app/
│   │   ├── models/    # MongoDB models
│   │   ├── routes/    # API endpoints
│   │   ├── schemas/   # Pydantic schemas
│   │   └── utils/     # Utilities and helpers
│   └── requirements.txt
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/serinawu13/smart-asset-collector.git
   cd smart-asset-collector
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure Backend Environment**
   - Copy `.env.example` to `.env`
   - Update MongoDB connection string and other settings

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

5. **Run the Application**

   Terminal 1 - Backend:
   ```bash
   cd backend
   python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   Terminal 2 - Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## API Documentation

The backend provides a RESTful API with the following main endpoints:

- `/api/v1/auth/*` - Authentication and user management
- `/api/v1/portfolio/*` - Portfolio asset management
- `/api/v1/watchlist/*` - Watchlist management
- `/api/v1/items/*` - Luxury item catalog
- `/api/v1/news/*` - Market news
- `/api/v1/notifications/*` - User notifications
- `/api/v1/settings/*` - User settings and preferences

Full API documentation is available at `/docs` when running the backend server.

## Features in Detail

### Portfolio Management
- Add, edit, and remove assets from your portfolio
- Track purchase price, current value, and ROI
- View portfolio performance over time
- Categorize assets by type (watches, art, wine, etc.)

### Price Alerts
- Set target prices for watchlist items
- Receive notifications when prices are reached
- Automatic price monitoring via scheduled tasks

### Market News
- Curated luxury market news feed
- Filter by category and relevance
- Stay informed about market trends

### Search & Discovery
- Search across all luxury items
- Filter by category, price range, and brand
- Discover trending items

## Development

### Backend Development
- FastAPI with automatic API documentation
- MongoDB for flexible data storage
- Pydantic for data validation
- JWT-based authentication
- Background tasks for price monitoring

### Frontend Development
- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for responsive design
- shadcn/ui for consistent UI components
- Context API for state management

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Author

Serina Wu (@serinawu13)
