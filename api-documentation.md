# Charity Association Management Application - API Documentation

## Overview
This document provides comprehensive documentation for the Charity Association Management Application API. The API is built using Node.js, Express, and MongoDB, and provides endpoints for managing members, financial records, vehicles, and generating reports.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All API endpoints (except for login and register) require authentication using JWT tokens.

### Authentication Endpoints

#### Register a new user
```
POST /auth/register
```
**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "fullName": "string",
  "email": "string",
  "role": "string" (optional, defaults to "user")
}
```
**Response:**
```json
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": {
    "id": "string",
    "username": "string",
    "fullName": "string",
    "email": "string",
    "role": "string"
  }
}
```

#### Login
```
POST /auth/login
```
**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": {
    "id": "string",
    "username": "string",
    "fullName": "string",
    "email": "string",
    "role": "string"
  }
}
```

#### Get current user
```
GET /auth/me
```
**Headers:**
```
Authorization: Bearer JWT_TOKEN
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "fullName": "string",
    "email": "string",
    "role": "string"
  }
}
```

## Member Management

### Get all members
```
GET /members
```
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10)
- `search`: Search term for member name or ID
- `status`: Filter by membership status

**Response:**
```json
{
  "success": true,
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "pages": "number"
  },
  "data": [
    {
      "_id": "string",
      "fullName": {
        "first": "string",
        "middle": "string",
        "last": "string"
      },
      "dateOfBirth": "date",
      "nationalId": "string",
      "contact": {
        "phone": "string",
        "email": "string"
      },
      "primaryAddress": {
        "street": "string",
        "city": "string",
        "state": "string",
        "postalCode": "string",
        "country": "string"
      },
      "tribeAffiliation": "string",
      "membershipStatus": "string",
      "joinDate": "date"
    }
  ]
}
```

### Get a single member
```
GET /members/:id
```
**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "fullName": {
      "first": "string",
      "middle": "string",
      "last": "string"
    },
    "dateOfBirth": "date",
    "nationalId": "string",
    "contact": {
      "phone": "string",
      "email": "string"
    },
    "primaryAddress": {
      "street": "string",
      "city": "string",
      "state": "string",
      "postalCode": "string",
      "country": "string"
    },
    "tribeAffiliation": "string",
    "membershipStatus": "string",
    "joinDate": "date"
  }
}
```

### Create a member
```
POST /members
```
**Request Body:**
```json
{
  "fullName": {
    "first": "string",
    "middle": "string",
    "last": "string"
  },
  "dateOfBirth": "date",
  "nationalId": "string",
  "contact": {
    "phone": "string",
    "email": "string"
  },
  "primaryAddress": {
    "street": "string",
    "city": "string",
    "state": "string",
    "postalCode": "string",
    "country": "string"
  },
  "tribeAffiliation": "string",
  "membershipStatus": "string"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "fullName": {
      "first": "string",
      "middle": "string",
      "last": "string"
    },
    "dateOfBirth": "date",
    "nationalId": "string",
    "contact": {
      "phone": "string",
      "email": "string"
    },
    "primaryAddress": {
      "street": "string",
      "city": "string",
      "state": "string",
      "postalCode": "string",
      "country": "string"
    },
    "tribeAffiliation": "string",
    "membershipStatus": "string",
    "joinDate": "date"
  }
}
```

### Update a member
```
PUT /members/:id
```
**Request Body:**
Same as create member, all fields optional

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "fullName": {
      "first": "string",
      "middle": "string",
      "last": "string"
    },
    "dateOfBirth": "date",
    "nationalId": "string",
    "contact": {
      "phone": "string",
      "email": "string"
    },
    "primaryAddress": {
      "street": "string",
      "city": "string",
      "state": "string",
      "postalCode": "string",
      "country": "string"
    },
    "tribeAffiliation": "string",
    "membershipStatus": "string",
    "joinDate": "date"
  }
}
```

### Delete a member
```
DELETE /members/:id
```
**Response:**
```json
{
  "success": true,
  "data": {}
}
```

## Financial Management

### Payments

#### Get all payments
```
GET /payments
```
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10)
- `search`: Search term
- `paymentType`: Filter by payment type

**Response:**
```json
{
  "success": true,
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "pages": "number"
  },
  "data": [
    {
      "_id": "string",
      "member": {
        "_id": "string",
        "fullName": {
          "first": "string",
          "middle": "string",
          "last": "string"
        }
      },
      "amount": "number",
      "paymentDate": "date",
      "paymentMethod": "string",
      "paymentType": "string",
      "receiptNumber": "string",
      "dueDate": "date",
      "isPaid": "boolean",
      "isInstallment": "boolean",
      "installmentPlan": {
        "totalAmount": "number",
        "numberOfInstallments": "number",
        "paidInstallments": "number"
      },
      "notes": "string"
    }
  ]
}
```

#### Get a single payment
```
GET /payments/:id
```

#### Create a payment
```
POST /payments
```
**Request Body:**
```json
{
  "member": "string (member ID)",
  "amount": "number",
  "paymentDate": "date",
  "paymentMethod": "string",
  "paymentType": "string",
  "dueDate": "date",
  "isPaid": "boolean",
  "isInstallment": "boolean",
  "installmentPlan": {
    "totalAmount": "number",
    "numberOfInstallments": "number",
    "paidInstallments": "number"
  },
  "notes": "string"
}
```

#### Update a payment
```
PUT /payments/:id
```

#### Delete a payment
```
DELETE /payments/:id
```

### Expenses

#### Get all expenses
```
GET /expenses
```
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10)
- `category`: Filter by expense category
- `approvalStatus`: Filter by approval status

#### Get a single expense
```
GET /expenses/:id
```

#### Create an expense
```
POST /expenses
```
**Request Body:**
```json
{
  "category": "string",
  "amount": "number",
  "date": "date",
  "purpose": "string",
  "approvalStatus": "string",
  "spentBy": "string (user ID)",
  "notes": "string"
}
```

#### Update an expense
```
PUT /expenses/:id
```

#### Delete an expense
```
DELETE /expenses/:id
```

#### Approve an expense
```
PUT /expenses/:id/approve
```

#### Reject an expense
```
PUT /expenses/:id/reject
```

## Vehicle Management

### Vehicles

#### Get all vehicles
```
GET /vehicles
```
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10)
- `search`: Search term
- `status`: Filter by vehicle status

#### Get a single vehicle
```
GET /vehicles/:id
```

#### Create a vehicle
```
POST /vehicles
```
**Request Body:**
```json
{
  "make": "string",
  "model": "string",
  "year": "number",
  "licensePlate": "string",
  "status": "string",
  "currentOdometer": "number",
  "fuelType": "string",
  "registrationExpiry": "date",
  "insuranceExpiry": "date",
  "notes": "string"
}
```

#### Update a vehicle
```
PUT /vehicles/:id
```

#### Delete a vehicle
```
DELETE /vehicles/:id
```

#### Update vehicle status
```
PUT /vehicles/:id/status
```
**Request Body:**
```json
{
  "status": "string"
}
```

### Trips

#### Get all trips
```
GET /trips
```
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10)
- `search`: Search term
- `status`: Filter by trip status
- `vehicle`: Filter by vehicle ID

#### Get a single trip
```
GET /trips/:id
```

#### Create a trip
```
POST /trips
```
**Request Body:**
```json
{
  "vehicle": "string (vehicle ID)",
  "purpose": "string",
  "startDate": "date",
  "endDate": "date",
  "startOdometer": "number",
  "endOdometer": "number",
  "destination": "string",
  "driver": "string",
  "status": "string",
  "notes": "string",
  "createdBy": "string (user ID)"
}
```

#### Update a trip
```
PUT /trips/:id
```

#### Delete a trip
```
DELETE /trips/:id
```

#### Update trip status
```
PUT /trips/:id/status
```
**Request Body:**
```json
{
  "status": "string"
}
```

### Maintenance

#### Get all maintenance records
```
GET /maintenance
```
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10)
- `search`: Search term
- `status`: Filter by maintenance status
- `vehicle`: Filter by vehicle ID

#### Get a single maintenance record
```
GET /maintenance/:id
```

#### Create a maintenance record
```
POST /maintenance
```
**Request Body:**
```json
{
  "vehicle": "string (vehicle ID)",
  "maintenanceType": "string",
  "description": "string",
  "date": "date",
  "cost": "number",
  "odometer": "number",
  "serviceProvider": "string",
  "status": "string",
  "nextMaintenanceDate": "date",
  "notes": "string"
}
```

#### Update a maintenance record
```
PUT /maintenance/:id
```

#### Delete a maintenance record
```
DELETE /maintenance/:id
```

#### Update maintenance status
```
PUT /maintenance/:id/status
```
**Request Body:**
```json
{
  "status": "string"
}
```

## Reporting

### Dashboard report
```
GET /reports/dashboard
```
**Response:**
```json
{
  "success": true,
  "data": {
    "members": {
      "total": "number",
      "active": "number",
      "inactive": "number"
    },
    "finances": {
      "currentMonth": {
        "income": "number",
        "expenses": "number",
        "balance": "number"
      },
      "previousMonth": {
        "income": "number",
        "expenses": "number",
        "balance": "number"
      }
    },
    "vehicles": {
      "total": "number",
      "available": "number",
      "inUse": "number",
      "maintenance": "number"
    },
    "recent": {
      "payments": [],
      "expenses": [],
      "trips": []
    }
  }
}
```

### Members report
```
GET /reports/members
```
**Query Parameters:**
- `status`: Filter by membership status
- `startDate`: Filter by join date (start)
- `endDate`: Filter by join date (end)

### Financial report
```
GET /reports/financial
```
**Query Parameters:**
- `type`: Report type (all, income, expenses)
- `startDate`: Filter by date (start)
- `endDate`: Filter by date (end)

### Vehicles report
```
GET /reports/vehicles
```
**Query Parameters:**
- `vehicle`: Filter by vehicle ID
- `startDate`: Filter by date (start)
- `endDate`: Filter by date (end)

## Error Handling
All API endpoints return appropriate HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

Error responses follow this format:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Authentication
All API endpoints (except login and register) require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```
