import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import {
  Country5SIMInfo,
  SmsManData,
  type CountryInfo,
} from './interfaces/country-info.interface';
import { ServiceConfig } from './interfaces/service-config.interface';
import { HttpService } from '@nestjs/axios';
import { countryMappings } from './constants/country-mappings';
import {
  filter5SIMData,
  filterGetSmsData,
  filterResponseData,
  filterSmsLiveData,
  filterSmsManData,
} from './services/data-filters';
import { getServiceConfigs } from './constants/service-configs';

@Injectable()
export class DataService {
  private readonly serviceConfigs: ServiceConfig[];

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.serviceConfigs = getServiceConfigs(this.configService);
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
          data: this.filterData(
            config.name,
            response.data,
            desiredServices,
            countryParam,
          ),
        }))
        .catch((error) => {
          console.error(`Error fetching from ${config.name}:`, error.message);
          return { name: config.name, data: null };
        });
    });

    return Promise.all(requests);
  }

  private filterData(
    serviceName: string,
    data: CountryInfo | Country5SIMInfo | SmsManData,
    desiredServices: string[],
    country: string,
  ) {
    switch (serviceName) {
      case 'getsms':
        return filterGetSmsData(data as CountryInfo, desiredServices, country);
      case 'smslive':
        return filterSmsLiveData(data as CountryInfo, desiredServices, country);
      case '5sim':
        return filter5SIMData(data as Country5SIMInfo);
      case 'sms-man':
        return filterSmsManData(data as SmsManData, desiredServices, country);
      default:
        return filterResponseData(data as CountryInfo, desiredServices);
    }
  }
}