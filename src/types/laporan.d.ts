export interface CreateLaporanDTO {
  id: string;
  nama_proyek: string;
  deskripsi_singkat?: string;
  lokasi: string;
  is_active?: boolean;
  deskripsi_detail: string;
  tanggal_mulai: Date;
  tanggal_selesai: Date;
  client: string;
  pelayanan: string;
  industri: string;
  photos: PhotoData[];
}

export interface UpdateLaporanDTO {
  // Semua opsional karena sifatnya partial update
  nama_proyek?: string;
  is_active?: boolean;
  deskripsi_singkat?: string;

  deskripsi_detail?: string;
  tanggal_mulai?: Date;
  tanggal_selesai?: Date;
  lokasi?: string;
  client?: string;
  pelayanan?: string;
  industri?: string;

  photos?: PhotoData[];
  removed_photos?: string[];
}

export interface PhotoData {
  photo_name: string;
  url: string;
  // optional biar gak bentrok saat service bikin record
  id?: string;
  id_laporan?: string;
}
