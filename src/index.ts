import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 API Documentation:`);
  console.log(`   GET    /health           - Health check`);
  console.log(`   GET    /api/users        - Get all users`);
  console.log(`   GET    /api/users/:id    - Get user by ID`);
  console.log(`   POST   /api/users        - Create new user`);
  console.log(`   DELETE /api/users/:id    - Delete user`);
});