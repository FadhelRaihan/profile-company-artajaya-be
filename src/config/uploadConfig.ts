import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// 📁 Setup storage path
const uploadDir = path.join(__dirname, '../uploads/kegiatan');

// Pastikan folder uploads ada
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 🔧 Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

// 🎯 File Filter - Hanya terima image
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed'));
  }
};

// ⚙️ Multer Configuration
export const uploadKegiatan = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // Max 3MB per file
    files: 10 // Max 10 files
  }
});

// 🗑️ Helper: Delete file from storage
export const deleteFile = (filename: string): void => {
  const filePath = path.join(uploadDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`🗑️ Deleted file: ${filename}`);
  }
};