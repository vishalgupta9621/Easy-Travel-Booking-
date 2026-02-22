✈️ Easy Travel Booking

A scalable full-stack travel booking platform built using the MERN Stack with secure JWT authentication, role-based access control, advanced search/filtering, and booking management features.

🚀 Tech Stack
🖥 Frontend
React.js
Tailwind CSS
Axios
React Router DOM
Context API / State Management

⚙ Backend
Node.js
Express.js
JWT Authentication
RESTful APIs

🗄 Database
MongoDB (Mongoose ODM)

✨ Key Features
🔐 JWT-based Authentication (Login / Register)
🛡 Role-Based Access Control (Admin / User)
🔍 Destination Search & Filtering
🧳 Travel Package Management
📅 Booking Management System
💳 Payment Gateway Integration
📧 Email Notifications on Booking Confirmation

📱 Fully Responsive UI (Tailwind CSS)
⚡ Optimized REST APIs with proper validation & indexing

🏗 Architecture Overview
Client (React + Tailwind)
        ↓
REST API (Express.js)
        ↓
MongoDB (Database)

Frontend communicates with backend using Axios.
Backend handles authentication, validation, and business logic.
MongoDB stores users, bookings, and travel data.

📂 Project Structure
Easy-Travel-Booking
│
├── client/              # React Frontend
│   ├── components/
│   ├── pages/
│   ├── context/
│   └── services/
│
├── server/              # Express Backend
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── config/
│
└── README.md

🔐 Authentication & Authorization
JWT token generated during login
Token stored securely
Protected routes using middleware
Role-based middleware for admin operations
