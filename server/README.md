# Truck App Backend API

This is the server component of the Truck App, providing RESTful API endpoints for the mobile and web clients.

## Features

- **Authentication**: JWT-based authentication with role-based access control
- **Customer Operations**: Book trucks, track orders, manage saved locations
- **Driver Operations**: Accept/manage jobs, update status, track earnings
- **Admin Operations**: Monitor jobs, payments, drivers, and analytics

## Setup

### Prerequisites

- Node.js 14+
- PostgreSQL 12+ (or SQLite for development)

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   ```bash
# Copy example .env file
   cp .env.example .env

# Edit .env file with your database credentials
```

3. Initialize database:

```bash
# If using PostgreSQL, create the database first
createdb truck_app

# Run migrations
npm run migration:run

# Seed the database with test data
npm run seed
```

### Running the Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm run build
npm start
```

## API Documentation

### Authentication Endpoints

#### `POST /api/auth/register`

Register a new user.

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+1234567890"
}
```

**Response**:
```json
{
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

#### `POST /api/auth/login`

Login an existing user.

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

### Customer Endpoints

All customer endpoints require authentication and the user to have the "customer" role.

#### `GET /api/customer/stats`

Get customer dashboard statistics.

**Response**:
```json
{
  "totalOrders": 10,
  "activeOrders": 2,
  "completedOrders": 8,
  "totalSpent": 1250.75
}
```

#### `GET /api/customer/orders`

Get customer order history with pagination.

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response**:
```json
{
  "orders": [
    {
      "id": "order-id",
      "pickupLocation": "123 Main St",
      "destinationLocation": "456 Elm St",
      "status": "delivered",
      "price": 150.50,
      "createdAt": "2023-04-15T12:30:00Z",
      "driver": {
        "id": "driver-id",
        "name": "Driver Name",
        "rating": 4.8
      }
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

#### `POST /api/customer/orders`

Create a new order.

**Request Body**:
```json
{
  "pickupLocation": "123 Main St",
  "destinationLocation": "456 Elm St",
  "truckType": "medium",
  "description": "Moving furniture",
  "items": ["Sofa", "Table", "Chairs"],
  "scheduledTime": "2023-04-20T15:00:00Z"
}
```

**Response**:
```json
{
  "id": "order-id",
  "pickupLocation": "123 Main St",
  "destinationLocation": "456 Elm St",
  "status": "pending",
  "price": 125.50,
  "createdAt": "2023-04-15T12:30:00Z"
}
```

### Driver Endpoints

All driver endpoints require authentication and the user to have the "driver" role.

#### `GET /api/driver/jobs`

Get available and assigned jobs for the driver.

**Response**:
```json
{
  "current": {
    "id": "job-id",
    "customer": "John Doe",
    "pickup": "123 Main St",
    "dropoff": "456 Elm St",
    "status": "in_progress"
  },
  "available": [
    {
      "id": "job-id-2",
      "pickup": "789 Oak St",
      "dropoff": "101 Pine St",
      "distance": "5.2 miles",
      "estimated_pay": 75.50
    }
  ]
}
```

#### `PATCH /api/driver/jobs/:id/status`

Update job status.

**Request Body**:
```json
{
  "status": "picked_up"
}
```

**Response**:
```json
{
  "id": "job-id",
  "status": "picked_up",
  "updatedAt": "2023-04-15T12:45:00Z"
}
```

### Admin Endpoints

All admin endpoints require authentication and the user to have the "admin" role.

#### `GET /api/admin/stats`

Get admin dashboard statistics.

**Response**:
```json
{
  "users": {
    "total": 150,
    "drivers": 35,
    "customers": 115
  },
  "orders": {
    "total": 230,
    "active": 42,
    "completed": 188
  },
  "revenue": {
    "total": 15680.25,
    "today": 856.50,
    "week": 4250.75
  }
}
```

#### `GET /api/admin/drivers/locations`

Get real-time driver locations.

**Response**:
```json
{
  "drivers": [
    {
      "id": "driver-id",
      "name": "Driver Name",
      "location": {
        "lat": 37.7749,
        "lng": -122.4194
      },
      "status": "active",
      "lastUpdate": "2023-04-15T12:40:23Z"
    }
  ]
}
```

## Error Handling

The API returns standard HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Server Error`: Unexpected server error

Error responses follow this format:

```json
{
  "status": "error",
  "message": "Descriptive error message",
  "code": "ERROR_CODE"
}
```

## Testing Accounts

For testing purposes, the following accounts are available after seeding:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | Admin |
| manager@example.com | manager123 | Manager |
| driver@example.com | driver123 | Driver |
| customer@example.com | customer123 | Customer 