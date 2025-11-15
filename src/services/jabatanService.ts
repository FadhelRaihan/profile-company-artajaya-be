import { AppDataSource } from "../config/data-source";
import { Jabatan } from "../entities/Jabatan";
import {
  CreateJabatanDTO,
  UpdateJabatanDTO,
} from "../types/jabatan";
import { In } from "typeorm";

export class JabatanService {
  private get jabatanRepository() {
    return AppDataSource.getRepository(Jabatan);
  }

  // ✅ Get ALL (termasuk yang inactive) - bisa filter dari controller
  async getAllJabatan(isActiveOnly: boolean = true): Promise<Jabatan[]> {
    console.log(
      `Service: Fetching ${isActiveOnly ? "active" : "all"} jabatan...`
    );

    const whereCondition = isActiveOnly ? { is_active: true } : {};

    const jabatan = await this.jabatanRepository.find({
      where: whereCondition,
      order: { id: "DESC" },
      relations: ["createdByUser"],
    });

    console.log(`Service: Found ${jabatan.length} jabatan`);
    return jabatan;
  }

  async getAllInactiveJabatan(): Promise<Jabatan[]> {
    console.log("Service: Fetching inactive jabatan only...");

    const jabatan = await this.jabatanRepository.find({
      where: { is_active: false }, // ✅ Filter hanya yang inactive
      order: { id: "DESC" },
      relations: ["createdByUser"],
    });

    console.log(`Service: Found ${jabatan.length} inactive jabatan`);
    return jabatan;
  }

  // ✅ Method existing untuk ambil active (optional, untuk konsistensi)
  async getAllActiveJabatan(): Promise<Jabatan[]> {
    console.log("Service: Fetching active jabatan only...");

    const jabatan = await this.jabatanRepository.find({
      where: { is_active: true }, // ✅ Filter hanya yang active
      order: { id: "DESC" },
      relations: ["createdByUser"],
    });

    console.log(`Service: Found ${jabatan.length} active jabatan`);
    return jabatan;
  }

  // ✅ Get by ID (bisa ambil yang inactive juga untuk update)
  async getJabatanById(
    id: string,
    isActiveOnly: boolean = true
  ): Promise<Jabatan | null> {
    console.log(`Service: Fetching jabatan with ID ${id}...`);

    const whereCondition = isActiveOnly ? { id, is_active: true } : { id };

    const jabatan = await this.jabatanRepository.findOne({
      where: whereCondition,
      relations: ["createdByUser"],
    });

    return jabatan;
  }

  async createJabatan(
    data: CreateJabatanDTO,
    userId: number
  ): Promise<Jabatan> {
    console.log("Service: Creating jabatan with data:", data);
    console.log("Service: Created by user ID:", userId);

    try {
      const newJabatan = this.jabatanRepository.create({
        ...data,
      });

      return this.jabatanRepository.save(newJabatan);
    } catch (error) {
      console.error("Service: Error creating jabatan:", error);
      throw error;
    }
  }

  // ✅ Update bisa mengubah is_active untuk soft delete
  async updateJabatan(
    id: string,
    data: UpdateJabatanDTO,
    userId: number
  ): Promise<Jabatan | null> {
    console.log(`Service: Updating jabatan ${id} with data:`, data);

    // Ambil jabatan existing
    const existingJabatan = await this.jabatanRepository.findOne({
      where: { id },
    });

    if (!existingJabatan) {
      throw new Error(`Jabatan dengan ID ${id} tidak ditemukan.`);
    }

    try {
      // 1. Update data teks jabatan
      if (data.nama_jabatan)
        existingJabatan.nama_jabatan = data.nama_jabatan;
      if (data.urutan)
        existingJabatan.urutan = data.urutan;
      if (data.is_active !== undefined)
        existingJabatan.is_active = data.is_active;

      // 2. Save jabatan
      const savedJabatan = await this.jabatanRepository.save(
        existingJabatan
      );
      console.log(`✅ Service: Jabatan ${id} updated successfully`);

      // 3. Fetch ulang dengan relasi lengkap
      return await this.jabatanRepository.findOne({
        where: { id },
        relations: ["createdByUser"],
      });
    } catch (error) {
      console.error("Service: Error update jabatan:", error);
      throw error;
    }
  }
}
