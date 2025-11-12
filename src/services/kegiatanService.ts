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

  async getAllInactiveKegiatan(): Promise<Kegiatan[]> {
    console.log("Service: Fetching inactive kegiatan only...");

    const kegiatan = await this.kegiatanRepository.find({
      where: { is_active: false }, // ✅ Filter hanya yang inactive
      order: { id: "DESC" },
      relations: ["createdByUser", "photos"],
    });

    console.log(`Service: Found ${kegiatan.length} inactive kegiatan`);
    return kegiatan;
  }

  // ✅ Method existing untuk ambil active (optional, untuk konsistensi)
  async getAllActiveKegiatan(): Promise<Kegiatan[]> {
    console.log("Service: Fetching active kegiatan only...");

    const kegiatan = await this.kegiatanRepository.find({
      where: { is_active: true }, // ✅ Filter hanya yang active
      order: { id: "DESC" },
      relations: ["createdByUser", "photos"],
    });

    console.log(`Service: Found ${kegiatan.length} active kegiatan`);
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

    // Ambil kegiatan existing
    const existingKegiatan = await this.kegiatanRepository.findOne({
      where: { id },
      relations: ["photos"],
    });

    if (!existingKegiatan) {
      throw new Error(`Kegiatan dengan ID ${id} tidak ditemukan.`);
    }

    try {
      // 1. Update data teks kegiatan
      if (data.nama_kegiatan)
        existingKegiatan.nama_kegiatan = data.nama_kegiatan;
      if (data.deskripsi_singkat)
        existingKegiatan.deskripsi_singkat = data.deskripsi_singkat;
      if (data.tanggal_kegiatan)
        existingKegiatan.tanggal_kegiatan = data.tanggal_kegiatan;
      if (data.lokasi_kegiatan)
        existingKegiatan.lokasi_kegiatan = data.lokasi_kegiatan;
      if (data.is_active !== undefined)
        existingKegiatan.is_active = data.is_active;

      // 2. ✅ LOGIKA BARU: Update foto HANYA jika ada perubahan
      if (data.photos && data.photos.length > 0) {
        console.log(
          `Service: Replacing all photos. New count: ${data.photos.length}`
        );

        // Hapus SEMUA foto lama dari database (karena controller sudah handle file deletion)
        await this.photoKegiatanRepository.delete({
          kegiatan: { id: id } as any,
        });

        // Tambahkan foto baru (sudah gabungan foto lama + baru dari controller)
        existingKegiatan.photos = data.photos.map((photoData: PhotoData) =>
          this.photoKegiatanRepository.create({
            id_kegiatan: id,
            photo_name: photoData.photo_name,
            url: photoData.url,
          })
        );
      } else {
        console.log("Service: No photo changes");
        // Jika data.photos undefined/empty, TIDAK ubah foto (pertahankan yang lama)
      }

      // 3. Save kegiatan
      const savedKegiatan = await this.kegiatanRepository.save(
        existingKegiatan
      );
      console.log(`✅ Service: Kegiatan ${id} updated successfully`);

      // 4. Fetch ulang dengan relasi lengkap
      return await this.kegiatanRepository.findOne({
        where: { id },
        relations: ["createdByUser", "photos"],
      });
    } catch (error) {
      console.error("Service: Error update kegiatan:", error);
      throw error;
    }
  }
}
