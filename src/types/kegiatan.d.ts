export interface CreateKegiatanDTO {
  nama_kegiatan: string;
  deskripsi_singkat: string;
  tanggal_kegiatan: Date;
  lokasi_kegiatan: string;
  is_active: boolean;
  photos: PhotoData[];
}

export interface UpdateKegiatanDTO {
  nama_kegiatan: string;
  deskripsi_singkat: string;
  tanggal_kegiatan: Date;
  lokasi_kegiatan: string;
  is_active: boolean;
  photos: PhotoData[];
  removed_photos?: string[];
}

export interface PhotoData {
  photo_name: string;
  url: string;
}
