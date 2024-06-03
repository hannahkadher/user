import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../schema';

// Create a mock user object
const mockUser: User = {
  id: 1,
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  avatar: 'avatar_url',
  $assertPopulated: jest.fn(),
  $clone: jest.fn(),
  $getAllSubdocs: jest.fn(),
  $ignore: jest.fn(),
} as unknown as User;

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
            getUser: jest.fn(),
            getUserAvatar: jest.fn(),
            deleteUserAvatar: jest.fn(),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('createUser', () => {
    it('should call userService.createUser with the correct parameters', async () => {
      const createUserDto: CreateUserDto = {
        id: 1,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
      };
      jest.spyOn(userService, 'createUser').mockResolvedValue(mockUser);

      expect(await userController.createUser(createUserDto)).toEqual(mockUser);
      expect(userService.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('getUser', () => {
    it('should call userService.getUser with the correct parameters', async () => {
      const userId: number = 1;
      jest.spyOn(userService, 'getUser').mockResolvedValue(mockUser);

      expect(await userController.getUser(userId)).toEqual(mockUser);
      expect(userService.getUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('getUserAvatar', () => {
    it('should call userService.getUserAvatar with the correct parameters', async () => {
      const userId = 1;
      const avatarUrl = 'avatar_url';
      jest.spyOn(userService, 'getUserAvatar').mockResolvedValue(avatarUrl);

      expect(await userController.getUserAvatar(userId)).toEqual(avatarUrl);
      expect(userService.getUserAvatar).toHaveBeenCalledWith(userId);
    });
  });

  describe('deleteUserAvatar', () => {
    it('should call userService.deleteUserAvatar with the correct parameters', async () => {
      const userId = 1;
      const result = true; // Return a boolean or Promise<boolean>
      jest.spyOn(userService, 'deleteUserAvatar').mockResolvedValue(result);

      expect(await userController.deleteUserAvatar(userId)).toEqual(result);
      expect(userService.deleteUserAvatar).toHaveBeenCalledWith(userId);
    });
  });
});
