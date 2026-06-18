# NearMart Project Installation & Requirements Guide

This repository contains a full-stack grocery delivery application structured as a monorepo:
1. **Next.js Web Frontend** (Root Directory)
2. **Express.js Backend** (`/GroceryMob_backend/backend`)
3. **Expo / React Native App** (`/GroceryMob_app`)

To ensure a smooth onboarding and resolve typical environment/installation issues for other developers, follow this guide.

---

## 📋 Prerequisites

Before running the setup, ensure your development machine has the following tools installed:

| Tool | Recommended Version | Purpose |
|------|---------------------|---------|
| **Node.js** | `v18.x` or `v20.x` (LTS) | JavaScript runtime environment |
| **npm** | `v9.x` or higher | Package manager |
| **MongoDB** | `v6.x` or higher (Local / Atlas) | Database (or use the built-in SQLite/mock DB fallback) |
| **Git** | Latest | Version control |
| **Expo Go** (Optional) | Mobile App | Play Store / App Store app to test the mobile client |

---

## ⚡ Automated Setup (Recommended)

We provide an automated cross-platform installation script that:
1. Verifies your system's Node.js compatibility.
2. Creates the necessary environment configuration files (`.env` and `.env.local`) from pre-configured templates.
3. Installs all required dependencies across all three directories (Root Web, Backend, and Mobile App) automatically with safe peer-dependency handling.

### How to Run:
From the root directory of the project, run:
```bash
npm run setup
```
*(If you haven't configured the script in package.json yet, you can run `node requirements/setup.js` directly).*

---

## 🛠 Manual Installation

If you prefer to install packages manually or the automated script fails due to permission restrictions:

### 1. Web Frontend (Root)
```bash
# Navigate to the root directory and install dependencies
npm install --legacy-peer-deps

# Create env file from template if it doesn't exist
cp requirements/env-templates/frontend.env.example .env.local
```

### 2. Express Backend
```bash
# Navigate to the backend directory
cd GroceryMob_backend/backend

# Install dependencies
npm install --legacy-peer-deps

# Create env file from template if it doesn't exist
cp ../../requirements/env-templates/backend.env.example .env
```

### 3. Expo Mobile App
```bash
# Navigate to the mobile app directory
cd GroceryMob_app

# Install dependencies
npm install --legacy-peer-deps
```

---

## 🚀 Running the Services

Once the setup is complete, you can start the development servers:

| App | Command | Working Directory | Port / Access |
|-----|---------|-------------------|---------------|
| **Next.js Frontend** | `npm run dev` | Root | `http://localhost:3000` |
| **Express Backend** | `npm run backend` | Root | `http://localhost:5000` |
| **Expo Mobile App** | `npx expo start` | `/GroceryMob_app` | Scan QR code on Expo Go app |

---

## ⚠️ Common Troubleshooting Issues & Fixes

### 1. "Conflicting peer dependency" errors during npm install
* **Reason:** Node.js 19+ has strict peer dependency resolution.
* **Fix:** Always install using the `--legacy-peer-deps` flag. The automated setup script does this automatically.

### 2. "Port 5000 / 3000 is already in use"
* **Reason:** Another process is occupying the server ports.
* **Fix:** Kill the process running on that port, or change the `PORT` variable in `.env` or `.env.local` to a different number (e.g., `5001`).

### 3. MongoDB Connection Failures
* **Reason:** The backend is trying to connect to a local MongoDB server (`mongodb://localhost:27017/nearmart`) which isn't running.
* **Fix:** Make sure MongoDB service is running on your machine, or update `MONGO_URI` in `GroceryMob_backend/backend/.env` with your MongoDB Atlas connection string.
