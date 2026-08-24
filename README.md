# 🎟️ Ticket Booking System

A full-stack **Ticket Booking System** built using React, Node.js, Express.js, and MongoDB. The application allows users to register/login, browse events, view seat availability, book tickets, cancel bookings, and manage waitlist entries.

## 🌐 Live Application

**Live Website:** Ticket Booking System

**Frontend:** Render Static Site

**Backend API:** Render Web Service

**Database:** MongoDB Atlas

The application is deployed as a separate frontend and backend service for better scalability and maintainability.

## 🚀 Features

* 🔐 User Registration and Login
* 🎭 Event Listing
* 💺 Seat Availability Management
* 🔒 Temporary Seat Holding
* 🎟️ Ticket Booking and Confirmation
* 💰 Automatic Booking Price Calculation
* 📋 Booking History
* ❌ Booking Cancellation
* ⏳ Waitlist Management
* 🔄 Automated Waitlist Offers
* ⚡ Real-time seat and booking updates
* 🗄️ MongoDB database integration
* 🔑 JWT-based authentication
* 🛡️ Protected API routes
* 🌐 RESTful backend APIs

## 🛠️ Technology Stack

### Frontend

* React.js
* Vite
* JavaScript
* Axios
* React Router
* Socket.IO Client
* HTML5
* CSS3

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Socket.IO
* REST API

### Deployment

* Frontend: Render Static Site
* Backend: Render Web Service
* Database: MongoDB Atlas
* Source Control: GitHub

## 📁 Project Structure

```text
ticket-booking-system/
│
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── ...
│   ├── package.json
│   ├── package-lock.json
│   ├── index.html
│   └── .env.example
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── jobs/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env.example
│
└── README.md
```

## 💻 Frontend

The frontend is developed using **React.js and Vite**.

It provides the user interface for:

* Login and authentication
* Viewing available events
* Selecting seats
* Booking tickets
* Viewing booking history
* Cancelling bookings
* Viewing waitlist information

### Frontend Configuration

Create a `.env` file inside the `client` directory:

```env
VITE_API_URL=your_backend_api_url
```

For the deployed application, the frontend communicates with the deployed backend API.

## ⚙️ Backend

The backend is developed using **Node.js and Express.js**.

It provides REST APIs for:

* User authentication
* Event management
* Seat management
* Ticket booking
* Booking cancellation
* Waitlist management
* Database operations

### Backend Configuration

Create a `.env` file inside the `server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=your_frontend_url
HOLD_TTL_MINUTES=your_value
WAITLIST_OFFER_MINUTES=your_value
```

**Never upload your actual `.env` file or database credentials to GitHub.**

## 🗄️ Database

The application uses **MongoDB Atlas** as its cloud database.

The database stores information such as:

* Users
* Events
* Seats
* Bookings
* Waitlist entries

MongoDB is connected to the backend through Mongoose.

## 🎫 Booking Flow

```text
User
  ↓
Register / Login
  ↓
View Events
  ↓
Select Event
  ↓
View Available Seats
  ↓
Select Seat
  ↓
Temporarily Hold Seat
  ↓
Confirm Booking
  ↓
Ticket Generated
  ↓
View Booking History
```

## ⏳ Waitlist Flow

When suitable seats are unavailable:

```text
User
  ↓
Select Event
  ↓
No Suitable Seat Available
  ↓
Join Waitlist
  ↓
Waitlist Entry Created
  ↓
Seat Becomes Available
  ↓
Waitlist Offer Generated
  ↓
User Can Receive Offered Seat
```

## 🔄 Real-Time Functionality

Socket.IO is used for real-time communication between the frontend and backend.

This helps keep seat availability and booking-related information synchronized.

## 🔐 Security

The application includes:

* JWT authentication
* Password hashing
* Protected API routes
* Server-side validation
* Environment variables for sensitive information
* MongoDB authentication
* CORS configuration

Sensitive files such as `.env` and `node_modules` should not be committed to GitHub.

## ▶️ Running the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/sravani7-hub/ticket-booking-system.git
cd ticket-booking-system
```

### 2. Start the Backend

```bash
cd server
npm install
npm start
```

Backend:

```text
http://localhost:5000
```

### 3. Start the Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## ☁️ Deployment Architecture

```text
                 ┌──────────────────────┐
                 │       User           │
                 │      Browser         │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │   React + Vite       │
                 │   Frontend           │
                 │   Render             │
                 └──────────┬───────────┘
                            │
                            │ REST API
                            ▼
                 ┌──────────────────────┐
                 │ Node.js + Express    │
                 │ Backend              │
                 │ Render               │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │    MongoDB Atlas     │
                 │      Database        │
                 └──────────────────────┘
```

## 📌 Deployment

### Frontend

The React frontend is deployed as a **Render Static Site**.

### Backend

The Node.js/Express backend is deployed as a **Render Web Service**.

### Database

MongoDB Atlas is used as the production database.

## 🔮 Future Improvements

* 💳 Online payment gateway integration
* 📧 Email ticket confirmation
* 📱 QR-code based tickets
* 👨‍💼 Admin dashboard
* 🎭 Advanced event management
* 💰 Refund processing
* 📊 Admin analytics and reports
* 🔔 Email/SMS booking notifications
* 📈 Improved monitoring and logging
* 🎨 Enhanced responsive UI

## 👩‍💻 Author

Developed as a full-stack web application demonstrating modern frontend, backend, database, authentication, booking, cancellation, and waitlist management concepts.

## ⭐ Project Highlights

This project demonstrates practical experience with:

* Full-stack development
* REST API development
* React.js
* Node.js and Express.js
* MongoDB and Mongoose
* JWT authentication
* Seat allocation and booking logic
* Waitlist management
* Real-time communication
* Cloud deployment
* Environment configuration

#### 🔗 Project Links

- 🌐 **Live Website:** [Ticket Booking Website](https://ticket-booking-system-client-11ay.onrender.com)
- ⚙️ **Backend API:** [Ticket Booking Backend API](https://ticket-booking-system-1-cmcx.onrender.com)
- 💻 **GitHub Repository:** [Ticket Booking System](https://github.com/sravani7-hub/ticket-booking-system)
- 🎨 **Frontend Code:** [Client](https://github.com/sravani7-hub/ticket-booking-system/tree/main/client)
- 🖥️ **Backend Code:** [Server](https://github.com/sravani7-hub/ticket-booking-system/tree/main/server)
