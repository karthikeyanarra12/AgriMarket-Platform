const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const redis = require('redis');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// PostgreSQL Connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'agrimarket',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Redis Connection
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

// Database Initialization
const initializeDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        user_type VARCHAR(50),
        region VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS listings (
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
      
      CREATE TABLE IF NOT EXISTS prices (
        id SERIAL PRIMARY KEY,
        crop_name VARCHAR(100),
        grade VARCHAR(50),
        region VARCHAR(100),
        price_per_kg DECIMAL(10, 2),
        trend VARCHAR(50),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS contracts (
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
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

initializeDB();

// Routes

// Get all prices with caching
app.get('/api/prices', async (req, res) => {
  try {
    const cached = await redisClient.get('all_prices');
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const result = await pool.query('SELECT * FROM prices');
    await redisClient.setEx('all_prices', 600, JSON.stringify(result.rows));
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching prices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get prices by crop
app.get('/api/prices/:crop', async (req, res) => {
  try {
    const { crop } = req.params;
    const cacheKey = `prices_${crop}`;
    const cached = await redisClient.get(cacheKey);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const result = await pool.query('SELECT * FROM prices WHERE crop_name = $1', [crop]);
    await redisClient.setEx(cacheKey, 600, JSON.stringify(result.rows));
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching prices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new listing
app.post('/api/listings', async (req, res) => {
  try {
    const { user_id, crop_name, grade, volume, price_per_kg, location } = req.body;
    
    const result = await pool.query(
      'INSERT INTO listings (user_id, crop_name, grade, volume, price_per_kg, location, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [user_id, crop_name, grade, volume, price_per_kg, location, 'ACTIVE']
    );
    
    // Clear cache
    await redisClient.del('all_prices');
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all listings
app.get('/api/listings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM listings WHERE status = \'ACTIVE\'');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI Price Recommendation
app.post('/api/ai-price-check', async (req, res) => {
  try {
    const { crop_name, expected_price } = req.body;
    
    const result = await pool.query(
      'SELECT AVG(price_per_kg) as market_average FROM prices WHERE crop_name = $1',
      [crop_name]
    );
    
    const marketAvg = result.rows[0]?.market_average || 0;
    let recommendation = 'Competitive price range. Good match probability.';
    
    if (expected_price > marketAvg * 1.2) {
      recommendation = 'Warning: Price is 20% above regional average. May experience slower buyer matching.';
    } else if (expected_price < marketAvg * 0.8) {
      recommendation = 'Notice: Price is below market average. High demand expected from bulk buyers.';
    }
    
    res.json({ market_average: marketAvg, recommendation });
  } catch (error) {
    console.error('Error in AI price check:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create contract
app.post('/api/contracts', async (req, res) => {
  try {
    const { contract_hash, crop_name, agreed_price, deposit_amount, buyer_id, seller_id } = req.body;
    
    const result = await pool.query(
      'INSERT INTO contracts (contract_hash, crop_name, agreed_price, deposit_amount, status, buyer_id, seller_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [contract_hash, crop_name, agreed_price, deposit_amount, 'PENDING_DEPOSIT', buyer_id, seller_id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all contracts
app.get('/api/contracts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contracts');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Release escrow
app.patch('/api/contracts/:id/release', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE contracts SET status = $1 WHERE id = $2 RETURNING *',
      ['COMPLETED & RELEASED', id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error releasing escrow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AgriMarket Platform is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`AgriMarket Backend running on port ${PORT}`);
});
