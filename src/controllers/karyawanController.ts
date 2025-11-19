import { Request, Response } from "express";
import { KaryawanService } from "../services/karyawanService";
import { v4 as uuidv4 } from "uuid";
import { deleteFileKaryawan, publicPhotoUrl } from "../config/uploadConfig";
import { UpdateKaryawanDTO } from "../types/karyawan";

const karyawanService = new KaryawanService();

export class KaryawanController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      console.log("🔥 GET /api/karyawan - Fetching karyawan...");

      // ✅ Query parameter untuk filter active/inactive
      const showAll = true;
      const karyawan = await karyawanService.getAllKaryawan(!showAll);

      console.log("✅ Successfully fetched karyawan:", karyawan.length);

      res.status(200).json({
        status: "success",
        data: karyawan,
      });
    } catch (error) {
      console.error("❌ Error in getAll:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch karyawan",
      });
    }
  }

  async getAllActive(req: Request, res: Response): Promise<void> {
    try {
      console.log("🔥 GET /api/karyawan/active - Fetching active karyawan...");

      const karyawan = await karyawanService.getAllActiveKaryawan();

      console.log("✅ Successfully fetched active karyawan:", karyawan.length);

      res.status(200).json({
        status: "success",
        data: karyawan,
      });
    } catch (error) {
      console.error("❌ Error in getAllActive:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch active karyawan",
      });
    }
  }

  async getAllInactive(req: Request, res: Response): Promise<void> {
    try {
      console.log("🔥 GET /api/karyawan/inactive - Fetching inactive karyawan...");

      const karyawan = await karyawanService.getAllInactiveKaryawan();

      console.log("✅ Successfully fetched inactive karyawan:", karyawan.length);

      res.status(200).json({
        status: "success",
        data: karyawan,
      });
    } catch (error) {
      console.error("❌ Error in getAllInactive:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch inactive karyawan",
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`🔥 GET /api/karyawan/${id}`);

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        res.status(400).json({
          status: "error",
          message: "Invalid karyawan ID format",
        });
        return;
      }

      const karyawan = await karyawanService.getKaryawanById(id);

      if (!karyawan) {
        res.status(404).json({
          status: "error",
          message: "Karyawan not found",
        });
        return;
      }

      res.status(200).json({
        status: "success",
        data: karyawan,
      });
    } catch (error) {
      console.error("❌ Error in getById:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch karyawan",
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      console.log("🔥 POST /api/karyawan - Creating karyawan...");
      console.log("Request body:", req.body);
      console.log("File:", req.file);

      const {
        nama_karyawan,
        no_telepon,
        email,
        tanggal_masuk,
        id_jabatan,
        is_active,
      } = req.body;

      // ✅ Validasi required fields
      if (
        !nama_karyawan ||
        !no_telepon ||
        !email ||
        !tanggal_masuk ||
        !id_jabatan
      ) {
        // 🗑️ Hapus file yang sudah diupload jika validasi gagal
        if (req.file) {
          deleteFileKaryawan(req.file.filename);
        }

        res.status(400).json({
          status: "error",
          message:
            "nama_karyawan, no_telepon, email, tanggal_masuk, and id_jabatan are required",
        });
        return;
      }

      // ✅ Validasi foto wajib diupload
      if (!req.file) {
        res.status(400).json({
          status: "error",
          message: "Photo is required",
        });
        return;
      }

      const userId = req.user!.id;
      const karyawanUuid = uuidv4();

      // 📸 Process uploaded photo
      const photoUrl = publicPhotoUrl("karyawan", req.file.filename);

      const statusKaryawan = is_active === "false" ? false : true;

      // ✅ Siapkan data karyawan
      const karyawanData = {
        id: karyawanUuid,
        nama_karyawan,
        no_telepon,
        email,
        tanggal_masuk: new Date(tanggal_masuk),
        id_jabatan,
        photo_url: photoUrl,
        is_active: statusKaryawan,
        created_by: userId,
      };

      const createdKaryawan = await karyawanService.createKaryawan(
        karyawanData,
        userId
      );

      console.log("✅ Karyawan created successfully");

      res.status(201).json({
        status: "success",
        data: createdKaryawan,
        message: "Karyawan created successfully",
      });
    } catch (error) {
      console.error("❌ Error in create:", error);

      // 🗑️ Rollback: Hapus file yang sudah diupload jika ada error
      if (req.file) {
        deleteFileKaryawan(req.file.filename);
      }

      res.status(500).json({
        status: "error",
        message: "Failed to create karyawan",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`🔥 PUT /api/karyawan/${id} - Updating...`);
      console.log("📦 Request body:", req.body);
      console.log("📁 Uploaded file:", req.file ? req.file.filename : "none");

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        if (req.file) {
          deleteFileKaryawan(req.file.filename);
        }
        res
          .status(400)
          .json({ status: "error", message: "Invalid karyawan ID format" });
        return;
      }

      // 🔍 Ambil karyawan existing
      const existingKaryawan = await karyawanService.getKaryawanById(id, false);
      if (!existingKaryawan) {
        if (req.file) {
          deleteFileKaryawan(req.file.filename);
        }
        res
          .status(404)
          .json({ status: "error", message: "Karyawan not found" });
        return;
      }

      // ✅ Siapkan data update
      const updatePayload = { ...req.body };

      // Convert string 'true'/'false' ke boolean
      if (updatePayload.is_active !== undefined) {
        updatePayload.is_active = updatePayload.is_active === "true";
      }

      const updateData: UpdateKaryawanDTO = {
        nama_karyawan: updatePayload.nama_karyawan,
        no_telepon: updatePayload.no_telepon,
        email: updatePayload.email,
        tanggal_masuk: updatePayload.tanggal_masuk
          ? new Date(updatePayload.tanggal_masuk)
          : undefined,
        id_jabatan: updatePayload.id_jabatan,
        is_active: updatePayload.is_active,
      };

      // 📸 Handle foto baru jika ada upload
      if (req.file) {
        updateData.photo_url = publicPhotoUrl("karyawan", req.file.filename);
        console.log(`📸 New photo uploaded: ${req.file.filename}`);
      }

      const updatedKaryawan = await karyawanService.updateKaryawan(
        id,
        updateData
      );

      console.log("✅ Karyawan updated successfully");

      res.status(200).json({
        status: "success",
        data: updatedKaryawan,
        message: "Karyawan updated successfully",
      });
    } catch (error) {
      console.error("❌ Error in update:", error);

      // Rollback: hapus file baru jika ada error
      if (req.file) {
        deleteFileKaryawan(req.file.filename);
      }

      res.status(500).json({
        status: "error",
        message: "Failed to update karyawan",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async softDelete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`🔥 PATCH /api/karyawan/${id}/soft-delete`);

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        res
          .status(400)
          .json({ status: "error", message: "Invalid karyawan ID format" });
        return;
      }

      const karyawan = await karyawanService.softDeleteKaryawan(id);

      if (!karyawan) {
        res
          .status(404)
          .json({ status: "error", message: "Karyawan not found" });
        return;
      }

      console.log("✅ Karyawan soft deleted successfully");

      res.status(200).json({
        status: "success",
        data: karyawan,
        message: "Karyawan deactivated successfully",
      });
    } catch (error) {
      console.error("❌ Error in softDelete:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to deactivate karyawan",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async restore(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`🔥 PATCH /api/karyawan/${id}/restore`);

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        res
          .status(400)
          .json({ status: "error", message: "Invalid karyawan ID format" });
        return;
      }

      const karyawan = await karyawanService.restoreKaryawan(id);

      if (!karyawan) {
        res
          .status(404)
          .json({ status: "error", message: "Karyawan not found" });
        return;
      }

      console.log("✅ Karyawan restored successfully");

      res.status(200).json({
        status: "success",
        data: karyawan,
        message: "Karyawan restored successfully",
      });
    } catch (error) {
      console.error("❌ Error in restore:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to restore karyawan",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async hardDelete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`🔥 DELETE /api/karyawan/${id}`);

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        res
          .status(400)
          .json({ status: "error", message: "Invalid karyawan ID format" });
        return;
      }

      await karyawanService.deleteKaryawan(id);

      console.log("✅ Karyawan permanently deleted");

      res.status(200).json({
        status: "success",
        message: "Karyawan permanently deleted",
      });
    } catch (error) {
      console.error("❌ Error in hardDelete:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to delete karyawan",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}