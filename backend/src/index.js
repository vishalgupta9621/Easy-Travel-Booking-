import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import index from "./routes/index.routes.js";
import cors from "cors";



const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());


const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to mongoDB.");
  } catch (error) {
    throw error;
  }
};


mongoose.connection.on("disconnected", () => {
  console.log("mongoDB disconnected!");
});



app.use("/api",index);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle specific error types
  if (err.message === 'Email already exists') {
    statusCode = 400;
    message = 'This email address is already registered. Please use a different email or try logging in.';
  } else if (err.message === 'Username already exists') {
    statusCode = 400;
    message = 'This username is already taken. Please choose a different username.';
  } else if (err.message === 'Phone number already exists') {
    statusCode = 400;
    message = 'This phone number is already registered. Please use a different phone number.';
  } else if (err.message === 'This information is already registered') {
    statusCode = 400;
    message = 'Some of the information you provided is already registered. Please check your details.';
  } else if (err.message && err.message.includes('phone: Path `phone` is required')) {
    statusCode = 400;
    message = 'Phone number is required. Please provide a valid phone number.';
  } else if (err.message && err.message.includes('User validation failed')) {
    statusCode = 400;
    if (err.message.includes('phone')) {
      message = 'Please provide a valid phone number (10 digits).';
    } else {
      message = 'Please check your input and try again.';
    }
  } else if (err.message === 'No account found with that email address') {
    statusCode = 404;
    message = 'No account found with that email address. Please check your email or create a new account.';
  } else if (err.message === 'Invalid or expired reset token') {
    statusCode = 400;
    message = 'Invalid or expired reset token. Please request a new password reset.';
  } else if (err.message === 'Reset token has expired') {
    statusCode = 400;
    message = 'Reset token has expired. Please request a new password reset.';
  } else if (err.message === 'Invalid reset request') {
    statusCode = 400;
    message = 'Invalid reset request. Please try again.';
  } else if (err.message === 'Invalid credentials') {
    statusCode = 401;
    message = 'Invalid credentials';
  } else if (err.message === 'User not found') {
    statusCode = 404;
    message = 'User not found';
  } else if (err.message) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(8800, () => {
  connect();
  console.log("Connected to backend.");
});
