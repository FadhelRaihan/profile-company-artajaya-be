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
      const showAll = true;
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
      console.log("📦 Request body:", req.body);
      console.log(
        "📁 Uploaded files:",
        req.files ? (req.files as any[]).length : 0
      );

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        if (req.files && Array.isArray(req.files)) {
          req.files.forEach((file) => deleteFile(file.filename));
        }
        res
          .status(400)
          .json({ status: "error", message: "Invalid kegiatan ID format" });
        return;
      }

      const userId = req.user!.id;

      // 🔍 Ambil kegiatan existing untuk mendapatkan foto lama
      const existingKegiatan = await kegiatanService.getKegiatanById(id, false);
      if (!existingKegiatan) {
        if (req.files && Array.isArray(req.files)) {
          req.files.forEach((file) => deleteFile(file.filename));
        }
        res
          .status(404)
          .json({ status: "error", message: "Kegiatan not found" });
        return;
      }

      // 📸 Proses foto BARU (jika ada upload)
      const newPhotos: PhotoData[] = [];
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        (req.files as Express.Multer.File[]).forEach((file) => {
          newPhotos.push({
            photo_name: file.filename,
            url: `/uploads/kegiatan/${file.filename}`,
          });
        });
      }

      // 🗑️ Ambil daftar ID foto lama yang AKAN DIHAPUS dari request
      const { removed_photos } = req.body;
      let removedPhotoIds: string[] = [];

      if (typeof removed_photos === "string") {
        removedPhotoIds = [removed_photos];
      } else if (Array.isArray(removed_photos)) {
        removedPhotoIds = removed_photos as string[];
      }

      console.log("🗑️ Photos marked for removal:", removedPhotoIds);

      // ✅ LOGIKA BARU: Hapus foto yang diminta, lalu tambahkan foto baru
      let finalPhotos: PhotoData[] = [];

      if (existingKegiatan.photos) {
        // 1. Filter foto lama (buang yang ada di removedPhotoIds)
        const remainingPhotos = existingKegiatan.photos.filter(
          (photo) => !removedPhotoIds.includes(photo.id!)
        );

        console.log(`📁 Keeping ${remainingPhotos.length} existing photos`);

        // 2. Hapus file fisik dari foto yang dihapus
        existingKegiatan.photos.forEach((photo) => {
          if (removedPhotoIds.includes(photo.id!)) {
            if (photo.photo_name) {
              deleteFile(photo.photo_name);
              console.log(`🗑️ Deleted file: ${photo.photo_name}`);
            }
          }
        });

        // 3. Gabungkan foto lama yang tersisa + foto baru
        finalPhotos = [
          ...remainingPhotos.map((photo) => ({
            photo_name: photo.photo_name || "",
            url: photo.url || "",
          })),
          ...newPhotos,
        ];
      } else {
        // Jika tidak ada foto lama, gunakan foto baru saja
        finalPhotos = newPhotos;
      }

      console.log(`📊 Final photo count: ${finalPhotos.length}`);

      // ✅ Validasi: Minimal 1 foto harus ada
      if (finalPhotos.length === 0) {
        // Rollback: hapus foto baru yang sudah diupload
        if (req.files && Array.isArray(req.files)) {
          req.files.forEach((file) => deleteFile(file.filename));
        }
        res.status(400).json({
          status: "error",
          message:
            "Kegiatan harus memiliki minimal 1 foto. Tidak bisa menghapus semua foto.",
        });
        return;
      }

      // ✅ Siapkan data update
      const updatePayload = { ...req.body };

      // Convert string 'true'/'false' ke boolean
      if (updatePayload.is_active !== undefined) {
        updatePayload.is_active = updatePayload.is_active === "true";
      }

      const updateData: UpdateKegiatanDTO = {
        nama_kegiatan: updatePayload.nama_kegiatan,
        deskripsi_singkat: updatePayload.deskripsi_singkat,
        tanggal_kegiatan: req.body.tanggal_kegiatan
          ? new Date(req.body.tanggal_kegiatan)
          : existingKegiatan.tanggal_kegiatan || new Date(),
        lokasi_kegiatan: updatePayload.lokasi_kegiatan,
        is_active: updatePayload.is_active ?? existingKegiatan.is_active,
        photos: finalPhotos, // ✅ Kirim foto final (lama + baru - yang dihapus)
      };

      const updatedKegiatan = await kegiatanService.updateKegiatan(
        id,
        updateData,
        userId
      );

      console.log("✅ Kegiatan updated successfully");

      res.status(200).json({
        status: "success",
        data: updatedKegiatan,
        message: `Kegiatan updated successfully. Total photos: ${finalPhotos.length}`,
      });
    } catch (error) {
      console.error("❌ Error in update:", error);

      // Rollback: hapus file baru jika ada error
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach((file) => deleteFile(file.filename));
      }

      res.status(500).json({
        status: "error",
        message: "Failed to update kegiatan",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
