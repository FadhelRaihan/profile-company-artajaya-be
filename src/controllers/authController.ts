import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔥 POST /api/auth/register - Registering user...');
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({
          status: 'error',
          message: 'Name, email, and password are required',
        });
        return;
      }

      const result = await authService.register({ name, email, password });

      console.log('✅ User registered successfully');
      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      console.error('❌ Error in register:', error);
      
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({
          status: 'error',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        status: 'error',
        message: 'Registration failed',
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔥 POST /api/auth/login - Logging in...');
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          status: 'error',
          message: 'Email and password are required',
        });
        return;
      }

      const result = await authService.login({ email, password });

      console.log('✅ Login successful');
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      console.error('❌ Error in login:', error);

      if (error instanceof Error && error.message === 'Invalid credentials') {
        res.status(401).json({
          status: 'error',
          message: 'Invalid email or password',
        });
        return;
      }

      res.status(500).json({
        status: 'error',
        message: 'Login failed',
      });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔥 GET /api/auth/profile - Getting profile...');
      const userId = req.user!.id;

      const user = await authService.getUserById(String(userId));

      if (!user) {
        res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
        return;
      }

      console.log('✅ Profile retrieved');
      res.status(200).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      console.error('❌ Error in getProfile:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get profile',
      });
    }
  }
}