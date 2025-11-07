import 'reflect-metadata'; // ⬅️ HARUS PALING ATAS!
import app from './app';
import { AppDataSource } from './config/data-source';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Initialize TypeORM
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');
    console.log('📦 Entities loaded:', AppDataSource.entityMetadatas.map(e => e.name)); // ⬅️ TAMBAHKAN INI untuk debug

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();