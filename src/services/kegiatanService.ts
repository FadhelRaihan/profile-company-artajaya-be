import { AppDataSource } from "../config/data-source";
import { Kegiatan } from "../entities/Kegiatan";
import { PhotoKegiatan } from "../entities/PhotoKegiatan";
import {
  CreateKegiatanDTO,
  UpdateKegiatanDTO,
  PhotoData,
} from "../types/kegiatan";
import { deleteFile } from "../config/uploadConfig";
import { In } from "typeorm";

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

    const existingKegiatan = await this.kegiatanRepository.findOneBy({ id });

    if (!existingKegiatan) {
      throw new Error(`Kegiatan dengan ID ${id} tidak ditemukan.`);
    }

    try {
      // 1. Logika Hapus Foto Lama (jika diminta)
      if (data.removed_photos && data.removed_photos.length > 0) {
        console.log(`Service: Deleting photos:`, data.removed_photos);

        // Ambil data foto yang akan dihapus (untuk dapat nama filenya)
        const photosToDelete = await this.photoKegiatanRepository.find({
          where: {
            id: In(data.removed_photos), // Gunakan 'In' untuk array ID
            id_kegiatan: id, // Pastikan foto milik kegiatan ini
          },
        });

        // Hapus file dari storage
        for (const photo of photosToDelete) {
          if (photo.photo_name) {
            deleteFile(photo.photo_name); // Hapus fisik file
          }
        }

        // Hapus record dari database
        await this.photoKegiatanRepository.delete({
          id: In(data.removed_photos),
        });
      }

      // 2. Update data Kegiatan (teks, tanggal, dll)
      const { photos: newPhotosData, removed_photos, ...kegiatanData } = data;
      Object.assign(existingKegiatan, kegiatanData);

      // 3. Logika Tambah Foto Baru (jika ada)
      if (newPhotosData && newPhotosData.length > 0) {
        console.log(`Service: Adding ${newPhotosData.length} new photos`);

        const newPhotos = newPhotosData.map((photoData: PhotoData) =>
          this.photoKegiatanRepository.create({ ...photoData, id_kegiatan: id })
        );

        // Jika belum ada array photos, buat dulu
        if (!existingKegiatan.photos) {
          existingKegiatan.photos = [];
        }

        // Tambahkan foto baru ke relasi
        existingKegiatan.photos.push(...newPhotos);
      }

      // 4. Simpan semua perubahan
      return this.kegiatanRepository.save(existingKegiatan);
    } catch (error) {
      console.error("Service: Error update kegiatan:", error);
      throw error;
    }
  }
}
