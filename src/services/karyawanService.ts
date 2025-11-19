import { AppDataSource } from "../config/data-source";
import { Karyawan } from "../entities/Karyawan";
import {
  CreateKaryawanDTO,
  UpdateKaryawanDTO,
} from "../types/karyawan";
import { deleteFileKaryawan } from "../config/uploadConfig";
import path from "path";

export class KaryawanService {
  private get karyawanRepository() {
    return AppDataSource.getRepository(Karyawan);
  }

  // ✅ Get ALL (termasuk yang inactive) - bisa filter dari controller
  async getAllKaryawan(isActiveOnly: boolean = true): Promise<Karyawan[]> {
    console.log(
      `Service: Fetching ${isActiveOnly ? "active" : "all"} karyawan...`
    );

    const whereCondition = isActiveOnly ? { is_active: true } : {};

    const karyawan = await this.karyawanRepository.find({
      where: whereCondition,
      order: { id: "DESC" },
      relations: ["jabatan"], // Sesuaikan dengan relasi yang ada di entity Karyawan
    });

    console.log(`Service: Found ${karyawan.length} karyawan`);
    return karyawan;
  }

  // ✅ Get inactive karyawan only
  async getAllInactiveKaryawan(): Promise<Karyawan[]> {
    console.log("Service: Fetching inactive karyawan only...");

    const karyawan = await this.karyawanRepository.find({
      where: { is_active: false },
      order: { id: "DESC" },
      relations: ["jabatan"],
    });

    console.log(`Service: Found ${karyawan.length} inactive karyawan`);
    return karyawan;
  }

  // ✅ Get active karyawan only
  async getAllActiveKaryawan(): Promise<Karyawan[]> {
    console.log("Service: Fetching active karyawan only...");

    const karyawan = await this.karyawanRepository.find({
      where: { is_active: true },
      order: { id: "DESC" },
      relations: ["jabatan"],
    });

    console.log(`Service: Found ${karyawan.length} active karyawan`);
    return karyawan;
  }

  // ✅ Get by ID (bisa ambil yang inactive juga untuk update)
  async getKaryawanById(
    id: string,
    isActiveOnly: boolean = true
  ): Promise<Karyawan | null> {
    console.log(`Service: Fetching karyawan with ID ${id}...`);

    const whereCondition = isActiveOnly ? { id, is_active: true } : { id };

    const karyawan = await this.karyawanRepository.findOne({
      where: whereCondition,
      relations: ["jabatan"],
    });

    return karyawan;
  }

  // ✅ Create karyawan
  async createKaryawan(
    data: CreateKaryawanDTO,
    userId: number
  ): Promise<Karyawan> {
    console.log("Service: Creating karyawan with data:", data);
    console.log("Service: Created by user ID:", userId);

    try {
      const newKaryawan = this.karyawanRepository.create({
        // id: data.id,
        // nama_karyawan: data.nama_karyawan,
        // no_telepon: data.no_telepon,
        // email: data.email,
        // tanggal_masuk: data.tanggal_masuk,
        // id_jabatan: data.id_jabatan,
        // photo_url: data.photo_url,
        // is_active: data.is_active ?? true, // Default true jika tidak diisi
        ...data,
      });

      const savedKaryawan = await this.karyawanRepository.save(newKaryawan);
      console.log(`✅ Service: Karyawan created with ID ${savedKaryawan.id}`);

      return savedKaryawan;
    } catch (error) {
      console.error("Service: Error creating karyawan:", error);
      throw error;
    }
  }

  // ✅ Update karyawan (bisa mengubah is_active untuk soft delete)
  async updateKaryawan(
    id: string,
    data: UpdateKaryawanDTO
  ): Promise<Karyawan | null> {
    console.log(`Service: Updating karyawan ${id} with data:`, data);

    // Ambil karyawan existing
    const existingKaryawan = await this.karyawanRepository.findOne({
      where: { id },
      relations: ["jabatan"],
    });

    if (!existingKaryawan) {
      throw new Error(`Karyawan dengan ID ${id} tidak ditemukan.`);
    }

    try {
      // Simpan photo_url lama untuk dihapus jika ada perubahan
      const oldPhotoUrl = existingKaryawan.photo_url;

      // Update data karyawan
      if (data.nama_karyawan)
        existingKaryawan.nama_karyawan = data.nama_karyawan;
      if (data.no_telepon) existingKaryawan.no_telepon = data.no_telepon;
      if (data.email) existingKaryawan.email = data.email;
      if (data.tanggal_masuk)
        existingKaryawan.tanggal_masuk = data.tanggal_masuk;
      if (data.id_jabatan) existingKaryawan.id_jabatan = data.id_jabatan;
      if (data.is_active !== undefined)
        existingKaryawan.is_active = data.is_active;

      // ✅ Handle photo update
      if (data.photo_url !== undefined) {
        // Jika ada foto baru dan berbeda dari foto lama
        if (data.photo_url && data.photo_url !== oldPhotoUrl) {
          console.log(`Service: Updating photo from ${oldPhotoUrl} to ${data.photo_url}`);
          
          // Hapus foto lama jika ada
          if (oldPhotoUrl) {
            try {
              // Extract filename dari URL (misal: /uploads/karyawan/photo-123.jpg -> photo-123.jpg)
              const oldFilename = path.basename(oldPhotoUrl);
              deleteFileKaryawan(oldFilename);
              console.log(`Service: Old photo deleted: ${oldFilename}`);
            } catch (error) {
              console.error(`Service: Error deleting old photo:`, error);
              // Lanjutkan meski gagal hapus foto lama
            }
          }
          
          existingKaryawan.photo_url = data.photo_url;
        } 
        // Jika photo_url di-set null/empty (hapus foto)
        else if (!data.photo_url && oldPhotoUrl) {
          console.log(`Service: Removing photo: ${oldPhotoUrl}`);
          
          try {
            const oldFilename = path.basename(oldPhotoUrl);
            deleteFileKaryawan(oldFilename);
            console.log(`Service: Photo deleted successfully`);
          } catch (error) {
            console.error(`Service: Error deleting photo:`, error);
          }
          
          existingKaryawan.photo_url = "";
        }
      }

      // Save karyawan
      const savedKaryawan = await this.karyawanRepository.save(
        existingKaryawan
      );
      console.log(`✅ Service: Karyawan ${id} updated successfully`);

      // Fetch ulang dengan relasi lengkap
      return await this.karyawanRepository.findOne({
        where: { id },
        relations: ["jabatan"],
      });
    } catch (error) {
      console.error("Service: Error update karyawan:", error);
      throw error;
    }
  }

  // ✅ Delete karyawan (hard delete) - optional
  async deleteKaryawan(id: string): Promise<boolean> {
    console.log(`Service: Deleting karyawan with ID ${id}...`);

    const karyawan = await this.karyawanRepository.findOne({
      where: { id },
    });

    if (!karyawan) {
      throw new Error(`Karyawan dengan ID ${id} tidak ditemukan.`);
    }

    try {
      // Hapus foto jika ada
      if (karyawan.photo_url) {
        try {
          const filename = path.basename(karyawan.photo_url);
          deleteFileKaryawan(filename);
          console.log(`Service: Photo deleted: ${filename}`);
        } catch (error) {
          console.error(`Service: Error deleting photo:`, error);
          // Lanjutkan menghapus data meski foto gagal dihapus
        }
      }

      // Hapus dari database
      await this.karyawanRepository.remove(karyawan);
      console.log(`✅ Service: Karyawan ${id} deleted successfully`);

      return true;
    } catch (error) {
      console.error("Service: Error deleting karyawan:", error);
      throw error;
    }
  }

  // ✅ Soft delete karyawan (set is_active = false)
  async softDeleteKaryawan(id: string): Promise<Karyawan | null> {
    console.log(`Service: Soft deleting karyawan with ID ${id}...`);

    return await this.updateKaryawan(id, { is_active: false });
  }

  // ✅ Restore karyawan (set is_active = true)
  async restoreKaryawan(id: string): Promise<Karyawan | null> {
    console.log(`Service: Restoring karyawan with ID ${id}...`);

    // Ambil karyawan termasuk yang inactive
    const karyawan = await this.getKaryawanById(id, false);

    if (!karyawan) {
      throw new Error(`Karyawan dengan ID ${id} tidak ditemukan.`);
    }

    return await this.updateKaryawan(id, { is_active: true });
  }
}