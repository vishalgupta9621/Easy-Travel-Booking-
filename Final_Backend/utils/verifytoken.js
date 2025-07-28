import jwt from "jsonwebtoken";
import { createError } from "./error.js"; // You'll need to create this too

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return next(createError(401, "You are not authenticated!"));
  }

  jwt.verify(token, process.env.JWT, (err, user) => {
    if (err) return next(createError(403, "Token is not valid!"));
    req.user = user;
    next();
  });
};

export const verifyUser = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.id) {
      next();
    } else {
      return next(createError(403, "You are not authorized!"));
    }
  });
};

export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      return next(createError(403, "Admin access required!"));
    }
  });
};

export const verifyUserOrAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && (req.user.id === req.params.id || req.user.role === 'admin')) {
      next();
    } else {
      return next(createError(403, "You can only access your own data!"));
    }
  });
};

export const verifyRole = (roles) => {
  return (req, res, next) => {
    verifyToken(req, res, () => {
      if (req.user && roles.includes(req.user.role)) {
        next();
      } else {
        return next(createError(403, `Access denied. Required roles: ${roles.join(', ')}`));
      }
    });
  };
};