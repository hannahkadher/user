import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { ConstantProvider } from '../constant/constant.provider';

@Module({
  providers: [RabbitMQService, ConstantProvider],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
