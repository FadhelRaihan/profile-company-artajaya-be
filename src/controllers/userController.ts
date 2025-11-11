import { Request, Response } from "express";
import { UserService } from "../services/userService";
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const userService = new UserService();

export class UserController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      console.log("📥 GET /api/users - Fetching all users...");
      const users = await userService.getAllUsers();
      console.log("✅ Successfully fetched users:", users.length);

      res.status(200).json({
        status: "success",
        data: users,
      });
    } catch (error) {
      console.error("❌ Error in getAll:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch users",
        error: process.env.NODE_ENV === "development" ? error : {},
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`📥 GET /api/users/${id} - Fetching user...`);

      // Validasi dasar apakah ID adalah UUID
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        console.log("⚠️ Invalid ID format");
        res.status(400).json({
          status: "error",
          message: "Invalid user ID",
        });
        return;
      }

      const user = await userService.getUserById(id);

      if (!user) {
        console.log("⚠️ User not found");
        res.status(404).json({
          status: "error",
          message: "User not found",
        });
        return;
      }

      console.log("✅ User found:", user);
      res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      console.error("❌ Error in getById:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch user",
        error: process.env.NODE_ENV === "development" ? error : {},
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      console.log("🔥 POST /api/user - Creating user...");
      console.log("Request body:", req.body);

      const { name, email, password, is_active } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({
          status: "error",
          message: "data required are required",
        });
        return;
      }

      // ✅ Generate UUID
      const uuid = uuidv4();

      const hashed = await bcrypt.hash(password, 10);

      // ✅ Siapkan data dengan UUID
      const userData = {
        id: uuid, // Tambahkan UUID ke data
        name,
        email,
        password: hashed,
        is_active, // ✅ Bisa set active/inactive saat create
      };

      const createdUser = await userService.createUser(
        userData, // Kirim data yang sudah berisi UUID
      );

      console.log("✅ User created:", createdUser);

      res.status(201).json({
        status: "success",
        data: createdUser,
      });
    } catch (error) {
      console.error("❌ Error in create:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to create user",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`📥 PUT /api/users/${id} - Updating user...`);
      console.log("Request body:", req.body);

      const user = await userService.updateUser(id, req.body);

      if (!user) {
        console.log("⚠️ User not found");
        res.status(404).json({
          status: "error",
          message: "User not found",
        });
        return;
      }

      console.log("✅ User updated:", user);
      res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      console.error("❌ Error in update:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to update user",
        error: process.env.NODE_ENV === "development" ? error : {},
      });
    }
  }
}
