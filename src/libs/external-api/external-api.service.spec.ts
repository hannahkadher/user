import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import { ExternalApiService } from './external-api.service';

describe('ExternalApiService', () => {
  let service: ExternalApiService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExternalApiService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExternalApiService>(ExternalApiService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return data on a successful API call', async () => {
    const url = 'https://api.example.com/data';
    const responseData = { key: 'value' };
    const response: AxiosResponse = {
      data: responseData,
      status: 200,
      statusText: 'OK',
      headers: new AxiosHeaders(),
      config: {
        headers: new AxiosHeaders(),
      } as InternalAxiosRequestConfig,
    };
    jest.spyOn(httpService, 'get').mockReturnValue(of(response));

    const result = await service.makeApiCall<typeof responseData>(url);
    expect(result).toEqual(responseData);
  });

  it('should throw an error on a failed API call', async () => {
    const url = 'https://api.example.com/data';
    const error = new Error('API call failed');
    jest.spyOn(httpService, 'get').mockReturnValue(throwError(error));

    await expect(service.makeApiCall(url)).rejects.toThrow(
      `Failed to make API call to URL: ${url}`,
    );
  });
});
