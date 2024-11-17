import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import {
  FilteredGetSmsNS,
  getSmsNumbersStatus,
} from "./get-sms-numbers-status";
import { FiteredGetSmsPrices, getSmsPrices } from "./get-sms-prices";

const filterGetSmsData = (
  numberStatus: FilteredGetSmsNS[],
  prices: FiteredGetSmsPrices[],
  serviceName?: string,
) => {
  const uniqueResults = new Set<string>();

  return numberStatus.flatMap((status) => {
    const countryPrices = prices.find(
      (price) => price.country === status.country,
    );

    if (!countryPrices) return [];

    return countryPrices.services
      .map((priceInfo) => {
        if (serviceName && priceInfo.service !== serviceName) return null;

        const matchingStatus = numberStatus.find(
          (ns) =>
            ns.country === status.country && ns.service === priceInfo.service,
        );

        if (matchingStatus) {
          const result = JSON.stringify({
            service: priceInfo.service,
            cost: priceInfo.cost,
            count: matchingStatus.count,
          });

          if (!uniqueResults.has(result)) {
            uniqueResults.add(result);
            return JSON.parse(result);
          }
        }
        return null;
      })
      .filter((item) => item !== null);
  });
};

export const getSmsData = async (
  httpService: HttpService,
  configService: ConfigService,
  country?: string,
  serviceName?: string,
) => {
  try {
    const numberStatus = await getSmsNumbersStatus(
      httpService,
      configService,
      country,
    );
    const prices = await getSmsPrices(httpService, configService);
    return filterGetSmsData(numberStatus, prices, serviceName);
  } catch (error) {
    console.error("Error fetching SMS data:", error);
    return [];
  }
};
