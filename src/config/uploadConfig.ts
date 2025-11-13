// src/config/uploadConfig.ts
import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

// 📁 Base uploads dir
const baseUploadDir = path.join(__dirname, "../uploads");

// pastikan folder ada
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const dirs = {
  kegiatan: path.join(baseUploadDir, "kegiatan"),
  laporan: path.join(baseUploadDir, "laporan"),
};
ensureDir(baseUploadDir);
ensureDir(dirs.kegiatan);
ensureDir(dirs.laporan);

// 🔧 Factory storage per subfolder
function storageFactory(subdir: keyof typeof dirs) {
  return multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
      cb(null, dirs[subdir]);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      const nameWithoutExt = path.basename(file.originalname, ext);
      cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
    },
  });
}

// 🎯 File Filter - hanya image
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed"));
};

// ⚙️ Multer uploaders
export const uploadKegiatan = multer({
  storage: storageFactory("kegiatan"),
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024, files: 10 },
});

export const uploadLaporan = multer({
  storage: storageFactory("laporan"),
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024, files: 10 },
});

// 🗑️ Helpers delete file
export const deleteFileKegiatan = (filename: string): void => {
  const filePath = path.join(dirs.kegiatan, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`🗑️ Deleted kegiatan file: ${filename}`);
  }
};

export const deleteFileLaporan = (filename: string): void => {
  const filePath = path.join(dirs.laporan, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`🗑️ Deleted laporan file: ${filename}`);
  }
};

// 🔙 Backward-compat: alias lama (mengarah ke kegiatan)
export const deleteFile = deleteFileKegiatan;

// 🌐 Optional helper bikin URL publik
export const publicPhotoUrl = (
  type: "kegiatan" | "laporan",
  filename: string
) => `/uploads/${type}/${filename}`;
