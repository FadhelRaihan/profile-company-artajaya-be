export interface CreateKaryawanDTO{
    id: string;
    nama_karyawan: string;
    no_telepon: string;
    email: string;
    tanggal_masuk: Date;
    id_jabatan: string;
    photo_url: string;
    is_active: boolean;
}

export interface UpdateKaryawanDTO{
    id?: string;
    nama_karyawan?: string;
    no_telepon?: string;
    email?: string;
    tanggal_masuk?: Date;
    id_jabatan?: string;
    photo_url?: string;
    is_active?: boolean;
}