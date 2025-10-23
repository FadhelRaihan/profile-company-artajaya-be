import { User, CreateUserDto } from '../types/user';

// Dummy data untuk testing
let users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

export const getAllUsers = (): User[] => {
  return users;
};

export const getUserById = (id: number): User | undefined => {
  return users.find(user => user.id === id);
};

export const createUser = (userData: CreateUserDto): User => {
  const newUser: User = {
    id: users.length + 1,
    ...userData
  };
  users.push(newUser);
  return newUser;
};

export const deleteUser = (id: number): boolean => {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    users.splice(index, 1);
    return true;
  }
  return false;
};