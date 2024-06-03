import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailService } from './email.service'; // Adjust the import path accordingly

describe('EmailService', () => {
  let service: EmailService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send an email successfully', async () => {
    const to = 'test@example.com';
    const subject = 'Test Subject';
    const text = 'Test Text';

    jest.spyOn(mailerService, 'sendMail').mockResolvedValueOnce(undefined);

    await service.sendEmail(to, subject, text);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to,
      subject,
      text,
    });
  });

  it('should log an error and rethrow it if sending email fails', async () => {
    const to = 'test@example.com';
    const subject = 'Test Subject';
    const text = 'Test Text';
    const error = new Error('Failed to send email');

    jest.spyOn(mailerService, 'sendMail').mockRejectedValueOnce(error);
    const loggerSpy = jest.spyOn(Logger.prototype, 'error');

    await expect(service.sendEmail(to, subject, text)).rejects.toThrow(error);
    expect(loggerSpy).toHaveBeenCalledWith('Error sending email', error.stack);
  });
});
