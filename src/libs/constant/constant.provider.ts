import { Constants } from './constant';

export const ConstantProvider = {
  provide: 'RABBITMQ_URL',
  useValue: Constants.RABBITMQ_URL,
};
