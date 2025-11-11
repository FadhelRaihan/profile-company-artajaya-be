import { Request, Response } from 'express';
import { TestimoniService } from '../services/testimoniService';
import { v4 as uuidv4 } from 'uuid';

const testimoniService = new TestimoniService();

export class TestimoniController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔥 GET /api/testimoni - Fetching testimoni...');

      // ✅ Query parameter untuk filter active/inactive
      const showAll = req.query.show_all === 'true';
      const testimoni = await testimoniService.getAllTestimoni(!showAll);

      console.log('✅ Successfully fetched testimoni:', testimoni.length);

      res.status(200).json({
        status: 'success',
        data: testimoni,
      });
    } catch (error) {
      console.error('❌ Error in getAll:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch testimoni',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      console.log(`🔥 GET /api/testimoni/${id}`);

      // Validasi dasar apakah ID adalah UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid testimoni ID format',
        });
        return;
      }

      const testimoni = await testimoniService.getTestimoniById(id); // Pastikan service menerima string

      if (!testimoni) {
        res.status(404).json({
          status: 'error',
          message: 'Testimoni not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: testimoni,
      });
    } catch (error) {
      console.error('❌ Error in getById:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch testimoni',
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔥 POST /api/testimoni - Creating testimoni...');
      console.log('Request body:', req.body);
      console.log('User:', req.user);

      const { nama_tester, testimoni, is_active } = req.body;

      if (!nama_tester || !testimoni) {
        res.status(400).json({
          status: 'error',
          message: 'nama_tester and testimoni are required',
        });
        return;
      }

      const userId = String(req.user!.id);

      // ✅ Generate UUID
      const uuid = uuidv4();

      // ✅ Siapkan data dengan UUID
      const testimoniData = {
        id: uuid, // Tambahkan UUID ke data
        nama_tester,
        testimoni,
        is_active, // ✅ Bisa set active/inactive saat create
      };

      const createdTestimoni = await testimoniService.createTestimoni(
        testimoniData, // Kirim data yang sudah berisi UUID
        userId
      );

      console.log('✅ Testimoni created:', createdTestimoni);

      res.status(201).json({
        status: 'success',
        data: createdTestimoni,
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
      // Karena ID sekarang UUID (string), parseInt tidak cocok
      // Gunakan req.params.id langsung, tetapi validasi jika perlu
      const id = req.params.id;
      console.log(`🔥 PUT /api/testimoni/${id} - Updating...`);
      console.log('Request body:', req.body);

      // Validasi dasar apakah ID adalah UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid testimoni ID format',
        });
        return;
      }

      const userId = String(req.user!.id);

      // ✅ Update bisa mengubah is_active untuk soft delete
      const testimoni = await testimoniService.updateTestimoni(
        id, // Gunakan ID string (UUID)
        req.body, // bisa include is_active: false untuk soft delete
        userId
      );

      if (!testimoni) {
        res.status(404).json({
          status: 'error',
          message: 'Testimoni not found',
        });
        return;
      }

      console.log('✅ Testimoni updated:', testimoni);

      res.status(200).json({
        status: 'success',
        data: testimoni,
        message: req.body.is_active === false
          ? 'Testimoni deactivated successfully'
          : 'Testimoni updated successfully',
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
        message: 'Failed to update testimoni',
      });
    }
  }
}