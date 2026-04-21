import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll() {
    const users = await this.usersRepository.find({ relations: ['items'] });
    return users.map(user => {
      const { items, ...rest } = user;
      return {
        ...rest,
        itemCount: items ? items.filter(item => item.status === 'AVAILABLE').length : 0 // Show count of available items
      };
    });
  }

  async createFromFirebase(payload: { firebaseUid: string; email: string; firstName: string; lastName: string; department?: string }) {
    // Check if user already exists
    const existing = await this.usersRepository.findOne({ where: { firebaseUid: payload.firebaseUid } });
    if (existing) {
      return existing; // User already registered
    }

    // Create new user mapped to their firebase auth
    const newUser = this.usersRepository.create({
      firebaseUid: payload.firebaseUid,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      department: payload.department || 'General',
    });

    return await this.usersRepository.save(newUser);
  }

  async findByFirebaseUid(firebaseUid: string) {
    return await this.usersRepository.findOne({ where: { firebaseUid } });
  }

  async updateProfile(firebaseUid: string, payload: { firstName?: string; lastName?: string; nickname?: string; department?: string; photoUrl?: string; phoneNumber?: string }) {
    const user = await this.findByFirebaseUid(firebaseUid);
    if (!user) return null;
    Object.assign(user, payload);
    return await this.usersRepository.save(user);
  }
}
