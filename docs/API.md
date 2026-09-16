# AgriMarket API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently uses mock authentication. JWT implementation coming soon.

## Endpoints

### 1. Price Management

#### Get All Prices
```http
GET /prices
```
**Response (200 OK)**
```json
[
  {
    "id": 1,
    "crop_name": "Tomatoes",
    "grade": "Grade A",
    "region": "Central Valley",
    "price_per_kg": 2.45,
    "trend": "Stable 📈",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

#### Get Prices by Crop
```http
GET /prices/:crop
```
**Parameters**
- `crop` (path): Crop name (e.g., "Tomatoes", "Wheat")

**Response (200 OK)**
```json
[
  {
    "id": 1,
    "crop_name": "Tomatoes",
    "grade": "Grade A",
    "region": "Central Valley",
    "price_per_kg": 2.45,
    "trend": "Stable 📈"
  }
]
```

---

### 2. Listings

#### Create Listing
```http
POST /listings
Content-Type: application/json

{
  "user_id": 1,
  "crop_name": "Tomatoes",
  "grade": "Grade A (Premium)",
  "volume": 500,
  "price_per_kg": 2.30,
  "location": "Central Valley"
}
```

**Response (201 Created)**
```json
{
  "id": 1,
  "user_id": 1,
  "crop_name": "Tomatoes",
  "grade": "Grade A (Premium)",
  "volume": 500,
  "price_per_kg": 2.30,
  "location": "Central Valley",
  "status": "ACTIVE",
  "created_at": "2024-01-15T10:35:00Z"
}
```

#### Get All Listings
```http
GET /listings
```

**Response (200 OK)**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "crop_name": "Tomatoes",
    "grade": "Grade A",
    "volume": 500,
    "price_per_kg": 2.30,
    "location": "Central Valley",
    "status": "ACTIVE",
    "created_at": "2024-01-15T10:35:00Z"
  }
]
```

---

### 3. AI Price Validation

#### Check Price Fairness
```http
POST /ai-price-check
Content-Type: application/json

{
  "crop_name": "Tomatoes",
  "expected_price": 2.30
}
```

**Response (200 OK)**
```json
{
  "market_average": 2.10,
  "recommendation": "Competitive price range. Good match probability."
}
```

**Recommendation Logic**
- If price > market_average × 1.2: "Warning: Price is 20% above regional average..."
- If price < market_average × 0.8: "Notice: Price is below market average..."
- Otherwise: "Competitive price range..."

---

### 4. Smart Contracts & Escrow

#### Create Contract
```http
POST /contracts
Content-Type: application/json

{
  "contract_hash": "0x8f4c2e1a7b9d3f5e6a8c2b1d4e7f9a3c",
  "crop_name": "Tomatoes (Grade A)",
  "agreed_price": 1200,
  "deposit_amount": 300,
  "buyer_id": 2,
  "seller_id": 1
}
```

**Response (201 Created)**
```json
{
  "id": 1,
  "contract_hash": "0x8f4c2e1a7b9d3f5e6a8c2b1d4e7f9a3c",
  "crop_name": "Tomatoes (Grade A)",
  "agreed_price": 1200,
  "deposit_amount": 300,
  "status": "PENDING_DEPOSIT",
  "buyer_id": 2,
  "seller_id": 1,
  "created_at": "2024-01-15T10:40:00Z"
}
```

#### Get All Contracts
```http
GET /contracts
```

**Response (200 OK)**
```json
[
  {
    "id": 1,
    "contract_hash": "0x8f4c2e1a7b9d3f5e6a8c2b1d4e7f9a3c",
    "crop_name": "Tomatoes (Grade A)",
    "agreed_price": 1200,
    "deposit_amount": 300,
    "status": "PENDING_DEPOSIT",
    "buyer_id": 2,
    "seller_id": 1,
    "created_at": "2024-01-15T10:40:00Z"
  }
]
```

#### Release Escrow
```http
PATCH /contracts/:id/release
Content-Type: application/json
```

**Response (200 OK)**
```json
{
  "id": 1,
  "contract_hash": "0x8f4c2e1a7b9d3f5e6a8c2b1d4e7f9a3c",
  "crop_name": "Tomatoes (Grade A)",
  "agreed_price": 1200,
  "deposit_amount": 300,
  "status": "COMPLETED & RELEASED",
  "buyer_id": 2,
  "seller_id": 1,
  "created_at": "2024-01-15T10:40:00Z"
}
```

---

### 5. Health Check

#### Server Status
```http
GET /health
```

**Response (200 OK)**
```json
{
  "status": "OK",
  "message": "AgriMarket Platform is running"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request parameters"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting
Currently not implemented. Coming in future versions.

## Caching Strategy
- Price data: 10 minutes (600 seconds)
- Listings: Not cached (real-time)
- Contracts: Not cached (real-time)

## Status Codes
- `200 OK` - Successful GET/PATCH request
- `201 Created` - Successful POST request
- `400 Bad Request` - Invalid input
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server error
