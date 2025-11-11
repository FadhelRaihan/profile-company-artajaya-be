import "reflect-metadata";
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from 'path';

// Import routes
import userRoutes from "./routes/userRoutes";
import testimoniRoutes from "./routes/testimoniRoutes";
import authRoutes from "./routes/authRoutes";
import kegiatanRoutes from "./routes/kegiatanRoutes";

dotenv.config();

const app: Application = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Port default Vite
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware - TAMBAHKAN INI
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log("\n==========================================");
  console.log(`📨 ${req.method} ${req.path}`);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("==========================================\n");
  next();
});

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/testimoni", testimoniRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/kegiatan", kegiatanRoutes);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("==========================================");
  console.error("❌ UNHANDLED ERROR:");
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);
  console.error("==========================================");

  res.status(500).json({
    status: "error",
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? {
            message: err.message,
            stack: err.stack,
          }
        : {},
  });
});

export default app;
