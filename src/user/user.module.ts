import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from '../schema';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SharedModule } from '../libs/shared.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    SharedModule,
    HttpModule,
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
