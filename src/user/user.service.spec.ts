import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { User } from '../schema';
import { EmailService, ExternalApiService, RabbitMQService } from '../libs';
import { CreateUserDto } from './dto/create-user.dto';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

// Create a mock class for the Mongoose model
class UserModel {
  constructor(public data: any) {
    Object.assign(this, data);
  }
  save = jest.fn().mockResolvedValue(this);
  static findOne = jest.fn();
  static create = jest.fn().mockImplementation((data) => new UserModel(data));
}

describe('UserService', () => {
  let service: UserService;
  let emailService: EmailService;
  let rabbitMQService: RabbitMQService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getModelToken(User.name), useValue: UserModel },
        { provide: RabbitMQService, useValue: { sendEvent: jest.fn() } },
        { provide: EmailService, useValue: { sendEmail: jest.fn() } },
        { provide: ExternalApiService, useValue: { makeApiCall: jest.fn() } },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    emailService = module.get<EmailService>(EmailService);
    rabbitMQService = module.get<RabbitMQService>(RabbitMQService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should throw BadRequestException if user already exists', async () => {
      UserModel.findOne.mockResolvedValue({});

      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        last_name: 'doe',
        first_name: 'john',
        id: 5,
      };

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        last_name: 'doe',
        first_name: 'john',
        id: 5,
      };
      const savedUser = {
        _id: 'generatedId',
        ...createUserDto,
      };
      UserModel.findOne.mockResolvedValue(null);
      UserModel.create.mockImplementation(() => new UserModel(savedUser));

      const sendEmailSpy = jest
        .spyOn(emailService, 'sendEmail')
        .mockResolvedValue(Promise.resolve());

      const sendEventSpy = jest
        .spyOn(rabbitMQService, 'sendEvent')
        .mockResolvedValue(Promise.resolve());

      const result = await service.createUser(createUserDto);
      expect(result.id).toEqual(createUserDto.id);
      expect(UserModel.findOne).toHaveBeenCalledWith({
        email: createUserDto.email,
      });
      expect(sendEmailSpy).toHaveBeenCalledWith(
        createUserDto.email,
        'Welcome!',
        'Thank you for registering.',
      );
      expect(result.email).toEqual(createUserDto.email);
      expect(sendEventSpy).toHaveBeenCalledWith('user_created', result.id);
    });
    it('should throw BadRequestException if user with ID already exists', async () => {
      UserModel.findOne.mockResolvedValue({
        id: '5',
        email: 'existing@example.com',
      });

      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        last_name: 'doe',
        first_name: 'john',
        id: 5,
      };

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should throw InternalServerErrorException if sending email fails', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        id: 7,
        first_name: 'john',
        last_name: 'doe',
      };

      const savedUser = {
        _id: 'generatedId',
        ...createUserDto,
      };

      UserModel.findOne.mockResolvedValue(null);
      UserModel.create.mockImplementation(() => new UserModel(savedUser));
      jest
        .spyOn(emailService, 'sendEmail')
        .mockRejectedValue(new Error('Email service failed'));

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
