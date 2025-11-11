import { Request, Response } from 'express';
import { KegiatanService } from '../services/kegiatanService';
import { v4 as uuidv4 } from 'uuid';

const kegiatanService = new KegiatanService();

export class KegiatanController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔥 GET /api/kegiatan - Fetching kegiatan...');

      // ✅ Query parameter untuk filter active/inactive
      const showAll = req.query.show_all === 'true';
      const kegiatan = await kegiatanService.getAllKegiatan(!showAll);

      console.log('✅ Successfully fetched kegiatan:', kegiatan.length);

      res.status(200).json({
        status: 'success',
        data: kegiatan,
      });
    } catch (error) {
      console.error('❌ Error in getAll:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch kegiatan',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`🔥 GET /api/kegiatan/${id}`);

      // Validasi dasar apakah ID adalah UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid kegiatan ID format',
        });
        return;
      }

      const kegiatan = await kegiatanService.getKegiatanById(id); // Pastikan service menerima string

      if (!kegiatan) {
        res.status(404).json({
          status: 'error',
          message: 'Kegiatan not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: kegiatan,
      });
    } catch (error) {
      console.error('❌ Error in getById:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch kegiatan',
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔥 POST /api/kegiatan - Creating kegiatan...');
      console.log('Request body:', req.body);
      console.log('User:', req.user);

      const { nama_kegiatan, deskripsi_singkat, tanggal_kegiatan, lokasi_kegiatan, is_active, photos } = req.body;

      if (!nama_kegiatan || !deskripsi_singkat || !tanggal_kegiatan || !lokasi_kegiatan || !photos) {
        res.status(400).json({
          status: 'error',
          message: 'data are required',
        });
        return;
      }

      const userId = req.user!.id;

      // ✅ Generate UUID
      const uuid = uuidv4();

      // ✅ Siapkan data dengan UUID
      const kegiatanData = {
        id: uuid, // Tambahkan UUID ke data
        nama_kegiatan,
        deskripsi_singkat,
        tanggal_kegiatan,
        lokasi_kegiatan,
        is_active, 
        photos,
      };

      const createdKegiatan = await kegiatanService.createKegiatan(
        kegiatanData, // Kirim data yang sudah berisi UUID
        userId
      );

      console.log('✅ Kegiatan created:', createdKegiatan);

      res.status(201).json({
        status: 'success',
        data: createdKegiatan,
      });
    } catch (error) {
      console.error('❌ Error in create:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create testimoni',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`🔥 PUT /api/kegiatan/${id} - Updating...`);
      console.log('Request body:', req.body);

      // Validasi dasar apakah ID adalah UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid kegiatan ID format',
        });
        return;
      }

      const userId = req.user!.id;

      // ✅ Update bisa mengubah is_active untuk soft delete
      const kegiatan = await kegiatanService.updateKegiatan(
        id, // Gunakan ID string (UUID)
        req.body, // bisa include is_active: false untuk soft delete
        userId
      );

      if (!kegiatan) {
        res.status(404).json({
          status: 'error',
          message: 'Kegiatan not found',
        });
        return;
      }

      console.log('✅ Kegiatan updated:', kegiatan);

      res.status(200).json({
        status: 'success',
        data: kegiatan,
        message: req.body.is_active === false
          ? 'Kegiatan deactivated successfully'
          : 'Kegiatan updated successfully',
      });
    } catch (error) {
      console.error('❌ Error in update:', error);

      if (error instanceof Error && error.message.includes('not authorized')) {
        res.status(403).json({
          status: 'error',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        status: 'error',
        message: 'Failed to update kegiatan',
      });
    }
  }
}