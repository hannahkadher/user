import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from './libs/shared.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/user-module'),
    ConfigModule.forRoot(),
    UserModule,
    SharedModule,
  ],
})
export class AppModule {}
