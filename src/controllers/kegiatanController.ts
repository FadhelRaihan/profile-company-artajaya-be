import { Request, Response } from "express";
import { KegiatanService } from "../services/kegiatanService";
import { v4 as uuidv4 } from "uuid";
import { deleteFile } from "../config/uploadConfig";
import { PhotoData, UpdateKegiatanDTO } from "../types/kegiatan";

const kegiatanService = new KegiatanService();

export class KegiatanController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      console.log("🔥 GET /api/kegiatan - Fetching kegiatan...");

      // ✅ Query parameter untuk filter active/inactive
      const showAll = req.query.show_all === "true";
      const kegiatan = await kegiatanService.getAllKegiatan(!showAll);

      console.log("✅ Successfully fetched kegiatan:", kegiatan.length);

      res.status(200).json({
        status: "success",
        data: kegiatan,
      });
    } catch (error) {
      console.error("❌ Error in getAll:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch kegiatan",
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`🔥 GET /api/kegiatan/${id}`);

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        res.status(400).json({
          status: "error",
          message: "Invalid kegiatan ID format",
        });
        return;
      }

      const kegiatan = await kegiatanService.getKegiatanById(id);

      if (!kegiatan) {
        res.status(404).json({
          status: "error",
          message: "Kegiatan not found",
        });
        return;
      }

      res.status(200).json({
        status: "success",
        data: kegiatan,
      });
    } catch (error) {
      console.error("❌ Error in getById:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch kegiatan",
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      console.log("🔥 POST /api/kegiatan - Creating kegiatan...");
      console.log("Request body:", req.body);
      console.log("Files:", req.files);

      const {
        nama_kegiatan,
        deskripsi_singkat,
        tanggal_kegiatan,
        lokasi_kegiatan,
        is_active,
      } = req.body;

      // ✅ Validasi required fields
      if (
        !nama_kegiatan ||
        !deskripsi_singkat ||
        !tanggal_kegiatan ||
        !lokasi_kegiatan
      ) {
        // 🗑️ Hapus file yang sudah diupload jika validasi gagal
        if (req.files && Array.isArray(req.files)) {
          req.files.forEach((file) => deleteFile(file.filename));
        }

        res.status(400).json({
          status: "error",
          message:
            "nama_kegiatan, deskripsi_singkat, tanggal_kegiatan, and lokasi_kegiatan are required",
        });
        return;
      }

      // ✅ Validasi minimal 1 foto wajib diupload
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        res.status(400).json({
          status: "error",
          message: "At least 1 photo is required",
        });
        return;
      }

      const userId = req.user!.id;
      const kegiatanUuid = uuidv4();

      // 📸 Process uploaded photos
      const photos = (req.files as Express.Multer.File[]).map((file) => ({
        id: uuidv4(),
        id_kegiatan: kegiatanUuid,
        photo_name: file.filename,
        url: `/uploads/kegiatan/${file.filename}`, // URL untuk akses file
      }));

      const statusKegiatan = is_active === "false" ? false : true;

      // ✅ Siapkan data kegiatan
      const kegiatanData = {
        id: kegiatanUuid,
        nama_kegiatan,
        deskripsi_singkat,
        tanggal_kegiatan: new Date(tanggal_kegiatan),
        lokasi_kegiatan,
        is_active: statusKegiatan,
        photos,
        created_by: userId,
      };

      const createdKegiatan = await kegiatanService.createKegiatan(
        kegiatanData,
        userId
      );

      console.log("✅ Kegiatan created with", photos.length, "photos");

      res.status(201).json({
        status: "success",
        data: createdKegiatan,
        message: `Kegiatan created successfully with ${photos.length} photo(s)`,
      });
    } catch (error) {
      console.error("❌ Error in create:", error);

      // 🗑️ Rollback: Hapus file yang sudah diupload jika ada error
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach((file) => deleteFile(file.filename));
      }

      res.status(500).json({
        status: "error",
        message: "Failed to create kegiatan",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`🔥 PUT /api/kegiatan/${id} - Updating...`);

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        // ... (penanganan error ID tidak valid, jangan lupa hapus file baru)
        if (req.files && Array.isArray(req.files)) {
          req.files.forEach((file) => deleteFile(file.filename));
        }
        res
          .status(400)
          .json({ status: "error", message: "Invalid kegiatan ID format" });
        return;
      }

      const userId = req.user!.id;

      // 📸 Proses foto BARU (jika ada)
      let newPhotos: PhotoData[] | undefined = undefined;
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        newPhotos = (req.files as Express.Multer.File[]).map((file) => ({
          id: uuidv4(), // ID baru untuk foto
          id_kegiatan: id,
          photo_name: file.filename,
          url: `/uploads/kegiatan/${file.filename}`,
        }));
      }

      // 📭 Ambil daftar FOTO LAMA YANG AKAN DIHAPUS
      // Pastikan frontend mengirim ini sebagai array, misal: removed_photos[]
      const { removed_photos } = req.body;
      let removedPhotosIds: string[] | undefined = undefined;

      if (typeof removed_photos === "string") {
        removedPhotosIds = [removed_photos]; // Handle jika hanya 1
      } else if (Array.isArray(removed_photos)) {
        removedPhotosIds = removed_photos as string[]; // Handle jika array
      }

      console.log("🚮 Photos to remove:", removedPhotosIds);

      const updatePayload = { ...req.body };

      if (updatePayload.is_active !== undefined) {
        updatePayload.is_active = updatePayload.is_active === "true";
        console.log(
          `Service: Status 'is_active' di-update ke: ${updatePayload.is_active}`
        );
      }

      // ✅ Siapkan data update
      const updateData: UpdateKegiatanDTO = {
        ...updatePayload,
        tanggal_kegiatan: req.body.tanggal_kegiatan
          ? new Date(req.body.tanggal_kegiatan)
          : undefined,
        photos: newPhotos, // Kirim foto baru ke service
        removed_photos: removedPhotosIds, // Kirim ID foto yang akan dihapus
      };

      const updatedKegiatan = await kegiatanService.updateKegiatan(
        id,
        updateData,
        userId
      );

      console.log("✅ Kegiatan updated");

      res.status(200).json({
        status: "success",
        data: updatedKegiatan,
        message: "Kegiatan updated successfully",
      });
    } catch (error) {
      // ... (penanganan error, jangan lupa hapus file baru jika gagal)
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach((file) => deleteFile(file.filename));
      }
      res.status(500).json({
        /* ... error response ... */
      });
    }
  }
}
