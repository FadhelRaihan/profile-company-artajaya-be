// controllers/laporanController.ts
import { Request, Response } from "express";
import { LaporanService } from "../services/laporanService";
import { v4 as uuidv4 } from "uuid";
import { deleteFile, publicPhotoUrl } from "../config/uploadConfig";
import { PhotoData, UpdateLaporanDTO } from "../types/laporan";

const laporanService = new LaporanService();

export class LaporanController {
  // GET /api/laporan?show_all=true
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      console.log("🔥 GET /api/laporan - Fetching laporan...");
      const showAll = req.query.show_all === "true";
      const data = await laporanService.getAllLaporan(!showAll);

      res.status(200).json({
        status: "success",
        data,
      });
    } catch (err) {
      console.error("❌ Error getAll Laporan:", err);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch laporan",
      });
    }
  }

  // GET /api/laporan/:id
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`🔥 GET /api/laporan/${id}`);

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        res.status(400).json({
          status: "error",
          message: "Invalid laporan ID format",
        });
        return;
      }

      const laporan = await laporanService.getLaporanById(id);
      if (!laporan) {
        res.status(404).json({
          status: "error",
          message: "Laporan not found",
        });
        return;
      }

      res.status(200).json({
        status: "success",
        data: laporan,
      });
    } catch (err) {
      console.error("❌ Error getById Laporan:", err);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch laporan",
      });
    }
  }

  // POST /api/laporan
  async create(req: Request, res: Response): Promise<void> {
    try {
      console.log("🔥 POST /api/laporan - Creating laporan...");
      console.log("Body:", req.body);
      console.log("Files:", req.files);

      const {
        nama_proyek,
        // deskripsi_singkat, // akan dihasilkan otomatis dari deskripsi_detail
        deskripsi_detail,
        tanggal_mulai,
        tanggal_selesai,
        lokasi,
        client,
        pelayanan,
        industri,
        is_active,
      } = req.body;

      // ✅ Validasi required fields (detail wajib diisi sesuai permintaanmu)
      if (
        !nama_proyek ||
        !deskripsi_detail ||
        !tanggal_mulai ||
        !tanggal_selesai ||
        !lokasi ||
        !client ||
        !pelayanan ||
        !industri
      ) {
        // rollback file upload bila ada
        if (req.files && Array.isArray(req.files)) {
          req.files.forEach((f) => deleteFile(f.filename));
        }
        res.status(400).json({
          status: "error",
          message:
            "nama_proyek, deskripsi_detail, tanggal_mulai, tanggal_selesai, lokasi, client, pelayanan, dan industri wajib diisi",
        });
        return;
      }

      // (Opsional) Wajib minimal 1 foto
      // if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      //   res.status(400).json({
      //     status: "error",
      //     message: "At least 1 photo is required",
      //   });
      //   return;
      // }

      const userId = String(req.user!.id);
      const laporanUuid = uuidv4();

      // 📸 Mapping photos dari upload
      let photos: PhotoData[] = [];
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        photos = (req.files as Express.Multer.File[]).map((file) => ({
          id: uuidv4(),
          photo_name: file.filename,
          id_laporan: laporanUuid,
          url: publicPhotoUrl("laporan", file.filename),
        }));
      }

      const payload = {
        id: laporanUuid,
        nama_proyek,
        // deskripsi_singkat: deskripsi_singkat, // akan diabaikan oleh service
        deskripsi_detail,
        tanggal_mulai: new Date(tanggal_mulai),
        tanggal_selesai: new Date(tanggal_selesai),
        lokasi,
        client,
        pelayanan,
        industri,
        is_active: is_active === "false" ? false : true,
        photos,
      };

      const created = await laporanService.createLaporan(payload, userId);

      res.status(201).json({
        status: "success",
        data: created,
        message: `Laporan created successfully with ${photos.length} photo(s)`,
      });
    } catch (err) {
      console.error("❌ Error create Laporan:", err);
      // rollback file upload bila error
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach((f) => deleteFile(f.filename));
      }
      res.status(500).json({
        status: "error",
        message: "Failed to create laporan",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  // PUT /api/laporan/:id
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`🔥 PUT /api/laporan/${id} - Updating...`);

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        if (req.files && Array.isArray(req.files)) {
          req.files.forEach((f) => deleteFile(f.filename));
        }
        res
          .status(400)
          .json({ status: "error", message: "Invalid laporan ID format" });
        return;
      }

      const userId = String(req.user!.id);

      // 📸 Foto BARU (opsional)
      let newPhotos: PhotoData[] | undefined = undefined;
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        newPhotos = (req.files as Express.Multer.File[]).map((file) => ({
          // id akan di-generate oleh entity
          photo_name: file.filename,
          url: `/uploads/laporan/${file.filename}`,
        }));
      }

      // 🗑️ Foto LAMA yang ingin dihapus
      const { removed_photos } = req.body;
      let removedPhotosIds: string[] | undefined = undefined;
      if (typeof removed_photos === "string") {
        removedPhotosIds = [removed_photos];
      } else if (Array.isArray(removed_photos)) {
        removedPhotosIds = removed_photos as string[];
      }

      const updatePayloadRaw: any = { ...req.body };

      // Normalisasi boolean
      if (typeof updatePayloadRaw.is_active !== "undefined") {
        updatePayloadRaw.is_active = updatePayloadRaw.is_active === "true";
      }

      // Siapkan DTO update
      const updateData: UpdateLaporanDTO = {
        // field top-level Laporan
        nama_proyek: updatePayloadRaw.nama_proyek,
        // deskripsi_singkat: updatePayloadRaw.deskripsi_singkat, // akan diabaikan; ikut deskripsi_detail
        is_active: updatePayloadRaw.is_active,
        // field Detail
        deskripsi_detail: updatePayloadRaw.deskripsi_detail,
        tanggal_mulai: updatePayloadRaw.tanggal_mulai
          ? new Date(updatePayloadRaw.tanggal_mulai)
          : undefined,
        tanggal_selesai: updatePayloadRaw.tanggal_selesai
          ? new Date(updatePayloadRaw.tanggal_selesai)
          : undefined,
        lokasi: updatePayloadRaw.lokasi,
        client: updatePayloadRaw.client,
        pelayanan: updatePayloadRaw.pelayanan,
        industri: updatePayloadRaw.industri,
        // photos
        photos: newPhotos,
        removed_photos: removedPhotosIds,
      } as UpdateLaporanDTO;

      const updated = await laporanService.updateLaporan(id, updateData, userId);

      res.status(200).json({
        status: "success",
        data: updated,
        message: "Laporan updated successfully",
      });
    } catch (err) {
      console.error("❌ Error update Laporan:", err);
      // rollback file upload baru bila error
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach((f) => deleteFile(f.filename));
      }
      res.status(500).json({
        status: "error",
        message: "Failed to update laporan",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }
}
