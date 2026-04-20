import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemStatus } from './entities/item.entity';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  async create(@Body() body: any) {
    return await this.itemsService.create(body);
  }

  @Get()
  async findAll() {
    return await this.itemsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.itemsService.findOne(id);
  }

  @Get('user/:uid')
  async findByUser(@Param('uid') uid: string) {
    return await this.itemsService.findByUser(uid);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ItemStatus,
  ) {
    return await this.itemsService.updateStatus(id, status);
  }
}
