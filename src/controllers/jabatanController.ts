import { Request, Response } from "express";
import { JabatanService } from "../services/jabatanService";
import { v4 as uuidv4 } from "uuid";
// import { deleteFile, publicPhotoUrl } from "../config/uploadConfig";
import { UpdateJabatanDTO } from "../types/jabatan";

const jabatanService = new JabatanService();

export class JabatanController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      console.log("🔥 GET /api/jabatan - Fetching jabatan...");

      // ✅ Query parameter untuk filter active/inactive
      const showAll = true;
      const jabatan = await jabatanService.getAllJabatan(!showAll);

      console.log("✅ Successfully fetched jabatan:", jabatan.length);

      res.status(200).json({
        status: "success",
        data: jabatan,
      });
    } catch (error) {
      console.error("❌ Error in getAll:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch jabatan",
      });
    }
  }

  async getAllActive(req: Request, res: Response): Promise<void> {
    try {
      console.log("🔥 GET /api/jabatan/active - Fetching jabatan...");

      const jabatan = await jabatanService.getAllActiveJabatan();

      console.log("✅ Successfully fetched jabatan:", jabatan.length);

      res.status(200).json({
        status: "success",
        data: jabatan,
      });
    } catch (error) {
      console.error("❌ Error in getAll:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch jabatan",
      });
    }
  }

  async getAllinActive(req: Request, res: Response): Promise<void> {
    try {
      console.log("🔥 GET /api/jabatan/inactive - Fetching jabatan...");

      // ✅ Query parameter untuk filter active/inactive
      const jabatan = await jabatanService.getAllInactiveJabatan();

      console.log("✅ Successfully fetched jabatan:", jabatan.length);

      res.status(200).json({
        status: "success",
        data: jabatan,
      });
    } catch (error) {
      console.error("❌ Error in getAll:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch jabatan",
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`🔥 GET /api/jabatan/${id}`);

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        res.status(400).json({
          status: "error",
          message: "Invalid jabatan ID format",
        });
        return;
      }

      const jabatan = await jabatanService.getJabatanById(id);

      if (!jabatan) {
        res.status(404).json({
          status: "error",
          message: "jabatan not found",
        });
        return;
      }

      res.status(200).json({
        status: "success",
        data: jabatan,
      });
    } catch (error) {
      console.error("❌ Error in getById:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch jabatan",
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      console.log("🔥 POST /api/jabatan - Creating jabatan...");
      console.log("Request body:", req.body);
      console.log("Files:", req.files);

      const {
        nama_jabatan,
        urutan,
        is_active,
      } = req.body;

      // ✅ Validasi required fields
      if (!nama_jabatan || !urutan){

        res.status(400).json({
          status: "error",
          message:
            "nama_jabatan and urutan are required",
        });
        return;
      }

      const userId = req.user!.id;
      const jabatannUuid = uuidv4();

      const statusKegiatan = is_active === "false" ? false : true;

      // ✅ Siapkan data kegiatan
      const jabatanData = {
        id: jabatannUuid,
        nama_jabatan,
        urutan,
        is_active: statusKegiatan,
        created_by: userId,
      };

      const createdJabatan = await jabatanService.createJabatan(
        jabatanData,
        userId
      );

    //   console.log("✅ Jabatan created with", "photos");

      res.status(201).json({
        status: "success",
        data: createdJabatan,
        message: `Jabatan created successfully`,
      });
    } catch (error) {
      console.error("❌ Error in create:", error);

      res.status(500).json({
        status: "error",
        message: "Failed to create jabatan",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`🔥 PUT /api/jabatan/${id} - Updating...`);
      console.log("📦 Request body:", req.body);

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        res
          .status(400)
          .json({ status: "error", message: "Invalid jabatan ID format" });
        return;
      }

      const userId = req.user!.id;

      // 🔍 Ambil jabatan existing untuk mendapatkan foto lama
      const existingJabatan = await jabatanService.getJabatanById(id, false);
      if (!existingJabatan) {
        res
          .status(404)
          .json({ status: "error", message: "Jabatan not found" });
        return;
      }

      // ✅ Siapkan data update
      const updatePayload = { ...req.body };

      // Convert string 'true'/'false' ke boolean
      if (updatePayload.is_active !== undefined) {
        updatePayload.is_active = updatePayload.is_active === "true";
      }

      const updateData: UpdateJabatanDTO = {
        nama_jabatan: updatePayload.nama_jabatan,
        urutan: updatePayload.urutan,
        is_active: updatePayload.is_active ?? existingJabatan.is_active,
      };

      const updatedJabatan = await jabatanService.updateJabatan(
        id,
        updateData,
        userId
      );

      console.log("✅ Jabatan updated successfully");

      res.status(200).json({
        status: "success",
        data: updatedJabatan,
        message: `Jabatan updated successfully.`,
      });
    } catch (error) {
      console.error("❌ Error in update:", error);

      res.status(500).json({
        status: "error",
        message: "Failed to update jabatan",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
