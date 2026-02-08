# 🗞️ NewsHub: Next-Gen Media Portal

A high-performance, full-stack news management ecosystem designed for modern journalism. NewsHub features a robust role-based access control (RBAC) system, real-time engagement metrics, and a premium "Paywall" experience to drive user registration.

---

## 🌟 Key Features

### 🔐 1. Multi-Tier Security & RBAC
*   **Administrator**: Full platform oversight, staff management, and article moderation.
*   **Publisher**: Advanced content studio with scheduling and personalized performance analytics.
*   **Reader**: Personalized hub for bookmarks, follows, and real-time news alerts.
*   **Security Hardening**: Force-unmount logic on logout ensures zero state-leakage between sessions.

### 📊 2. Publisher Intelligence
*   **Live Metrics**: Real-time aggregation of views, likes, shares, and comments using MongoDB aggregation pipelines.
*   **Article Trends**: Visual bar charts and daily activity line charts.
*   **Content Lifecycle**: Manage drafts, pending reviews, and scheduled releases with automated timers.

### 💎 3. Premium Reading Experience
*   **Smart Paywall**: Attracts guests with a "Teaser" (Title, Image, Snippet) and a smooth fade-out, requiring login for full investigative reports.
*   **Real-Time Core**: Socket.IO powered notifications and engagement updates.
*   **Global Reach**: Native "English-Nepali" toggle with full RTL/LTR support via `i18next`.

---

## 🚀 Quick Setup

### 1. Installation
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Environment (.env)
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/news_portal
JWT_SECRET=your_hyper_secure_secret
PORT=5000
ADMIN_EMAIL=admin@imark.com
```

### 3. Execution
```bash
npm run dev:full
```
*   **Frontend**: `http://localhost:3000`
*   **Backend**: `http://localhost:5000`

---

## 🛠️ Technology Stack
*   **Frontend**: React 18, Material UI 5, Chart.js, i18next
*   **Backend**: Node.js, Express, MongoDB (Mongoose)
*   **Real-time**: Socket.IO
*   **Authentication**: JWT (JSON Web Tokens) with HttpOnly support

---

## 📦 Project Structure
*   `/client`: React application (Pages, Components, Contexts)
*   `/routes`: Modular Express API endpoints (Auth, Analytics, Articles)
*   `/models`: Mongoose schemas for Users, Articles, and Notifications
*   `/middleware`: Security, Role-Verification, and Auth handlers

---

## ⚖️ License
Licensed under the MIT License. Developed for the Imark Internship Program.
