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
  serviceName?: string
) => {
  const uniqueResults = new Set<string>();

  return numberStatus.flatMap((status) => {
    const countryPrices = prices.find((price) => price.country === status.country);

    if (!countryPrices) return [];

    return countryPrices.services
      .map((priceInfo) => {
        if (serviceName && priceInfo.service !== serviceName) return null;

        const matchingStatus = numberStatus.find(
          (ns) => ns.country === status.country && ns.service === priceInfo.service
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


// const filterGetSmsData = (
//   numberStatus: FilteredGetSmsNS[],
//   prices: FiteredGetSmsPrices[],
//   serviceName?: string,
// ) => {
//   const uniqueResults = new Set(); // Для уникальности результатов

//   return numberStatus.flatMap((el) => {
//     const foundCountry = prices.find((price) => price.country === el.country);

//     if (foundCountry) {
//       return foundCountry.services
//         .map((priceInfo) => {
//           const status = numberStatus.find(
//             (status) =>
//               status.country === el.country &&
//               status.service === priceInfo.service,
//           );

//           if (serviceName && priceInfo.service !== serviceName) {
//             return null; // Игнорируем сервисы, не совпадающие с serviceName
//           }

//           if (status) {
//             const result = {
//               service: priceInfo.service,
//               cost: priceInfo.cost,
//               count: status.count,
//             };

//             // Добавляем результат в Set для предотвращения дублирования
//             const resultString = JSON.stringify(result);
//             if (!uniqueResults.has(resultString)) {
//               uniqueResults.add(resultString);
//               return result;
//             }
//             return null; // Возвращаем null, если уже добавили такой результат
//           }
//           return null; // Если нет данных о статусе
//         })
//         .filter((service) => service !== null); // Убираем null значения
//     }
//     return []; // Возвращаем пустой массив, если страна не найдена
//   });
// };

// export const getSmsData = async (
//   httpService: HttpService,
//   configService: ConfigService,
//   country?: string,
//   serviceName?: string,
// ) => {
//   try {
//     const numberStatus = await getSmsNumbersStatus(
//       httpService,
//       configService,
//       country,
//     );
//     const prices = await getSmsPrices(httpService, configService);
//     return filterGetSmsData(numberStatus, prices, serviceName);
//   } catch (e) {
//     console.log("getSmsData", e);
//   }
// };

export const getSmsData = async (
  httpService: HttpService,
  configService: ConfigService,
  country?: string,
  serviceName?: string
) => {
  try {
    const numberStatus = await getSmsNumbersStatus(httpService, configService, country);
    const prices = await getSmsPrices(httpService, configService);
    return filterGetSmsData(numberStatus, prices, serviceName);
  } catch (error) {
    console.error("Error fetching SMS data:", error);
    return [];
  }
};
