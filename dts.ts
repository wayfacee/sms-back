import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosResponse } from "axios";
import { HttpService } from "@nestjs/axios";
import { countryMappings } from "./constants/country-mappings";
import {
  filterSmsLiveData,
  filterSmsManData,
  filterResponseData,
  filterSmsakData,
  filter5SIMData,
} from "./services/data-filters";
import { getServiceConfigs } from "./constants/service-configs";
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

  async getFilteredData(
    service: string | null,
    country: string | "Россия" = "Россия",
  ): Promise<any[]> {
    const desiredServices = ["tg", "ig", "vk", "wa", "go", "vb", "ds"];

    const requests = this.serviceConfigs.map(async (config) => {
      const countryParam = this.getCountryId(config.name, country);

      if (!countryParam) {
        console.warn(
          `Country "${country}" not found for service "${config.name}".`,
        );
        return { name: config.name, data: null };
      }

      if (config.name === "get-sms") {
        const services = await getSmsData(
          this.httpService,
          this.configService,
          countryParam,
          service,
        );
        return {
          name: config.name,
          data: { country: countryParam, services },
        };
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
              Authorization: `Bearer ${config.apiKey}`,
              Accept: "application/json",
            },
          })
          .toPromise();

        return {
          name: config.name,
          data: this.filterData(
            config.name,
            response.data,
            desiredServices,
            countryParam,
            service,
          ),
        };
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
