import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() body: { firebaseUid: string; email: string; firstName: string; lastName: string; department?: string }) {
    return await this.usersService.createFromFirebase(body);
  }

  @Get(':firebaseUid')
  async getProfile(@Param('firebaseUid') firebaseUid: string) {
    return await this.usersService.findByFirebaseUid(firebaseUid);
  }

  @Patch(':firebaseUid')
  async updateProfile(
    @Param('firebaseUid') firebaseUid: string, 
    @Body() body: { firstName?: string; lastName?: string; nickname?: string; department?: string; photoUrl?: string }
  ) {
    return await this.usersService.updateProfile(firebaseUid, body);
  }
}
