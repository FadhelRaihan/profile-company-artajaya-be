import { AppDataSource } from "../config/data-source";
import { Laporan } from "../entities/Laporan";
import { DetailLaporan } from "../entities/DetailLaporan";
import { PhotoLaporan } from "../entities/PhotoLaporan";
import {
  CreateLaporanDTO,
  UpdateLaporanDTO,
  PhotoData,
} from "../types/laporan";
import { In } from "typeorm";
import { deleteFile } from "../config/uploadConfig";

/**
 * Helper untuk membuat deskripsi singkat dari deskripsi detail.
 * Potong maksimal 225 karakter, rapikan spasi, dan tambahkan "…" bila terpotong.
 */
function makeDeskripsiSingkat(source?: string, maxLen = 225): string {
  const s = (source ?? "").replace(/\s+/g, " ").trim();
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 1).trimEnd() + "…";
}

export class LaporanService {
  private get laporanRepository() {
    return AppDataSource.getRepository(Laporan);
  }

  private get detailRepository() {
    return AppDataSource.getRepository(DetailLaporan);
  }

  private get photoRepository() {
    return AppDataSource.getRepository(PhotoLaporan);
  }

  /** ✅ Get ALL (default hanya yang aktif) */
  async getAllLaporan(isActiveOnly: boolean = true): Promise<
    Array<Laporan & { detail?: DetailLaporan | null }>
  > {
    const where = isActiveOnly ? { is_active: true } : {};
    const list = await this.laporanRepository.find({
      where,
      order: { id: "DESC" },
      relations: ["createdByUser", "photos"], // photos sudah ada relasi di entity
    });

    // Ambil detail (diasumsikan satu detail per laporan; kalau multi, ubah ke array)
    const ids = list.map((l) => l.id!).filter(Boolean);
    const details = await this.detailRepository.find({
      where: { id_laporan: In(ids) },
    });
    const detailMap = new Map(details.map((d) => [d.id_laporan!, d]));

    return list.map((l) => ({
      ...l,
      detail: detailMap.get(l.id!) ?? null,
    }));
  }

  /** ✅ Get by ID (bisa fetch yang inactive juga) */
  async getLaporanById(
    id: string,
    isActiveOnly: boolean = true
  ): Promise<(Laporan & { detail?: DetailLaporan | null }) | null> {
    const where = isActiveOnly ? { id, is_active: true } : { id };
    const laporan = await this.laporanRepository.findOne({
      where,
      relations: ["createdByUser", "photos"],
    });
    if (!laporan) return null;

    const detail = await this.detailRepository.findOne({
      where: { id_laporan: id },
    });

    return { ...laporan, detail: detail ?? null };
  }

  /**
   * ✅ Create: gabungkan pembuatan Laporan + Detail + Photo
   * - deskripsi_singkat otomatis diambil dari deskripsi_detail (dipotong 225 char)
   * - photos dibuat jika ada
   */
  async createLaporan(data: CreateLaporanDTO, userId: string): Promise<Laporan & { detail?: DetailLaporan | null }> {
    console.log("Service: Creating Laporan with data:", data);
    console.log("Service: Created by user ID:", userId);
    return AppDataSource.transaction(async (trx) => {
      const laporanRepo = trx.getRepository(Laporan);
      const detailRepo = trx.getRepository(DetailLaporan);
      const photoRepo = trx.getRepository(PhotoLaporan);

      // Buat entitas Laporan
      const deskripsi_singkat =
        (data.deskripsi_singkat?.trim()?.slice(0, 225)) ??
        makeDeskripsiSingkat(data.deskripsi_detail);

      const newLaporan = laporanRepo.create({
        id: data.id,
        nama_proyek: data.nama_proyek,
        deskripsi_singkat,
        is_active: data.is_active ?? true,
        created_by: userId,
      });

      // simpan laporan dulu agar punya id
      const savedLaporan = await laporanRepo.save(newLaporan);

      // Buat detail (wajib diisi sesuai permintaanmu)
      const newDetail = detailRepo.create({
        id_laporan: savedLaporan.id,
        deskripsi_detail: data.deskripsi_detail,
        tanggal_mulai: data.tanggal_mulai, // tipe timestamp di DB agar punya waktu; kalau mau date saja, ganti tipe kolom
        tanggal_selesai: data.tanggal_selesai,
        lokasi: data.lokasi,
        client: data.client,
        pelayanan: data.pelayanan,
        industri: data.industri,
      });
      const savedDetail = await detailRepo.save(newDetail);

      // Foto (opsional)
      if (data.photos && data.photos.length > 0) {
        const photos = data.photos.map((p: PhotoData) =>
          photoRepo.create({
            ...p,
            id_laporan: savedLaporan.id,
          })
        );
        const savedPhotos = await photoRepo.save(photos);
        savedLaporan.photos = savedPhotos;
      } else {
        savedLaporan.photos = [];
      }

      return { ...savedLaporan, detail: savedDetail };
    });
  }

  /**
   * ✅ Update:
   * - Bisa update Laporan (nama_proyek, is_active)
   * - Bisa update Detail (deskripsi_detail, tanggal_mulai/selesai, lokasi, client, pelayanan, industri)
   * - Bisa tambah foto baru & hapus foto lama (removed_photos)
   * - deskripsi_singkat akan ikut disesuaikan jika deskripsi_detail berubah
   */
  async updateLaporan(
    id: string,
    data: UpdateLaporanDTO,
    userId: string
  ): Promise<Laporan & { detail?: DetailLaporan | null }> {
    return AppDataSource.transaction(async (trx) => {
      const laporanRepo = trx.getRepository(Laporan);
      const detailRepo = trx.getRepository(DetailLaporan);
      const photoRepo = trx.getRepository(PhotoLaporan);

      const existing = await laporanRepo.findOne({
        where: { id },
        relations: ["photos"],
      });
      if (!existing) {
        throw new Error(`Laporan dengan ID ${id} tidak ditemukan.`);
      }

      // --- Update text fields Laporan ---
      if (typeof data.nama_proyek !== "undefined")
        existing.nama_proyek = data.nama_proyek;
      if (typeof data.is_active !== "undefined")
        existing.is_active = data.is_active;

      // --- Update Detail (upsert: kalau belum ada, buat) ---
      let detail = await detailRepo.findOne({ where: { id_laporan: id } });
      const detailChanged =
        typeof data.deskripsi_detail !== "undefined" ||
        typeof data.tanggal_mulai !== "undefined" ||
        typeof data.tanggal_selesai !== "undefined" ||
        typeof data.lokasi !== "undefined" ||
        typeof data.client !== "undefined" ||
        typeof data.pelayanan !== "undefined" ||
        typeof data.industri !== "undefined";

      if (detailChanged) {
        if (!detail) {
          detail = detailRepo.create({ id_laporan: id });
        }
        if (typeof data.deskripsi_detail !== "undefined") {
          detail.deskripsi_detail = data.deskripsi_detail;
          // sinkronkan deskripsi_singkat
          existing.deskripsi_singkat = makeDeskripsiSingkat(
            data.deskripsi_detail
          );
        }
        if (typeof data.tanggal_mulai !== "undefined")
          detail.tanggal_mulai = data.tanggal_mulai as any;
        if (typeof data.tanggal_selesai !== "undefined")
          detail.tanggal_selesai = data.tanggal_selesai as any;
        if (typeof data.lokasi !== "undefined") detail.lokasi = data.lokasi;
        if (typeof data.client !== "undefined") detail.client = data.client;
        if (typeof data.pelayanan !== "undefined")
          detail.pelayanan = data.pelayanan;
        if (typeof data.industri !== "undefined")
          detail.industri = data.industri;

        await detailRepo.save(detail);
      }

      // --- Hapus foto lama bila diminta ---
      if (data.removed_photos && data.removed_photos.length > 0) {
        const photosToDelete = await photoRepo.find({
          where: { id: In(data.removed_photos), id_laporan: id },
        });

        // hapus file fisik
        for (const p of photosToDelete) {
          if (p.photo_name) deleteFile(p.photo_name);
        }
        // hapus record DB
        await photoRepo.delete({ id: In(data.removed_photos) });
        // sinkronkan di memori
        if (existing.photos) {
          existing.photos = existing.photos.filter(
            (p) => !data.removed_photos!.includes(p.id as string)
          );
        }
      }

      // --- Tambah foto baru ---
      if (data.photos && data.photos.length > 0) {
        const newPhotos = data.photos.map((p: PhotoData) =>
          photoRepo.create({ ...p, id_laporan: id })
        );
        const savedNewPhotos = await photoRepo.save(newPhotos);
        if (!existing.photos) existing.photos = [];
        existing.photos.push(...savedNewPhotos);
      }

      const savedLaporan = await laporanRepo.save(existing);

      // Ambil detail terkini untuk return
      const currentDetail =
        detail ??
        (await detailRepo.findOne({
          where: { id_laporan: id },
        }));

      return { ...savedLaporan, detail: currentDetail ?? null };
    });
  }
}
