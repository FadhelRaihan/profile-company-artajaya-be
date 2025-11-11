import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../entities/User'; // IMPORT ENTITY LANGSUNG
import { Testimoni } from '../entities/Testimoni';
import { Kegiatan } from '../entities/Kegiatan'; // DAN INI JUGA!
import { PhotoKegiatan } from '../entities/PhotoKegiatan'; // DAN INI JUGA!

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Testimoni, Kegiatan, PhotoKegiatan], // ⬅️ PENTING: Array dengan import langsung, bukan string path
  migrations: [__dirname + '/../migrations/**/*.{ts,js}'],
});