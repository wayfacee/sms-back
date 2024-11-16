import { ConfigService } from "@nestjs/config";
import { type ServiceConfig } from "../interfaces/service-config.interface";

export const getServiceConfigs = (
  configService: ConfigService,
): ServiceConfig[] => [
  {
    name: "365sms",
    url: "https://365sms.ru/stubs/handler_api.php", // id
    apiKey: configService.get<string>("VITE_365SMS"),
  },
  {
    name: "sms-man",
    url: "https://api.sms-man.com/stubs/handler_api.php", // id
    apiKey: configService.get<string>("VITE_SMS_MAN"), // передаются фулл страны, если его нет в списке
  },
  {
    name: "sms-activate",
    url: "https://api.sms-activate.guru/stubs/handler_api.php", // id
    apiKey: configService.get<string>("VITE_SMS_ACTIVATE"),
  },
  {
    name: "7grizzly",
    url: "https://api.7grizzlysms.com/stubs/handler_api.php", // id
    apiKey: configService.get<string>("VITE_1GRIZZ"),
  },
  {
    name: "smslive",
    url: "https://smslive.pro/stubs/handler_api.php", // id
    apiKey: configService.get<string>("VITE_SMSLIVE"), // возвращает нескока цен + кол-во
  },
  {
    name: "5sim",
    url: "https://5sim.net/v1/guest/prices", // возвращ. данные с оператором
    apiKey: configService.get<string>("VITE_5SIM"), // ?country=$country&product=$product
  },
  {
    name: "sms-bower",
    url: "https://smsbower.online/stubs/handler_api.php",
    apiKey: configService.get<string>("VITE_SMS_BOWER"),
  },
  {
    name: "sms-code",
    url: "https://api.sms-code.ru/stubs/handler_api.php",
    apiKey: configService.get<string>("VITE_SMS_CODE"),
  },
  {
    name: "tiger-sms",
    url: "https://tiger-sms.com/stubs/handler_api.php",
    apiKey: configService.get<string>("VITE_TIGER_SMS"),
  },
  {
    name: "vak-sms",
    url: "https://vak-sms.com/stubs/handler_api.php",
    apiKey: configService.get<string>("VITE_VAK_SMS"),
  },
  {
    name: "smsak",
    url: "https://smsak.org/api/numbersstatus",
    apiKey: configService.get<string>("VITE_SMSAK"),
  },
  {
    name: "get-sms",
    // url: 'http://api.getsms.online/stubs/handler_api.php', // id
    // apiKey: configService.get<string>('VITE_GET_SMS'), // ru kz done, возв. тока стоимость
  },
  // {
  //   name: "ironsim",
  //   url: "https://ironsim.com/api/service/list",
  //   apiKey: configService.get<string>("VITE_IRONSIM"),
  // },
  // {
  //   name: 'onlinesim',
  //   url: 'https://onlinesim.io/ru',
  //   apiKey: configService.get<string>('VITE_ONLINE_SIM'),
  // },
  // {
  //   name: 'cheapsms',
  //   url: 'http://cheapsms.pro/stubs/handler_api.php',
  //   // ?api_key=$api_key&action=getNumbersStatus&country=$country
  //   // апи не работает
  //   apiKey: configService.get<string>('VITE_CHEAPSMS'),
  // },
];

export const desiredServices = ["tg", "ig", "vk", "wa", "go", "vb", "ds"];