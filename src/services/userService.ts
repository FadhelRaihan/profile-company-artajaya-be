import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { CreateUserDTO, UpdateUserDTO } from '../types/user';

export class UserService {
  // ⬅️ JANGAN initialize di sini langsung
  private get userRepository() {
    return AppDataSource.getRepository(User);
  }

  async getAllUsers(): Promise<User[]> {
    console.log('Service: Fetching all users from database...');
    const users = await this.userRepository.find({
      order: { id: 'ASC' },
    });
    console.log(`Service: Found ${users.length} users`);
    return users;
  }

  async getUserById(id: number): Promise<User | null> {
    console.log(`Service: Fetching user with ID ${id}...`);
    const user = await this.userRepository.findOne({
      where: { id },
    });
    console.log('Service: User found:', user ? 'Yes' : 'No');
    return user;
  }

  async createUser(data: CreateUserDTO): Promise<User> {
    console.log('Service: Creating user with data:', data);
    
    try {
      const user = this.userRepository.create(data);
      console.log('Service: User entity created:', user);
      
      const savedUser = await this.userRepository.save(user);
      console.log('Service: User saved to database:', savedUser);
      
      return savedUser;
    } catch (error) {
      console.error('Service: Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: number, data: UpdateUserDTO): Promise<User | null> {
    console.log(`Service: Updating user ${id} with data:`, data);
    
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      console.log('Service: User not found');
      return null;
    }

    Object.assign(user, data);
    const updatedUser = await this.userRepository.save(user);
    console.log('Service: User updated:', updatedUser);
    
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    console.log(`Service: Deleting user ${id}...`);
    const result = await this.userRepository.delete(id);
    console.log('Service: Delete result:', result);
    return result.affected! > 0;
  }
}