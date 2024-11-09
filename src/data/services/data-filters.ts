import { countryMappings } from '../constants/country-mappings';
import {
  Country5SIMInfo,
  SmsManData,
  type CountryInfo,
} from '../interfaces/country-info.interface';

const getCountryId = (
  serviceName: string,
  country: string,
): string | undefined => {
  return countryMappings[serviceName]?.[country] ?? undefined;
};

export const filterGetSmsData = (
  data: CountryInfo,
  desiredServices: string[],
  country?: string,
) => {
  return Object.entries(data)
    .filter(
      ([countryKey]) =>
        !country || countryKey === getCountryId('getsms', country),
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
};

export const filterSmsLiveData = (
  data: CountryInfo,
  desiredServices: string[],
  country: string,
) => {
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
};

// export const filter5SIMData = (
//   data: Country5SIMInfo,
//   desiredServices: string[],
// ) => {
//   console.log('Received data:', data);
//   console.log('Desired services:', desiredServices);

//   return Object.entries(data)
//     .map(([country, services]) => {
//       const filteredServices = Object.entries(services)
//         .filter(([service]) => desiredServices.includes(service))
//         .map(([service, operators]) => {
//           const operator = Object.values(operators).find(
//             (info) => info.count > 0 && info.cost > 0,
//           );

//           return operator
//             ? {
//                 service,
//                 cost: Math.ceil(operator.cost),
//                 count: operator.count,
//               }
//             : null;
//         })
//         .filter((serviceData) => serviceData !== null);

//       return filteredServices.length > 0
//         ? { country, services: filteredServices }
//         : null;
//     })
//     .filter((countryData) => countryData !== null);
// };

export const filter5SIMData = (data: Country5SIMInfo) => {
  const desiredServices = {
    telegram: 'tg',
    instagram: 'ig',
    vkontakte: 'vk',
    whatsapp: 'wa',
    google: 'go',
    viber: 'vb',
    discord: 'ds',
  };

  return Object.entries(data)
    .map(([country, services]) => ({
      country,
      services: Object.entries(services)
        .filter(([service]) => Object.keys(desiredServices).includes(service))
        .map(([service, operators]) => {
          const operator = Object.values(operators).find(
            (info) => info.count > 0 && info.cost > 0,
          );

          return operator
            ? {
                service: desiredServices[service] || service,
                cost: Math.ceil(operator.cost),
                count: operator.count,
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
) => {
  return [
    {
      country,
      services: Object.entries(data)
        .filter(([service, priceInfo]) => 
          desiredServices.includes(service) &&
          priceInfo.count > 0 &&
          priceInfo.cost > 0
        )
        .map(([service, priceInfo]) => ({
          service,
          cost: Math.ceil(priceInfo.cost),
          count: priceInfo.count,
        }))
    }
  ];
};


export const filterResponseData = (
  data: CountryInfo,
  desiredServices: string[],
) => {
  console.log('Received data:', data);

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
};
