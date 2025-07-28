import mongoose from "mongoose"; 
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import hotelsRoute from "./routes/hotels.js";
import authRoute from "./routes/auth.js";
import bookingRouter from "./routes/booking.js";
import destinationsRoute from "./routes/destinations.js";
import flightsRoute from "./routes/flights.js";
import trainsRoute from "./routes/trains.js";
import busesRoute from "./routes/buses.js";
import travelBookingsRoute from "./routes/travelBookings.js";
import { createError, errorHandler } from "./utils/error.js";

// Initialize Express app
const app = express();
dotenv.config();

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiter (Optional)
import rateLimit from "express-rate-limit";
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use("/api/auth", authRoute);
app.use("/api/hotels", hotelsRoute);
app.use("/api/bookings", bookingRouter);
app.use("/api/destinations", destinationsRoute);
app.use("/api/flights", flightsRoute);
app.use("/api/trains", trainsRoute);
app.use("/api/buses", busesRoute);
app.use("/api/travel-bookings", travelBookingsRoute);

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date(),
  });
});

// 404 Handler
app.use((req, res, next) => {
  next(createError(404, "Endpoint not found"));
});

// Error Handler
app.use(errorHandler);

// Server Startup
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

// Graceful Shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed due to app termination");
  process.exit(0);
});

// Start the server
startServer();