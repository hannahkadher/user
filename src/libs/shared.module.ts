import { Module } from '@nestjs/common';
import { ExternalApiModule } from './external-api';
import { RabbitMQModule } from './rabbit-mq';
import { EmailModule } from './email';

@Module({
  imports: [ExternalApiModule, RabbitMQModule, EmailModule],
  exports: [ExternalApiModule, RabbitMQModule, EmailModule],
})
export class SharedModule {}
