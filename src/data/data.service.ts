import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { type CountryInfo } from './interfaces/country-info.interface';
import { ServiceConfig } from './interfaces/service-config.interface';
import { HttpService } from '@nestjs/axios';
import { countryMappings } from './constants/country-mappings';

@Injectable()
export class DataService {
  private readonly serviceConfigs: ServiceConfig[];

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.serviceConfigs = [
      {
        name: '365sms',
        url: 'https://365sms.ru/stubs/handler_api.php', // id
        apiKey: this.configService.get<string>('VITE_365SMS'),
      },
      {
        name: 'sms-man',
        url: 'https://api.sms-man.com/stubs/handler_api.php', // id
        apiKey: this.configService.get<string>('VITE_SMS_MAN'), // передаются фулл страны, если его нет в списке
      },
      {
        name: 'sms-activate',
        url: 'https://api.sms-activate.guru/stubs/handler_api.php', // id
        apiKey: this.configService.get<string>('VITE_SMS_ACTIVATE'),
      },
      {
        name: '7grizzly',
        url: 'https://api.7grizzlysms.com/stubs/handler_api.php', // id
        apiKey: this.configService.get<string>('VITE_1GRIZZ'),
      },
      {
        name: 'getsms',
        url: 'http://api.getsms.online/stubs/handler_api.php', // id
        apiKey: this.configService.get<string>('VITE_GET_SMS'), // ru kz done, возв. тока стоимость
        // action: 'getNumbersStatus',
      },
      {
        name: 'smslive',
        url: 'https://smslive.pro/stubs/handler_api.php', // id
        apiKey: this.configService.get<string>('VITE_SMSLIVE'), // возвращает нескока цен + кол-во
        // action: 'getNumbersStatus',
      },
      {
        name: '5sim',
        url: 'https://5sim.net/v1/guest/prices', // возвращ. данные с оператором
        apiKey: this.configService.get<string>('VITE_5SIM'), // ?country=$country&product=$product
      },
      // {
      //   name: 'onlinesim', нет апи доки
      //   url: 'https://onlinesim.io/ru',
      //   apiKey: this.configService.get<string>('VITE_ONLINE_SIM'),
      // },
      // {
      //   name: 'ironsim', facebook
      //   url: 'https://ironsim.com/',
      //   apiKey: this.configService.get<string>('VITE_IRONSIM'),
      // },
      // {
      //   name: 'cheapsms',
      //   url: 'http://cheapsms.pro/stubs/handler_api.php',
      //   // ?api_key=$api_key&action=getNumbersStatus&country=$country
      //   // апи не работает
      //   apiKey: this.configService.get<string>('VITE_CHEAPSMS'),
      // },
    ];
  }

  private getCountryId(
    serviceName: string,
    country: string,
  ): string | undefined {
    return countryMappings[serviceName]?.[country] ?? undefined;
  }

  async getFilteredData(
    service: string | null,
    country: string | 'Россия' = 'Россия',
  ): Promise<any[]> {
    const desiredServices = ['tg', 'ig', 'vk', 'wa', 'go', 'vb', 'ds'];

    const requests = this.serviceConfigs.map((config) => {
      const countryParam = this.getCountryId(config.name, country);
      console.log(config.name, countryParam, country);

      if (!countryParam) {
        console.log(
          `Country "${country}" not found in mapping for service ${config.name}. Returning data: null.`,
        );
        return { name: config.name, data: null };
      }

      const params: any = {
        api_key: config.apiKey,
        action: config.action || 'getPrices',
        country: countryParam.toString(),
        ...(config.name === '5sim' ? { product: service } : { service }),
      };

      return this.httpService
        .get<CountryInfo>(config.url, {
          params,
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            Accept: 'application/json',
          },
        })
        .toPromise()
        .then((response: AxiosResponse<CountryInfo>) => ({
          name: config.name,
          data:
            config.name === 'getsms'
              ? this.filterGetSmsData(response.data, desiredServices, country)
              : config.name === 'smslive'
                ? this.filterSmsLiveData(
                    response.data,
                    desiredServices,
                    countryParam,
                  )
                : this.filterResponseData(response.data, desiredServices),
        }))
        .catch((error) => {
          console.error(`Error fetching from ${config.name}:`, error.message);
          return { name: config.name, data: null };
        });
    });

    return Promise.all(requests);
  }

  private filterGetSmsData(
    data: CountryInfo,
    desiredServices: string[],
    country?: string,
  ) {
    return Object.entries(data)
      .filter(
        ([countryKey]) =>
          !country || countryKey === this.getCountryId('getsms', country),
      )
      .map(([countryKey, services]) => ({
        country: countryKey,
        services: Object.entries(services)
          .filter(
            ([service, priceInfo]) =>
              desiredServices.includes(service) &&
              priceInfo.count > 0 &&
              priceInfo.cost > 0,
          )
          .map(([service, priceInfo]) => ({
            service,
            cost: Math.ceil(priceInfo.cost),
            count: priceInfo.count,
          })),
      }));
  }

  private filterSmsLiveData(
    data: CountryInfo,
    desiredServices: string[],
    country: string,
  ) {
    return Object.entries(data)
      .filter(([countryCode]) => countryCode === country)
      .map(([countryCode, services]) => ({
        country: countryCode,
        services: Object.entries(services)
          .filter(([service, priceInfo]) => desiredServices.includes(service))
          .map(([service, priceInfo]) => {
            const [firstCost, firstCount] =
              Object.entries(priceInfo).find(
                ([cost, count]) => count > 0 && Number(cost) > 0,
              ) || [];

            return firstCost && firstCount
              ? {
                  service,
                  cost: Math.ceil(Number(firstCost)),
                  count: firstCount,
                }
              : null;
          })
          .filter((serviceData) => serviceData !== null),
      }))
      .filter((countryData) => countryData.services.length > 0);
  }

  private filterResponseData(data: CountryInfo, desiredServices: string[]) {
    return Object.entries(data)
      .map(([country, services]) => ({
        country,
        services: Object.entries(services)
          .filter(
            ([service, priceInfo]) =>
              desiredServices.includes(service) &&
              priceInfo.count > 0 &&
              priceInfo.cost > 0,
          )
          .map(([service, priceInfo]) => ({
            service,
            cost: Math.ceil(priceInfo.cost),
            count: priceInfo.count,
          })),
      }))
      .filter((countryData) => countryData.services.length > 0);
  }
}
