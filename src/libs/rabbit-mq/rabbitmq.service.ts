import { Inject, Injectable, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService {
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(@Inject('RABBITMQ_URL') private readonly rabbitmqUrl: string) {}

  async sendEvent(queue: string, msg: string): Promise<void> {
    try {
      const connection = await amqp.connect(this.rabbitmqUrl);
      const channel = await connection.createChannel();
      await channel.assertQueue(queue, { durable: false });
      channel.sendToQueue(queue, Buffer.from(msg));
      setTimeout(() => {
        connection.close();
      }, 500);
    } catch (error) {
      this.logger.error('Error sending RabbitMQ event', error.stack);
      throw error;
    }
  }
}
