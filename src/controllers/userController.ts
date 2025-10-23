import { Request, Response } from 'express';
import * as userService from '../services/userService';

export const getUsers = (req: Request, res: Response) => {
  try {
    const users = userService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getUser = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const user = userService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createUser = (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and email are required' 
      });
    }
    
    const newUser = userService.createUser({ name, email });
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteUser = (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = userService.deleteUser(id);
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};