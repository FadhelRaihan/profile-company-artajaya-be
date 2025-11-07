import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from './src/entities/User'; // TAMBAHKAN IMPORT INI!
import { Testimoni } from './src/entities/Testimoni'; // DAN INI JUGA!

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: true,
  
  // GANTI INI
  entities: [User, Testimoni], // Import langsung entity-nya
  
  // ATAU:
  // entities: ['src/entities/**/*.{ts,js}'],
  
  migrations: ['src/migrations/**/*.{ts,js}'],
  subscribers: ['src/subscribers/**/*.{ts,js}'],
});