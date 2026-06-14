# Student, Alumni & Mentor Connect

A full-stack MERN platform connecting students, alumni, and mentors for career guidance, networking, and opportunities.

## 🚀 Live Demo
- **Frontend:** https://student-alumni-mentor-connect.vercel.app
- **Backend API Health:** https://student-alumni-mentor-connect.onrender.com/health

> Note: Backend is hosted on Render's free tier and may take ~30 seconds to wake up on first request after inactivity.

## 🛠️ Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Zustand, React Router, Socket.io-client
- **Backend:** Node.js, Express, MongoDB, Mongoose, Socket.io
- **Auth:** JWT (access + refresh tokens), bcrypt, email OTP verification
- **Storage:** Cloudinary (image uploads)
- **Email:** Resend
- **Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (database)
- **CI/CD:** GitHub Actions

## ✨ Features
- Role-based authentication (Student, Alumni, Mentor, Admin)
- Email OTP verification and password reset
- Profile management with photo upload and completeness tracking
- Mentor discovery with search, skill, and availability filters
- Connection request system (send, accept, decline, withdraw)
- Real-time 1-to-1 messaging with typing indicators (Socket.io)
- Events module with registration
- Job board with save/bookmark and admin approval
- Real-time notification system
- Admin dashboard with platform stats and content moderation

## 🏗️ Architecture
Modular monolith built on the MERN stack. Backend organized by feature domains (auth, users, connections, messaging, events, jobs, notifications, admin), each with its own routes, controller, and service layer — designed so modules could be extracted into microservices as the platform scales.

## 📦 Local Setup

### Backend
\`\`\`bash
cd server
npm install
cp .env.example .env  # fill in your credentials
npm run dev
\`\`\`

### Frontend
\`\`\`bash
cd client
npm install
npm run dev
\`\`\`

## 🔐 Security
- JWT dual-token strategy (15min access token, 7-day refresh token in httpOnly cookie)
- bcrypt password hashing (12 salt rounds)
- express-rate-limit on authentication routes
- helmet for secure HTTP headers
- Role-based access control (RBAC) middleware