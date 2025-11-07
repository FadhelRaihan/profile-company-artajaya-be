import { Request, Response } from 'express';
import { UserService } from '../services/userService';

const userService = new UserService();

export class UserController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      console.log('📥 GET /api/users - Fetching all users...');
      const users = await userService.getAllUsers();
      console.log('✅ Successfully fetched users:', users.length);
      
      res.status(200).json({
        status: 'success',
        data: users,
      });
    } catch (error) {
      console.error('❌ Error in getAll:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch users',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      console.log(`📥 GET /api/users/${id} - Fetching user...`);
      
      if (isNaN(id)) {
        console.log('⚠️ Invalid ID format');
        res.status(400).json({
          status: 'error',
          message: 'Invalid user ID',
        });
        return;
      }

      const user = await userService.getUserById(id);
      
      if (!user) {
        console.log('⚠️ User not found');
        res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
        return;
      }

      console.log('✅ User found:', user);
      res.status(200).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      console.error('❌ Error in getById:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch user',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      console.log('📥 POST /api/users - Creating user...');
      console.log('Request body:', req.body);
      
      const { name, email } = req.body;

      if (!name || !email) {
        console.log('⚠️ Validation failed: missing name or email');
        res.status(400).json({
          status: 'error',
          message: 'Name and email are required',
        });
        return;
      }

      console.log('Calling userService.createUser...');
      const user = await userService.createUser(req.body);
      console.log('✅ User created successfully:', user);
      
      res.status(201).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      console.error('❌ Full error object:', error);
      console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown');
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
      
      if (error instanceof Error && error.message.includes('duplicate')) {
        res.status(409).json({
          status: 'error',
          message: 'Email already exists',
        });
        return;
      }

      res.status(500).json({
        status: 'error',
        message: 'Failed to create user',
        error: process.env.NODE_ENV === 'development' ? {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        } : {},
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      console.log(`📥 PUT /api/users/${id} - Updating user...`);
      console.log('Request body:', req.body);
      
      const user = await userService.updateUser(id, req.body);

      if (!user) {
        console.log('⚠️ User not found');
        res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
        return;
      }

      console.log('✅ User updated:', user);
      res.status(200).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      console.error('❌ Error in update:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update user',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      console.log(`📥 DELETE /api/users/${id} - Deleting user...`);
      
      const deleted = await userService.deleteUser(id);

      if (!deleted) {
        console.log('⚠️ User not found');
        res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
        return;
      }

      console.log('✅ User deleted successfully');
      res.status(200).json({
        status: 'success',
        message: 'User deleted successfully',
      });
    } catch (error) {
      console.error('❌ Error in delete:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete user',
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    }
  }
}