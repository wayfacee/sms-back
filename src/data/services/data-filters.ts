import { onlineSimServices } from "../constants/service-configs";
import type {
  Country5SIMInfo,
  SmsManData,
  CountryInfo,
  SmsakData,
  OnlineSimData,
} from "../interfaces/country-info.interface";

export const filterSmsLiveData = (
  data: CountryInfo,
  desiredServices: string[],
  country: string,
) =>
  Object.entries(data)
    .filter(([countryCode]) => countryCode === country)
    .map(([countryCode, services]) => ({
      country: countryCode,
      services: desiredServices
        .map((desiredService) => {
          const serviceEntries = Object.entries(services)
            .filter(([service]) => service === desiredService)
            .flatMap(([_, priceInfo]) =>
              Object.entries(priceInfo)
                .filter(([_, count]) => count > 0)
                .map(([cost, count]) => ({
                  cost: Math.ceil(Number(cost)),
                  count: Number(count),
                })),
            )
            .sort((a, b) => a.cost - b.cost)
            .slice(0, 3);

          return {
            service: desiredService,
            serviceInfo: serviceEntries,
          };
        })
        .filter((entry) => entry.serviceInfo.length > 0),
    }))
    .filter((countryData) => countryData.services.length > 0);

export const filter5SIMData = (data: Country5SIMInfo) => {
  const desiredServices = {
    telegram: "tg",
    instagram: "ig",
    vkontakte: "vk",
    whatsapp: "wa",
    google: "go",
    viber: "vb",
    discord: "ds",
  };

  return Object.entries(data)
    .map(([country, services]) => ({
      country,
      services: Object.entries(services)
        .filter(([service]) => Object.keys(desiredServices).includes(service))
        .map(([service, operators]) => {
          const topOperators = Object.values(operators)
            .filter((info) => info.count > 0 && info.cost > 0)
            .sort((a, b) => a.cost - b.cost)
            .slice(0, 3)
            .map(({ cost, count, rate }) => ({
              cost: Math.ceil(cost),
              count,
            }));

          return topOperators.length > 0
            ? {
                service: desiredServices[service] || service,
                serviceInfo: topOperators,
              }
            : null;
        })
        .filter((serviceData) => serviceData !== null),
    }))
    .filter((countryData) => countryData.services.length > 0);
};

export const filterSmsManData = (
  data: SmsManData,
  desiredServices: string[],
  country: string,
) => [
  {
    country,
    services: Object.entries(data)
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
  },
];

export const filterSmsakData = (
  data: SmsakData[] | { data: SmsakData[] },
  country: string,
  service?: string,
) => {
  const desiredServices = {
    tg: 6,
    ig: 16,
    vk: 2,
    wa: 7,
    go: 9,
    vb: 5,
  };

  const items = Array.isArray(data) ? data : data.data;

  return items
    .filter((item) => Object.values(desiredServices).includes(Number(item.id)))
    .map((item) => {
      const foundService = Object.entries(desiredServices).find(
        ([_, value]) => value === Number(item.id),
      )?.[0];

      if (service && foundService !== service) return null;

      return item.count > 0
        ? {
            country,
            services: [
              {
                service: foundService,
                cost: Math.ceil(item.cost),
                count: item.count,
              },
            ],
          }
        : null;
    })
    .filter((result) => result !== null);
};

export const filterResponseData = (
  data: CountryInfo,
  desiredServices: string[],
) =>
  Object.entries(data)
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

export const filterOnlineSimData = (data: OnlineSimData, country: string) => {
  console.log(data.services);

  return Object.entries(data.services)
    .filter(
      ([_, { slug, price, count }]) =>
        onlineSimServices[slug] && count > 0 && Math.ceil(Number(price)) > 0,
    )
    .map(([_, { slug, price, count }]) => {
      return count > 0
        ? {
            country,
            services: [
              {
                service: onlineSimServices[slug],
                cost: Math.ceil(Number(price)),
                count,
              },
            ],
          }
        : null;
    })
    .filter((result) => result !== null);
};
