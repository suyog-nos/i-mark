# News Portal System (Imark Internship)

A full-stack news management application built with the MERN stack (MongoDB, Express.js, React, Node.js). This project demonstrates Role-Based Access Control (RBAC), real-time data handling, and content management workflows.

##  Project Overview

This system is designed to manage the lifecycle of news articles from creation to publication. It features distinct interfaces for Administrators, Publishers, and Readers, ensuring secure and appropriate access to resources.

##  Implemented Features

### 1. Authentication & Security
- **JWT Authentication**: Secure login system using JSON Web Tokens.
- **Role-Based Access Control (RBAC)**: Middleware ensures tailored access for Admins, Publishers, and Readers.
- **Secure Sessions**: Automatic token management and logout handling.

### 2. User Roles
- **Administrator**: Complete control over users and content. Can approve/reject articles via a Moderation Queue.
- **Publisher**: dedicated dashboard to draft, edit, and submit articles. Access to performance analytics (views, status distribution).
- **Reader**: Public access to published news with features to bookmark articles and follow publishers.

### 3. Core Functionality
- **Content Management**: Rich-text article creation with image upload support (Multer).
- **Workflow System**: Articles transition through Draft → Pending → Published/Rejected states.
- **Dashboard Analytics**: Visual data representation using Chart.js for publisher metrics.
- **Localization**: Full support for English and Nepali languages using `i18next`.

### 4. Real-Time Features
- **Notifications**: Socket.IO integration alerts publishers instantly when their articles are approved or rejected.
- **Live Status**: Real-time updates without page refreshes.

---

##  Technology Stack

- **Frontend**: React 18, Material UI 5, Chart.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Real-Time**: Socket.IO
- **Utilities**: Multer (File Upload), i18next (Localization)

---

##  Setup Instructions

### 1. Prerequisites
- Node.js (v14 or higher)
- MongoDB (Local instance or Atlas connection string)

### 2. Installation

Clone the repository and install dependencies for both server and client.

```bash
# 1. Install Backend Dependencies
npm install

# 2. Install Frontend Dependencies
cd client
npm install
cd ..
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following keys:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/news_portal
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=http://localhost:3000

# Optional: Admin Seeder Defaults
ADMIN_EMAIL=admin@imark.com
ADMIN_PASSWORD=admin123
```

### 4. Running the Application

This project uses `concurrently` to run both servers with a single command:

```bash
npm run dev:full
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## Project Structure

- `/client`: React frontend application source.
- `/config`: Backend configuration (i18n, DB).
- `/middleware`: Custom middleware for Auth (JWT) and File Uploads.
- `/models`: Database schemas (User, Article, Notification).
- `/routes`: API endpoints and controller logic.
- `/utils`: Helper scripts for validation and seeding.
- `/uploads`: Storage for uploaded article images.

## 🛠️ System Management & Troubleshooting

### Stopping the Application
To stop the server, press `Ctrl + C` in your terminal.

### Killing Locked Ports (If Server Won't Start)
If you see `EADDRINUSE` errors (Port 3000/5000 already in use), run these commands to force-kill the processes:

**Windows:**
```bash
npx kill-port 5000 3000
# OR
taskkill /F /IM node.exe
```

**Mac/Linux:**
```bash
npx kill-port 5000 3000
# OR
lsof -ti:5000,3000 | xargs kill -9
```

### Full Restart
If the application behaves unexpectedly:
1. Stop the terminal (`Ctrl + C`).
2. Run `npx kill-port 5000 3000` to clear ports.
3. Content `npm run dev:full` to restart.

## 📜 License
Academic Project - Imark Internship Program.
