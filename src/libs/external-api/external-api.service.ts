import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class ExternalApiService {
  private readonly logger = new Logger(ExternalApiService.name);

  constructor(private readonly httpService: HttpService) {}

  async makeApiCall<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await firstValueFrom(this.httpService.get(url, config));
      return response.data as T;
    } catch (error) {
      this.logger.error(`Error making API call to URL: ${url}`, error.stack);
      throw new Error(`Failed to make API call to URL: ${url}`);
    }
  }
}
