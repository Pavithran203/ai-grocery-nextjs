# 📚 Customer Database - Complete Guide

## 🏗️ Architecture Overview

```
Frontend (Next.js)
      ↓
API Endpoints (Express.js)
      ↓
Customer Controller (Business Logic)
      ↓
Customer Model (Mongoose Schema)
      ↓
MongoDB Database (Data Storage)
```

---

## 💾 Where Customer Data is Stored

**Live Database:** MongoDB
- **Server:** localhost (your computer)
- **Port:** 27017
- **Database Name:** `freshkart`
- **Collection Name:** `customers`
- **URI:** `mongodb://localhost:27017/freshkart`

**Backend Files:**
```
backend/src/models/Customer.js              (Schema definition)
backend/src/controllers/customerController.js (Business logic)
backend/src/routes/customers.js             (API endpoints)
backend/src/server.js                       (Registered routes)
```

---

## 🔄 How It Works - Step by Step

### 1. **Create a Customer**
```
User submits form → POST /api/customers → Controller validates
   ↓
Mongoose saves to MongoDB → Returns customer with ID
```

### 2. **Retrieve Customer Data**
```
Client requests /api/customers → Controller queries MongoDB
   ↓
Returns customer objects as JSON → Frontend displays
```

### 3. **Update Customer Metrics**
```
Customer places order → POST /api/customers/:id/order → Updates:
   • totalOrders (count++)
   • totalSpent (add amount)
   • averageOrderValue (recalculate)
   • lastOrderDate (set to now)
```

---

## 👀 How to View Customer Data

### **Method 1: Using API Endpoints (Easiest for Dev)**

**View all customers (in browser or terminal):**
```
http://localhost:5000/api/customers
```

**View single customer:**
```
http://localhost:5000/api/customers/{CUSTOMER_ID}
```

**View customer statistics:**
```
http://localhost:5000/api/customers/stats
```

**Search by name:**
```
http://localhost:5000/api/customers?search=john
```

**Filter by account type:**
```
http://localhost:5000/api/customers?accountType=premium
```

**Pagination:**
```
http://localhost:5000/api/customers?page=1&limit=10
```

---

### **Method 2: MongoDB Compass (Recommended Visual Tool)**

1. **Download:** https://www.mongodb.com/try/download/compass
2. **Connect:**
   - Connection String: `mongodb://localhost:27017`
   - Click "Connect"
3. **Navigate:**
   - Left sidebar → `freshkart` database
   - Click `customers` collection
   - See all customer records visually
   - Click any record to view/edit details

**Advantages:**
- ✅ Visual interface
- ✅ Easy search & filter
- ✅ Can edit data directly
- ✅ View collections stats
- ✅ No terminal needed

---

### **Method 3: MongoDB Shell (Terminal)**

```bash
# Connect to MongoDB
mongosh

# Select the database
use freshkart

# View all customers
db.customers.find()

# View specific customer
db.customers.findOne({ email: "raj@example.com" })

# Count total customers
db.customers.countDocuments()

# Find premium customers
db.customers.find({ accountType: "premium" })

# Sort by most spending
db.customers.find().sort({ totalSpent: -1 }).limit(10)

# Get statistics
db.customers.aggregate([
  { $group: { 
    _id: null, 
    totalCustomers: { $sum: 1 },
    avgSpent: { $avg: "$totalSpent" },
    totalRevenue: { $sum: "$totalSpent" }
  }}
])

# Delete customer
db.customers.deleteOne({ _id: ObjectId("...") })
```

---

### **Method 4: Postman (API Testing Tool)**

1. **Download:** https://www.postman.com/downloads/
2. **Create Request:**
   - Method: `GET`
   - URL: `http://localhost:5000/api/customers`
   - Click "Send"
3. **View Response:** Beautiful JSON display

---

## 📊 Sample Customer Data

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "firstName": "Raj",
  "lastName": "Kumar",
  "email": "raj@example.com",
  "phone": "9876543210",
  "primaryAddress": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "status": "active",
  "accountType": "premium",
  "totalOrders": 5,
  "totalSpent": 12500,
  "averageOrderValue": 2500,
  "loyaltyPoints": 1250,
  "createdAt": "2026-02-15T08:00:00.000Z",
  "updatedAt": "2026-03-28T10:30:00.000Z"
}
```

---

## 🔌 All Available API Endpoints

### Basic CRUD
```
POST   /api/customers              Create new customer
GET    /api/customers              Get all (search, filter, paginate)
GET    /api/customers/:id          Get single customer
PUT    /api/customers/:id          Update customer
DELETE /api/customers/:id          Delete customer
```

### Special Operations
```
GET    /api/customers/stats        Get statistics & analytics
POST   /api/customers/:id/address  Add alternate address
POST   /api/customers/:id/order    Record order & update metrics
POST   /api/customers/:id/loyalty  Add loyalty points
```

---

## 💾 This Folder's Purpose

`database/customer_data/` acts as a **backup & operational logging space**:

1. **Scheduled Backups:** Export customer data weekly (JSON/CSV)
2. **Analytics Reports:** Store generated PDF/CSV reports
3. **Logs:** Store application logs & activity history
4. **Snapshots:** Create point-in-time backups

*Live data is in MongoDB. This folder stores exports and logs.*

---

## 🧪 Quick Test

```bash
cd backend
node test-customers.js
```

This runs 12 comprehensive tests. ✅ = All passing

---

## ⚙️ Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't connect to MongoDB | Run `mongod` command |
| 404 on /api/customers | Restart backend: `npm run dev` |
| Can't see created data | Check MongoDB Compass, verify DB name |
| Port 5000 in use | Kill process: `taskkill /PID xxxx /F` |

---

**Everything is connected and working! 🎉**
