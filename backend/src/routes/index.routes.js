
import express from "express";
import hotelsRoute from "./hotels.routes.js";
import usersRoute from "./users.routes.js";
import authRoute from "./auth.routes.js";
import destinationRoute from "./destination.routes.js";
import busRoute from "./bus.routes.js";
import flightRoute from "./flight.routes.js";
import trainRoute from "./train.routes.js";
import travelBookingRoute from "./travelBooking.routes.js";
import hotelBookingRoute from "./hotelBooking.routes.js";
import universalBookingRoute from "./universalBooking.routes.js";
import packageRoute from "./package.routes.js";
import bookingRoute from "../app/routes/bookingRoutes.js";
import paymentRoute from "../app/routes/paymentRoutes.js";
import dashboardRoute from "../app/routes/dashboardRoutes.js";
import chatContactRoute from "./chatContact.routes.js";
import ticketRoute from "../app/routes/ticketRoutes.js";
import hotelOwnerRegistrationRoute from "./hotelOwnerRegistration.routes.js";
import hotelOwnerDashboardRoute from "./hotelOwnerDashboard.routes.js";
import razorpayRoute from "./razorpay.routes.js";
import chatHistoryRoute from "./chatHistory.routes.js";

const app = express();

// Auth routes
app.use("/v1/auth", authRoute);

// Destination routes
app.use("/v1/destinations", destinationRoute);

// User and Hotel routes (existing)
app.use("/v1/users", usersRoute);
app.use("/v1/hotels", hotelsRoute);

// Travel service routes
app.use("/v1/buses", busRoute);
app.use("/v1/flights", flightRoute);
app.use("/v1/trains", trainRoute);

// Booking routes
app.use("/v1/travel-bookings", travelBookingRoute);
app.use("/v1/hotel-bookings", hotelBookingRoute);
app.use("/v1/universal-bookings", universalBookingRoute);

// Package routes
app.use("/v1/packages", packageRoute);

// Booking routes (new unified booking system)
app.use("/v1/bookings", bookingRoute);

// Payment routes
app.use("/v1/payments", paymentRoute);

// Razorpay routes
app.use("/v1/razorpay", razorpayRoute);

// Chat history routes
app.use("/v1/chat-history", chatHistoryRoute);

// Dashboard routes
app.use("/v1/dashboard", dashboardRoute);

// Chat contact routes
app.use("/v1/chat-contacts", chatContactRoute);

// Ticket routes
app.use("/v1/tickets", ticketRoute);

// Hotel Owner Registration routes
app.use("/v1/hotel-owner-registration", hotelOwnerRegistrationRoute);

// Hotel Owner Dashboard routes
app.use("/v1/hotel-owner-dashboard", hotelOwnerDashboardRoute);

export default app;