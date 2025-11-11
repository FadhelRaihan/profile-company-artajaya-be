// src/services/testimoniService.ts
import { AppDataSource } from '../config/data-source';
import { Testimoni } from '../entities/Testimoni';
import { CreateTestimoniDTO, UpdateTestimoniDTO } from '../types/testimoni';

export class TestimoniService {
  private get testimoniRepository() {
    return AppDataSource.getRepository(Testimoni);
  }

  // ✅ Get ALL (termasuk yang inactive) - bisa filter dari controller
  async getAllTestimoni(isActiveOnly: boolean = true): Promise<Testimoni[]> {
    console.log(`Service: Fetching ${isActiveOnly ? 'active' : 'all'} testimoni...`);

    const whereCondition = isActiveOnly ? { is_active: true } : {};

    const testimoni = await this.testimoniRepository.find({
      where: whereCondition,
      order: { id: 'DESC' }, 
      relations: ['createdByUser'],
    });

    console.log(`Service: Found ${testimoni.length} testimoni`);
    return testimoni;
  }

  // ✅ Get by ID (bisa ambil yang inactive juga untuk update)
  async getTestimoniById(id: string, isActiveOnly: boolean = true): Promise<Testimoni | null> {
    console.log(`Service: Fetching testimoni with ID ${id}...`);

    const whereCondition = isActiveOnly ? { id, is_active: true } : { id }; 

    const testimoni = await this.testimoniRepository.findOne({
      where: whereCondition,
      relations: ['createdByUser'],
    });

    return testimoni;
  }

  async createTestimoni(
    data: CreateTestimoniDTO, 
    userId: string
  ): Promise<Testimoni> {
    console.log('Service: Creating testimoni with data:', data);
    console.log('Service: Created by user ID:', userId);

    try {
      const testimoni = this.testimoniRepository.create({
        ...data, 
        created_by: userId,
      });

      console.log('Service: Testimoni entity created:', testimoni);

      const savedTestimoni = await this.testimoniRepository.save(testimoni);
      console.log('Service: Testimoni saved:', savedTestimoni);

      return savedTestimoni;
    } catch (error) {
      console.error('Service: Error creating testimoni:', error);
      throw error;
    }
  }

  // ✅ Update bisa mengubah is_active untuk soft delete
  async updateTestimoni(
    id: string, 
    data: UpdateTestimoniDTO,
    userId: string
  ): Promise<Testimoni | null> {
    console.log(`Service: Updating testimoni ${id} with data:`, data);

    // Ambil testimoni tanpa filter is_active (bisa update yang sudah inactive)
    const testimoni = await this.testimoniRepository.findOne({
      where: { id }, 
    });

    if (!testimoni) {
      console.log('Service: Testimoni not found');
      return null;
    }

    // ✅ Opsional: Cek apakah user adalah pemilik
    if (testimoni.created_by !== userId) {
      throw new Error('You are not authorized to update this testimoni');
    }

    // ✅ Update termasuk is_active (untuk soft delete)
    Object.assign(testimoni, data);

    const updatedTestimoni = await this.testimoniRepository.save(testimoni);
    console.log('Service: Testimoni updated:', updatedTestimoni);

    return updatedTestimoni;
  }
}