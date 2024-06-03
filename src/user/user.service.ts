import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

import { User } from '../schema';
import { EmailService, ExternalApiService, RabbitMQService } from '../libs';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiResponse } from './interface';
import { UserResponseDto } from './dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly rabbitMQService: RabbitMQService,
    private readonly emailService: EmailService,
    private readonly externalApiService: ExternalApiService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const createdUser = new this.userModel(createUserDto);
    try {
      await createdUser.save();

      await this.emailService.sendEmail(
        createUserDto.email,
        'Welcome!',
        'Thank you for registering.',
      );

      await this.rabbitMQService.sendEvent('user_created', createdUser.id);

      return createdUser;
    } catch (error) {
      this.logger.error('Error creating user', error.stack);
      throw new InternalServerErrorException(
        'Failed to create user. Please try again later.',
      );
    }
  }

  async getUser(userId: number): Promise<UserResponseDto> {
    try {
      const url = `https://reqres.in/api/users/${userId}`;
      const response =
        await this.externalApiService.makeApiCall<ApiResponse<UserResponseDto>>(
          url,
        );
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching user with ID: ${userId}`, error.stack);
      throw new InternalServerErrorException(
        `Failed to fetch user with ID: ${userId}. Please try again later.`,
      );
    }
  }

  async getUserAvatar(userId: number): Promise<string> {
    try {
      const user = await this.userModel.findOne({ id: userId });
      if (!user || !user.avatar) {
        const avatarBase64 = await this.fetchAndSaveAvatar(userId);
        return avatarBase64.toString('base64');
      } else {
        const avatarPath = this.getAvatarPath(user.avatar);
        if (fs.existsSync(avatarPath)) {
          const avatarData = fs.readFileSync(avatarPath);
          return avatarData.toString('base64');
        } else {
          throw new Error(`Avatar file for user ID: ${userId} not found.`);
        }
      }
    } catch (error) {
      this.logger.error(
        `Error fetching avatar for user ID: ${userId}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        `Failed to fetch avatar for user ID: ${userId}. Please try again later.`,
      );
    }
  }

  async deleteUserAvatar(userId: number): Promise<boolean> {
    const user = await this.userModel.findOne({ id: userId });
    if (!user)
      throw new NotFoundException(`User with ID: ${userId} not found.`);

    try {
      const avatarPath = this.getAvatarPath(user.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
      await this.userModel.deleteOne({ id: userId });

      return true;
    } catch (error) {
      this.logger.error(
        `Error deleting avatar for user ID: ${userId}`,
        error.stack,
      );
      throw new Error(
        `Failed to delete avatar for user ID: ${userId}. Please try again later.`,
      );
    }
  }

  private getAvatarPath(avatarHash: string): string {
    const dir = path.join(__dirname, '..', '..', 'avatars');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return path.join(dir, `${avatarHash}.png`);
  }

  private async fetchAndSaveAvatar(userId: number): Promise<Buffer> {
    const response = await this.getUser(userId);
    const avatarUrl = response.avatar;
    const avatarData = await this.externalApiService.makeApiCall<Buffer>(
      avatarUrl,
      { responseType: 'arraybuffer' },
    );

    const hash = this.generateHash(avatarData);

    const avatarPath = this.getAvatarPath(hash);
    fs.writeFileSync(avatarPath, avatarData);

    await this.userModel.create({
      first_name: response.first_name,
      last_name: response.last_name,
      avatar: hash,
      id: userId,
      email: response.email,
    });
    return avatarData;
  }

  private generateHash(data: Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
