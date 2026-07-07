import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { Repository } from 'typeorm';

import { UserEntity } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from './enums/role.enum';

const scrypt = promisify(scryptCallback);

type UserResponse = Pick<
  UserEntity,
  'id' | 'firstName' | 'lastName' | 'email' | 'role'
>;

type RegisterResponse = {
  message: string;
  user: UserResponse;
};

type LoginResponse = RegisterResponse & {
  accessToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponse> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const user = this.usersRepository.create({
      ...registerDto,
      role: registerDto.role ?? Role.User,
      password: await this.hashPassword(registerDto.password),
    });

    const savedUser = await this.usersRepository.save(user);

    return {
      message: 'Registration successfully',
      user: this.toUserResponse(savedUser),
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });

    if (
      !user ||
      !(await this.verifyPassword(loginDto.password, user.password))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      message: 'Login successfully',
      accessToken: this.generateToken(user),
      user: this.toUserResponse(user),
    };
  }

  private generateToken(user: UserEntity): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const hash = (await scrypt(password, salt, 64)) as Buffer;

    return `${salt}:${hash.toString('hex')}`;
  }

  private async verifyPassword(
    password: string,
    storedPassword: string,
  ): Promise<boolean> {
    const [salt, storedHash] = storedPassword.split(':');

    if (!salt || !storedHash) {
      return false;
    }

    const hash = (await scrypt(password, salt, 64)) as Buffer;
    const storedHashBuffer = Buffer.from(storedHash, 'hex');

    return (
      hash.length === storedHashBuffer.length &&
      timingSafeEqual(hash, storedHashBuffer)
    );
  }

  private toUserResponse(user: UserEntity): UserResponse {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };
  }
}

