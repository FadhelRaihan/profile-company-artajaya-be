import { AppDataSource } from "../config/data-source";
import { Kegiatan } from "../entities/Kegiatan";
import { PhotoKegiatan } from "../entities/PhotoKegiatan";
import {
  CreateKegiatanDTO,
  UpdateKegiatanDTO,
  PhotoData,
} from "../types/kegiatan";

export class KegiatanService {
  private get kegiatanRepository() {
    return AppDataSource.getRepository(Kegiatan);
  }

  private get photoKegiatanRepository() {
    return AppDataSource.getRepository(PhotoKegiatan);
  }

  // ✅ Get ALL (termasuk yang inactive) - bisa filter dari controller
  async getAllKegiatan(isActiveOnly: boolean = true): Promise<Kegiatan[]> {
    console.log(
      `Service: Fetching ${isActiveOnly ? "active" : "all"} kegiatan...`
    );

    const whereCondition = isActiveOnly ? { is_active: true } : {};

    const kegiatan = await this.kegiatanRepository.find({
      where: whereCondition,
      order: { id: "DESC" },
      relations: ["createdByUser", "photos"],
    });

    console.log(`Service: Found ${kegiatan.length} kegiatan`);
    return kegiatan;
  }

  // ✅ Get by ID (bisa ambil yang inactive juga untuk update)
  async getKegiatanById(
    id: string,
    isActiveOnly: boolean = true
  ): Promise<Kegiatan | null> {
    console.log(`Service: Fetching kegiatan with ID ${id}...`);

    const whereCondition = isActiveOnly ? { id, is_active: true } : { id };

    const kegiatan = await this.kegiatanRepository.findOne({
      where: whereCondition,
      relations: ["createdByUser", "photos"],
    });

    return kegiatan;
  }

  async createKegiatan(
    data: CreateKegiatanDTO,
    userId: number
  ): Promise<Kegiatan> {
    console.log("Service: Creating kegiatan with data:", data);
    console.log("Service: Created by user ID:", userId);

    try {
      const newKegiatan = this.kegiatanRepository.create({
        ...data,
        is_active: true, // Pastikan selalu aktif saat dibuat
      });

      // Map data foto ke entitas PhotoKegiatan
      if (data.photos && data.photos.length > 0) {
        newKegiatan.photos = data.photos.map((photoData: PhotoData) =>
          this.photoKegiatanRepository.create(photoData)
        );
      }

      return this.kegiatanRepository.save(newKegiatan);
    } catch (error) {
      console.error("Service: Error creating kegiatan:", error);
      throw error;
    }
  }

  // ✅ Update bisa mengubah is_active untuk soft delete
  async updateKegiatan(
    id: string,
    data: UpdateKegiatanDTO,
    userId: number
  ): Promise<Kegiatan | null> {
    console.log(`Service: Updating kegiatan ${id} with data:`, data);

    // Ambil kegiatan tanpa filter is_active (bisa update yang sudah inactive)
    const existingKegiatan = await this.kegiatanRepository.findOneBy({ id });

    if (!existingKegiatan) {
      throw new Error(`Kegiatan dengan ID ${id} tidak ditemukan.`);
    }

    try {
      // 1. Update data Kegiatan (termasuk is_active jika ada di DTO)
      Object.assign(existingKegiatan, data);

      // 2. Logika Update Foto: Hapus semua foto lama jika ada data foto baru, lalu tambahkan yang baru
      if (data.photos) {
        // Menghapus entri foto lama (TypeORM akan menggunakan id_kegiatan)
        await this.photoKegiatanRepository.delete({
          kegiatan: existingKegiatan,
        });

        // Tambahkan foto baru
        existingKegiatan.photos = data.photos.map((photoData: PhotoData) =>
          this.photoKegiatanRepository.create({ ...photoData, id_kegiatan: id })
        );
      }

      return this.kegiatanRepository.save(existingKegiatan);
    } catch (error) {
      console.error("Service: Error update kegiatan:", error);
      throw error;
    }
  }
}
