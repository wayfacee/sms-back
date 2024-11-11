import { countryMappings } from '../constants/country-mappings';
import type {
  Country5SIMInfo,
  SmsManData,
  CountryInfo,
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

// export const filterSmsLiveData = (
//   data: CountryInfo,
//   desiredServices: string[],
//   country: string,
// ) => {
//   return Object.entries(data)
//     .filter(([countryCode]) => countryCode === country)
//     .map(([countryCode, services]) => ({
//       country: countryCode,
//       services: Object.entries(services)
//         .filter(([service, priceInfo]) => desiredServices.includes(service))
//         .map(([service, priceInfo]) => {
//           const [firstCost, firstCount] =
//             Object.entries(priceInfo).find(
//               ([cost, count]) => count > 0 && Number(cost) > 0,
//             ) || [];

//           return firstCost && firstCount
//             ? {
//                 service,
//                 cost: Math.ceil(Number(firstCost)),
//                 count: firstCount,
//               }
//             : null;
//         })
//         .filter((serviceData) => serviceData !== null),
//     }))
//     .filter((countryData) => countryData.services.length > 0);
// };

export const filterSmsLiveData = (
  data: CountryInfo,
  desiredServices: string[],
  country: string,
) => {
  return Object.entries(data)
    .filter(([countryCode]) => countryCode === country)
    .map(([countryCode, services]) => ({
      country: countryCode,
      services: desiredServices
        .map((desiredService) => {
          // Находим все записи для желаемого сервиса
          const serviceEntries = Object.entries(services)
            .filter(([service]) => service === desiredService)
            .flatMap(([_, priceInfo]) =>
              Object.entries(priceInfo)
                .filter(([_, count]) => count > 0) // Убираем нулевые значения
                .map(([cost, count]) => ({
                  cost: Math.ceil(Number(cost)),
                  count: Number(count),
                })),
            )
            // Сортируем по цене и выбираем 3 наименьшие стоимости
            .sort((a, b) => a.cost - b.cost)
            .slice(0, 3);

          return {
            service: desiredService,
            serviceInfo: serviceEntries,
          };
        })
        .filter((entry) => entry.serviceInfo.length > 0), // Убираем пустые записи
    }))
    .filter((countryData) => countryData.services.length > 0); // Убираем страны без данных
};

// export const filter5SIMData = (data: Country5SIMInfo) => {
//   const desiredServices = {
//     telegram: 'tg',
//     instagram: 'ig',
//     vkontakte: 'vk',
//     whatsapp: 'wa',
//     google: 'go',
//     viber: 'vb',
//     discord: 'ds',
//   };

//   return Object.entries(data)
//     .map(([country, services]) => ({
//       country,
//       services: Object.entries(services)
//         .filter(([service]) => Object.keys(desiredServices).includes(service))
//         .map(([service, operators]) => {
//           const operator = Object.values(operators).find(
//             (info) => info.count > 0 && info.cost > 0,
//           );

//           return operator
//             ? {
//                 service: desiredServices[service] || service,
//                 cost: Math.ceil(operator.cost),
//                 count: operator.count,
//               }
//             : null;
//         })
//         .filter((serviceData) => serviceData !== null),
//     }))
//     .filter((countryData) => countryData.services.length > 0);
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
          // Сортируем операторов по возрастанию `cost` и выбираем 3 оператора с положительным `count`
          const topOperators = Object.values(operators)
            .filter((info) => info.count > 0 && info.cost > 0)
            .sort((a, b) => a.cost - b.cost)
            .slice(0, 3)
            .map(({ cost, count, rate }) => ({
              cost: Math.ceil(cost),
              count,
              ...(rate !== undefined ? { rate } : {}), // Добавляем `rate`, если он есть
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
) => {
  return [
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
};

export const filterResponseData = (
  data: CountryInfo,
  desiredServices: string[],
) => {
  // console.log('Received data:', data);

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