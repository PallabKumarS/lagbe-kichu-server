# Lagbe Kichu

Lagbe Kichu is a rental property management system built using Node.js, Express, TypeScript, and MongoDB. It provides role-based authentication and authorization using JWT and supports secure payment handling with Surjopay.

## Features

- User Authentication & Authorization (JWT, bcrypt)
- Role-based Access Control (Admin, Buyer, Seller)
- Property Listings & Requests Management
- Secure Payments via Surjopay
- Email Notifications using Nodemailer
- Data Validation with Zod

## Tech Stack

- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT, bcrypt
- **Validation:** Zod
- **Email Service:** Nodemailer
- **Payment Gateway:** Surjopay

## Installation

To install dependencies:

```bash
bun install
```

To run the server:

```bash
bun run dev
```

## Environment Variables

Create a `.env` file and configure the following:

```
DATABASE_URL="your mongodb uri"
NODE_ENV="development"
PORT=5000
BCRYPT_SALT_ROUNDS=10

# JWT Secret Keys
JWT_ACCESS_SECRET="your-access-secret-key"
JWT_ACCESS_EXPIRES_IN="1d"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_REFRESH_EXPIRES_IN="30d"

# Client Addresses
LOCAL_CLIENT="http://localhost:3000"
CLIENT="your live link"

# Surjopay Configurations
SP_ENDPOINT=https://sandbox.shurjopayment.com
SP_USERNAME=sp_sandbox
SP_PASSWORD=pyyk97hu&6u6
SP_PREFIX=nh
SP_RETURN_URL=your live link/verify-payment

# Email Configuration
SENDER_EMAIL="your-email@example.com"
SENDER_APP_PASS="your-email-app-password"
```

## API Routes

### Users

```
GET /api/users - (Admin) Get all users
POST /api/users/create-user - Create a new user
GET /api/users/me - Get current user data
PATCH /api/users/status/:userId - (Admin) Update user status
PATCH /api/users/role/:userId - (Admin) Change user role
PATCH /api/users/:userId - Update user profile
```

### Authentication

```
POST /api/auth/login - User login
PATCH /api/auth/change-password - Change password
POST /api/auth/refresh-token - Refresh access token
```

### Listings

```
GET /api/listings - Get all listings
GET /api/listings/locations - Get listing locations
GET /api/listings/personal - (Seller) Get personal listings
GET /api/listings/:listingId - Get a single listing
POST /api/listings - (Seller) Create a new listing
PATCH /api/listings/:listingId - (Seller/Admin) Update a listing
PATCH /api/listings/status/:listingId - (Seller/Admin) Update listing status
DELETE /api/listings/:listingId - (Seller/Admin) Delete a listing
```

### Requests

```
GET /api/requests - (Admin) Get all requests
GET /api/requests/personal - (Buyer/Seller) Get personal requests
GET /api/requests/:requestId - Get a single order
POST /api/requests - (Buyer) Create a order
PATCH /api/requests/status/:requestId - (Seller) Change order status
PATCH /api/requests/:requestId - (Seller/Admin) Update order
PATCH /api/requests/create-payment/:requestId - (Buyer) Initiate payment
PATCH /api/requests/verify-payment/:paymentId - (Buyer) Verify payment
DELETE /api/requests/:requestId - (Admin/Buyer) Delete order
```

## Live Server

[Backend Live Link](https://pks-nest-hunt-server.vercel.app)

[GitHub Repository](https://github.com/PallabKumarS/assignment-06-nest-hunt-server)
