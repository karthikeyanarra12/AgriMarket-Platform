# AgriMarket Platform - Farmer Market Linkage & Price Discovery

## Overview

AgriMarket is a comprehensive full-stack platform designed for Hackathon-132 that connects farmers directly with buyers through intelligent price discovery, smart escrow contracts, and AI-powered market analysis.

## Features

### 1. **Market Intelligence & Price Discovery**
- Real-time local market benchmarks
- Regional price comparisons across crop grades
- Redis-cached pricing for sub-10ms response times
- Trend analysis and market insights

### 2. **Smart Listing & AI Pricing Assistant**
- Farmer produce listing wizard with grade selection
- AI-powered price validation against market averages
- Real-time market fairness analysis
- Automated recommendations for competitive pricing

### 3. **Escrow & Digital Smart Contracts**
- Milestone-based payment locking
- Secure contract hash generation
- Deposit escrow management
- Automated fund release mechanisms

### 4. **System Architecture**
- **Frontend**: HTML5, CSS3, Tailwind CSS, Alpine.js
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Caching**: Redis
- **Authentication**: JWT (ready for implementation)

## Tech Stack

### Frontend
- **Tailwind CSS** - Responsive styling
- **Alpine.js** - Reactive UI without complex bundlers
- **FontAwesome** - Icons
- **Vanilla JavaScript** - App logic

### Backend
- **Node.js** - Runtime
- **Express.js** - REST API framework
- **PostgreSQL** - Relational database
- **Redis** - Caching layer
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration

## Installation

### Prerequisites
- Node.js v14+
- PostgreSQL 12+
- Redis 6+
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/karthikeyanarra12/AgriMarket-Platform.git
   cd AgriMarket-Platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database and Redis credentials
   ```

4. **Start PostgreSQL and Redis**
   ```bash
   # PostgreSQL
   psql -U postgres
   CREATE DATABASE agrimarket;

   # Redis (in another terminal)
   redis-server
   ```

5. **Start the server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

6. **Access the platform**
   - Open `http://localhost:5000` in your browser

## API Endpoints

### Price Management
- `GET /api/prices` - Get all prices
- `GET /api/prices/:crop` - Get prices for specific crop

### Listings
- `POST /api/listings` - Create new listing
- `GET /api/listings` - Get all active listings

### AI Services
- `POST /api/ai-price-check` - Get AI price validation and recommendations

### Contracts
- `POST /api/contracts` - Create new escrow contract
- `GET /api/contracts` - Get all contracts
- `PATCH /api/contracts/:id/release` - Release escrow funds

### Health Check
- `GET /api/health` - Server status

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  user_type VARCHAR(50),
  region VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Listings Table
```sql
CREATE TABLE listings (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  crop_name VARCHAR(100),
  grade VARCHAR(50),
  volume INT,
  price_per_kg DECIMAL(10, 2),
  location VARCHAR(100),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Prices Table
```sql
CREATE TABLE prices (
  id SERIAL PRIMARY KEY,
  crop_name VARCHAR(100),
  grade VARCHAR(50),
  region VARCHAR(100),
  price_per_kg DECIMAL(10, 2),
  trend VARCHAR(50),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Contracts Table
```sql
CREATE TABLE contracts (
  id SERIAL PRIMARY KEY,
  contract_hash VARCHAR(255) UNIQUE,
  crop_name VARCHAR(100),
  agreed_price DECIMAL(10, 2),
  deposit_amount DECIMAL(10, 2),
  status VARCHAR(50),
  buyer_id INT REFERENCES users(id),
  seller_id INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Project Structure

```
AgriMarket-Platform/
├── server.js                 # Express server & API routes
├── package.json              # Dependencies
├── .env.example              # Environment template
├── public/
│   ├── index.html           # Main HTML interface
│   └── app.js               # Frontend Alpine.js logic
├── README.md                # Documentation
└── .gitignore               # Git ignore rules
```

## Key Features Implementation

### Real-time Price Discovery
- Prices cached in Redis for 10 minutes (600 seconds)
- Fallback to database for cache misses
- Regional filtering by crop type

### AI Pricing Engine
- Calculates market average from historical data
- Provides recommendations based on 20% variance threshold
- Identifies overpriced and underpriced listings

### Smart Escrow
- Contract hash generation for security
- Status tracking (PENDING_DEPOSIT, ESCROW_LOCKED, COMPLETED & RELEASED)
- Buyer/seller relationship management

## Future Enhancements

- [ ] SMS/WhatsApp notifications for farmers
- [ ] Weather API integration for demand forecasting
- [ ] Mobile app (React Native)
- [ ] Blockchain integration for contract verification
- [ ] Multi-language support (Hindi, Telugu, Tamil)
- [ ] Image recognition for crop quality grading
- [ ] Payment gateway integration (Stripe, Razorpay)
- [ ] Analytics dashboard for market trends
- [ ] User authentication and authorization
- [ ] Email notifications and confirmations

## Testing

```bash
# Run tests
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Contact: karthikeyanarra12@gmail.com

## Acknowledgments

- Hackathon-132 organizing team
- Agricultural market research contributors
- Open-source community (Express.js, PostgreSQL, Redis, Tailwind CSS, Alpine.js)

---

**Built with ❤️ for farmers by AgriMarket team**
