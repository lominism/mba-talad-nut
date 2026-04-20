import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item, ItemStatus } from './entities/item.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    private readonly usersService: UsersService,
  ) {}

  async create(data: { firebaseUid: string, name: string, price: number, quality: string, description: string, photoUrls: string[] }) {
    const user = await this.usersService.findByFirebaseUid(data.firebaseUid);
    if (!user) throw new NotFoundException('User not found');
    
    const item = this.itemsRepository.create({
      name: data.name,
      price: data.price,
      quality: data.quality,
      description: data.description,
      photoUrls: data.photoUrls,
      seller: user,
    });
    
    return await this.itemsRepository.save(item);
  }

  async findAll() {
    return await this.itemsRepository.find({
      relations: ['seller'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string) {
    return await this.itemsRepository.findOne({
      where: { id },
      relations: ['seller', 'reservedBy'],
    });
  }

  async findByUser(firebaseUid: string) {
    const user = await this.usersService.findByFirebaseUid(firebaseUid);
    if (!user) throw new NotFoundException('User not found');

    return await this.itemsRepository.find({
      where: { seller: { id: user.id } },
      relations: ['seller', 'reservedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: string, status: ItemStatus) {
    const item = await this.itemsRepository.findOne({ where: { id }, relations: ['reservedBy'] });
    if (!item) throw new NotFoundException('Item not found');

    item.status = status;
    
    // If status is changed back to AVAILABLE, clear the reservedBy relationship. 
    if (status === ItemStatus.AVAILABLE) {
      item.reservedBy = null;
    }

    return await this.itemsRepository.save(item);
  }
}
