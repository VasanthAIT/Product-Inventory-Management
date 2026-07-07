import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

type UserResponse = Omit<UserEntity, 'password'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findAll() {
    const users = await this.usersRepository.find();

    return {
      message: 'Users fetched successfully',
      data: users.map((user) => this.toUserResponse(user)),
    };
  }

  async findOne(id: number) {
    const user = await this.findUser(id);

    return {
      message: 'User fetched successfully',
      data: this.toUserResponse(user),
    };
  }

  async findByEmail(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User fetched successfully',
      data: this.toUserResponse(user),
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findUser(id);

    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);

    return {
      message: 'User updated successfully',
      data: this.toUserResponse(updatedUser),
    };
  }

  async remove(id: number) {
    const user = await this.findUser(id);

    await this.usersRepository.remove(user);

    return {
      message: 'User deleted successfully',
    };
  }

  private async findUser(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private toUserResponse(user: UserEntity): UserResponse {
    const { password, ...userResponse } = user;

    return userResponse;
  }
}
