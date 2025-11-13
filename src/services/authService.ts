// src/services/authService.ts
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from "uuid";

interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

export class AuthService {
  private get userRepository() {
    return AppDataSource.getRepository(User);
  }

  async register(data: RegisterDTO) {
    console.log('Service: Registering user...');

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      id: uuidv4(),
    });

    const savedUser = await this.userRepository.save(user);

    // Generate token
    const token = this.generateToken(savedUser);

    console.log('Service: User registered successfully');

    return {
      token,
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
      },
    };
  }

  async login(data: LoginDTO) {
    console.log('Service: Logging in user...');

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email: data.email, is_active: true },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user);

    console.log('Service: Login successful');

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id, is_active: true },
      select: ['id', 'name', 'email', 'created_at', 'updated_at'],
    });

    return user;
  }

  // ✅ FIX: generateToken method
  private generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const secret = process.env.JWT_SECRET || 'fd289bef9100fd0ad04f1891013df78a26955bd7185cda004a139df4a6f394a7f3882dd888fbf9e7e578b0aca347ff8b8c056ebd4b39ad773d9dbc5e8d652e99';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    // ✅ Casting explicit untuk menghindari error TypeScript
    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
  }
}