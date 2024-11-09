import { ConfigService } from '@nestjs/config';
import { type ServiceConfig } from '../interfaces/service-config.interface';

export const getServiceConfigs = (
  configService: ConfigService,
): ServiceConfig[] => [
  {
    name: '365sms',
    url: 'https://365sms.ru/stubs/handler_api.php', // id
    apiKey: configService.get<string>('VITE_365SMS'),
  },
  {
    name: 'sms-man',
    url: 'https://api.sms-man.com/stubs/handler_api.php', // id
    apiKey: configService.get<string>('VITE_SMS_MAN'), // передаются фулл страны, если его нет в списке
  },
  {
    name: 'sms-activate',
    url: 'https://api.sms-activate.guru/stubs/handler_api.php', // id
    apiKey: configService.get<string>('VITE_SMS_ACTIVATE'),
  },
  {
    name: '7grizzly',
    url: 'https://api.7grizzlysms.com/stubs/handler_api.php', // id
    apiKey: configService.get<string>('VITE_1GRIZZ'),
  },
  {
    name: 'getsms',
    url: 'http://api.getsms.online/stubs/handler_api.php', // id
    apiKey: configService.get<string>('VITE_GET_SMS'), // ru kz done, возв. тока стоимость
    // action: 'getNumbersStatus',
  },
  {
    name: 'smslive',
    url: 'https://smslive.pro/stubs/handler_api.php', // id
    apiKey: configService.get<string>('VITE_SMSLIVE'), // возвращает нескока цен + кол-во
    // action: 'getNumbersStatus',
  },
  {
    name: '5sim',
    url: 'https://5sim.net/v1/guest/prices', // возвращ. данные с оператором
    apiKey: configService.get<string>('VITE_5SIM'), // ?country=$country&product=$product
  },
  // {
  //   name: 'onlinesim', нет апи доки
  //   url: 'https://onlinesim.io/ru',
  //   apiKey: configService.get<string>('VITE_ONLINE_SIM'),
  // },
  // {
  //   name: 'ironsim', facebook
  //   url: 'https://ironsim.com/',
  //   apiKey: configService.get<string>('VITE_IRONSIM'),
  // },
  // {
  //   name: 'cheapsms',
  //   url: 'http://cheapsms.pro/stubs/handler_api.php',
  //   // ?api_key=$api_key&action=getNumbersStatus&country=$country
  //   // апи не работает
  //   apiKey: configService.get<string>('VITE_CHEAPSMS'),
  // },
];
