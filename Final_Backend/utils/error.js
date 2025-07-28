// utils/error.js
export const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

export const errorHandler = (err, req, res, next) => {
  // Log the error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    user: req.user?.id
  });

  // Set default values if not provided
  const statusCode = err.status || 500;
  const message = err.message || 'Something went wrong!';

  // Send error response
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};