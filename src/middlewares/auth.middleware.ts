import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request untuk include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        name: string;
        password: string;
      };
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Ambil token dari header
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({
        status: "error",
        message: "Authentication required. Please login first.",
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as any;

    // Simpan user info di request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      password: decoded.password,
    };

    next();
  } catch (error) {
    res.status(401).json({
      status: "error",
      message: "Invalid or expired token",
    });
  }
};
