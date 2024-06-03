import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        text,
      });
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error('Error sending email', error.stack);
      throw error;
    }
  }
}
