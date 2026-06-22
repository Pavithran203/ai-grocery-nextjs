# FreshKart Backend — API Documentation

**Base URL:** `http://localhost:5000`  
**All protected routes require:** `Authorization: Bearer <token>` header  
**All responses are JSON.**

---

## 1. Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | None | Server status check |

**Response (200):**
```json
{ "success": true, "message": "FreshKart API is running 🚀", "env": "development" }
```

---

## 2. Authentication — `/api/auth`

### 2.1 Register
`POST /api/auth/register`

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePass123",
  "phone": "9876543210"
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "664abc...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "9876543210",
    "role": "user",
    "accountType": "regular",
    "addresses": [],
    "isActive": true
  }
}
```

**Errors:** `400` validation errors · `409` email already registered

---

### 2.2 Login
`POST /api/auth/login`

**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "securePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "_id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "user" }
}
```

**Errors:** `400` missing fields · `401` invalid credentials · `403` account deactivated

---

### 2.3 Logout
`POST /api/auth/logout` 🔒

> JWT is stateless — the client must delete its stored token after this call.

**Response (200):**
```json
{ "success": true, "message": "Logged out successfully. Please clear your token on the client." }
```

---

### 2.4 Get Current User
`GET /api/auth/me` 🔒

**Response (200):**
```json
{ "success": true, "user": { "_id": "...", "name": "...", "email": "...", "addresses": [] } }
```

---

### 2.5 Update Profile
`PUT /api/auth/me` 🔒

**Request Body (all optional):**
```json
{ "name": "Jane Smith", "phone": "9999999999" }
```

---

### 2.6 Add Address
`POST /api/auth/me/addresses` 🔒

**Request Body:**
```json
{
  "label": "Home",
  "fullName": "Jane Doe",
  "phone": "9876543210",
  "line1": "123 MG Road",
  "line2": "Apt 4B",
  "city": "Chennai",
  "state": "Tamil Nadu",
  "pincode": "600001"
}
```

**Response (201):** `{ "success": true, "addresses": [...] }`

---

### 2.7 Delete Address
`DELETE /api/auth/me/addresses/:addressId` 🔒

---

### 2.8 Forgot Password
`POST /api/auth/forgot-password`

**Request Body:** `{ "email": "jane@example.com" }`  
**Response (200):** `{ "success": true, "message": "If an account with that email exists, a password reset link has been sent." }`

---

### 2.9 Reset Password
`POST /api/auth/reset-password/:token`

**Request Body:** `{ "password": "newPassword123" }`  
**Response (200):** `{ "success": true, "token": "...", "message": "Password reset successful." }`

---

## 3. Admin — `/api/admin`

### 3.1 Admin Login
`POST /api/admin/login`

> Validates that the user's `role === 'admin'`. Returns same JWT format.

**Request Body:**
```json
{ "email": "admin@freshkart.com", "password": "adminPassword" }
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { "_id": "...", "name": "Admin", "role": "admin" }
}
```

**Errors:** `400` missing fields · `401` invalid credentials · `403` not an admin

---

### 3.2 Dashboard Stats
`GET /api/admin/dashboard` 🔒 (Admin only)

**Response (200):**
```json
{
  "success": true,
  "dashboard": {
    "stats": {
      "totalUsers": 120,
      "totalCustomers": 118,
      "totalProducts": 85,
      "totalOrders": 340,
      "totalRevenue": 152430.50,
      "avgOrderValue": 448.33
    },
    "recentOrders": [...],
    "ordersByStatus": {
      "placed": 12,
      "confirmed": 8,
      "out_for_delivery": 5,
      "delivered": 310,
      "cancelled": 5
    },
    "lowStockProducts": [
      { "_id": "...", "name": "Organic Milk", "stock": 3, "category": "Dairy" }
    ]
  }
}
```

---

### 3.3 Get All Users
`GET /api/admin/users` 🔒 (Admin only)

**Query Params:** `?page=1&limit=20&search=jane`

---

### 3.4 Toggle User Status
`PUT /api/admin/users/:id/toggle-status` 🔒 (Admin only)

**Response:** `{ "success": true, "message": "User activated/deactivated.", "user": {...} }`

---

## 4. Products — `/api/products`

### 4.1 Get All Products
`GET /api/products`

**Query Params (all optional):**
| Param | Type | Description |
|-------|------|-------------|
| `category` | string | Filter by category name (case-insensitive) |
| `search` | string | Full-text search on name/description/tags |
| `trending` | boolean | `?trending=true` |
| `recommended` | boolean | `?recommended=true` |
| `megaDeal` | boolean | `?megaDeal=true` |
| `page` | number | Default: 1 |
| `limit` | number | Default: 50 |

**Response (200):**
```json
{
  "success": true,
  "total": 85,
  "page": 1,
  "products": [
    {
      "_id": "...",
      "name": "Organic Apples",
      "price": 180,
      "originalPrice": 220,
      "category": "Fruits",
      "image": "https://...",
      "unit": "1 kg",
      "stock": 50,
      "rating": 4.5
    }
  ]
}
```

---

### 4.2 Get Single Product
`GET /api/products/:id`

**Response (200):**
```json
{ "success": true, "product": { "_id": "...", "name": "...", "suggestedWith": [...] } }
```

**Errors:** `404` product not found

---

### 4.3 Smart Suggestions
`GET /api/products/suggestions?ids=id1,id2`

**Response (200):**
```json
{ "success": true, "suggestions": [...] }
```

---

### 4.4 Create Product (Admin)
`POST /api/products` 🔒 (Admin only)

**Request Body:**
```json
{
  "name": "Fresh Bananas",
  "price": 60,
  "originalPrice": 80,
  "category": "Fruits",
  "image": "https://...",
  "unit": "1 dozen",
  "stock": 100,
  "description": "Farm-fresh bananas",
  "isTrending": false,
  "isRecommended": true,
  "tags": ["banana", "fruits", "fresh"]
}
```

**Response (201):** `{ "success": true, "product": {...} }`

---

### 4.5 Update Product (Admin)
`PUT /api/products/:id` 🔒 (Admin only)

**Request Body:** Any subset of product fields.

---

### 4.6 Delete Product (Admin)
`DELETE /api/products/:id` 🔒 (Admin only)

**Response (200):** `{ "success": true, "message": "Product deleted." }`

---

## 5. Categories — `/api/categories`

### 5.1 Get All Categories
`GET /api/categories`

**Response (200):**
```json
{ "success": true, "categories": [{ "_id": "...", "name": "Fruits", "image": "...", "slug": "fruits" }] }
```

---

## 6. Cart — `/api/cart` 🔒 (All require auth)

### 6.1 Get Cart
`GET /api/cart`

**Response (200):**
```json
{
  "success": true,
  "cart": {
    "_id": "...",
    "user": "userId",
    "items": [
      { "product": {...}, "name": "Apples", "price": 180, "quantity": 2, "image": "..." }
    ],
    "total": 360,
    "totalPrice": 360
  }
}
```

> `total` and `totalPrice` are identical — both are returned for compatibility.

---

### 6.2 Add to Cart
`POST /api/cart`

**Request Body:**
```json
{ "productId": "664abc...", "quantity": 2 }
```

**Response (200):** `{ "success": true, "cart": {...} }`  
**Errors:** `400` missing productId / insufficient stock · `404` product not found

---

### 6.3 Update Cart Item
`PUT /api/cart/:productId` *(REST style)*  
`PUT /api/cart/update` *(Mobile app style — productId in body)*

**Request Body:**
```json
{ "quantity": 3 }
```
*(For `/update` alias, include `"productId": "664abc..."` in body)*

**Response (200):** `{ "success": true, "cart": {...} }`

---

### 6.4 Remove Item from Cart
`DELETE /api/cart/:productId`

**Response (200):** `{ "success": true, "cart": {...} }`

---

### 6.5 Clear Cart
`DELETE /api/cart/clear` *(Standard)*  
`DELETE /api/cart` *(Mobile app alias)*

**Response (200):** `{ "success": true, "message": "Cart cleared." }`

---

## 7. Orders — `/api/orders` 🔒 (All require auth)

### 7.1 Create Order
`POST /api/orders`

> Cart must not be empty. Cart is cleared automatically after order is placed.

**Request Body:**
```json
{
  "deliveryAddress": {
    "fullName": "Jane Doe",
    "phone": "9876543210",
    "line1": "123 MG Road",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "pincode": "600001"
  },
  "paymentMethod": "COD",
  "notes": "Leave at door"
}
```

**Payment Methods:** `COD` · `card` · `upi` · `wallet` · `netbanking`

**Response (201):**
```json
{
  "success": true,
  "order": {
    "_id": "...",
    "orderNumber": "FK8476295423",
    "items": [...],
    "subtotal": 360,
    "tax": 18,
    "deliveryFee": 40,
    "total": 418,
    "orderStatus": "placed",
    "paymentStatus": "pending",
    "estimatedDelivery": "2026-04-24T06:20:00.000Z"
  }
}
```

**Errors:** `400` empty cart / missing address

---

### 7.2 Get My Orders
`GET /api/orders`

**Response (200):** `{ "success": true, "orders": [...] }`

---

### 7.3 Get Order by ID
`GET /api/orders/:id`

**Response (200):** `{ "success": true, "order": {...} }`  
**Errors:** `404` order not found (or doesn't belong to user)

---

### 7.4 Cancel Order
`PUT /api/orders/:id/cancel`

> Only orders in `placed` status can be cancelled.

**Response (200):** `{ "success": true, "order": { "orderStatus": "cancelled", ... } }`

---

### 7.5 Get All Orders (Admin)
`GET /api/orders/admin/all` 🔒 (Admin only)

**Response (200):** `{ "success": true, "orders": [...] }`

---

### 7.6 Update Order Status (Admin)
`PUT /api/orders/:id/status` 🔒 (Admin only)

**Request Body:** `{ "orderStatus": "confirmed" }`  
**Status Values:** `placed` → `confirmed` → `packed` → `out_for_delivery` → `delivered` | `cancelled`

---

## 8. Customers — `/api/customers` 🔒 (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List all customers (paginated) |
| GET | `/api/customers/stats` | Customer statistics & top spenders |
| GET | `/api/customers/:id` | Get single customer |
| POST | `/api/customers` | Create customer manually |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |
| POST | `/api/customers/:id/address` | Add address |
| POST | `/api/customers/:id/loyalty` | Add loyalty points |
| POST | `/api/customers/:id/order` | Record order manually |
| POST | `/api/customers/:id/reset-password` | Admin reset password |

---

## 9. Offers — `/api/offers`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/offers` | None | Get active offers |
| POST | `/api/offers` | Admin | Create offer |
| PUT | `/api/offers/:id` | Admin | Update offer |
| DELETE | `/api/offers/:id` | Admin | Delete offer |

---

## 10. Deliveries — `/api/deliveries`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/deliveries` | Admin | List all deliveries |
| GET | `/api/deliveries/:id` | Admin | Get delivery details |
| PUT | `/api/deliveries/:id` | Admin | Update delivery status |

---

## Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

| Status Code | Meaning |
|-------------|---------|
| `400` | Bad Request — invalid/missing input |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — valid token but insufficient permissions |
| `404` | Not Found — resource doesn't exist |
| `409` | Conflict — e.g., email already registered |
| `500` | Internal Server Error |

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/freshkart
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

## Running the Server

```bash
cd backend
npm install
npm start          # production
npm run dev        # development (nodemon auto-reload)
npm run seed       # seed database with sample data
```

---

*Last updated: April 2026 — FreshKart API v1.0*
