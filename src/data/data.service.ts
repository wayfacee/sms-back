import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { countryMappings } from "./constants/country-mappings";
import {
  filterSmsLiveData,
  filterSmsManData,
  filterResponseData,
  filterSmsakData,
  filter5SIMData,
} from "./services/data-filters";
import {
  desiredServices,
  getServiceConfigs,
} from "./constants/service-configs";
import { getSmsData } from "./services/get-sms/get-sms-func";
import type {
  Country5SIMInfo,
  SmsManData,
  SmsakData,
  CountryInfo,
} from "./interfaces/country-info.interface";
import type { ServiceConfig } from "./interfaces/service-config.interface";

@Injectable()
export class DataService {
  private readonly serviceConfigs: ServiceConfig[];
  private readonly cache = new Map<string, any>(); // Мемоизация запросов

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
    return countryMappings[serviceName]?.[country];
  }

  private generateCacheKey(
    serviceName: string,
    country: string,
    service: string | null,
  ): string {
    return `${serviceName}-${country}-${service || "all"}`;
  }

  async getFilteredData(
    service: string | "tg" = "tg",
    country: string | "Россия" = "Россия",
  ): Promise<any[]> {
    const requests = this.serviceConfigs.map(async (config) => {
      const countryParam = this.getCountryId(config.name, country);

      if (!countryParam) {
        console.warn(
          `Country "${country}" not found for service "${config.name}".`,
        );
        return { name: config.name, data: null };
      }

      // Генерация ключа кэша
      const cacheKey = this.generateCacheKey(
        config.name,
        countryParam,
        service,
      );

      // Если запрос уже кэширован, вернуть кэшированные данные
      if (this.cache.has(cacheKey)) {
        return { name: config.name, data: this.cache.get(cacheKey) };
      }

      let responseData;
      if (config.name === "get-sms") {
        responseData = await getSmsData(
          this.httpService,
          this.configService,
          countryParam,
          service,
        );
        const filteredData = { country: countryParam, services: responseData };
        this.cache.set(cacheKey, filteredData); // Сохранение в кэш
        return { name: config.name, data: filteredData };
      }

      const url =
        config.name === "smsak" ? `${config.url}/${config.apiKey}` : config.url;

      const params =
        config.name === "smsak"
          ? { code: countryParam }
          : {
              api_key: config.apiKey,
              action: config.action || "getPrices",
              country: countryParam,
              ...(config.name === "5sim" ? { product: service } : { service }),
            };

      try {
        const response = await this.httpService
          .get<CountryInfo>(url, {
            params,
            headers: {
              "X-API-Key": config.apiKey,
              Authorization: `Bearer ${config.apiKey}`,
              Accept: "application/json",
            },
          })
          .toPromise();

        responseData = this.filterData(
          config.name,
          response.data,
          desiredServices,
          countryParam,
          service,
        );

        this.cache.set(cacheKey, responseData); // Сохранение в кэш
        return { name: config.name, data: responseData };
      } catch (error) {
        console.error(`Error fetching from "${config.name}":`, error.message);
        return { name: config.name, data: null };
      }
    });

    return Promise.all(requests);
  }

  private filterData(
    serviceName: string,
    data: CountryInfo | Country5SIMInfo | SmsManData | SmsakData[],
    desiredServices: string[],
    country: string,
    service: string,
  ) {
    switch (serviceName) {
      case "smslive":
        return filterSmsLiveData(data as CountryInfo, desiredServices, country);
      case "5sim":
        return filter5SIMData(data as Country5SIMInfo);
      case "sms-man":
        return filterSmsManData(data as SmsManData, desiredServices, country);
      case "smsak":
        return filterSmsakData(data as SmsakData[], country, service);
      default:
        return filterResponseData(data as CountryInfo, desiredServices);
    }
  }
}
