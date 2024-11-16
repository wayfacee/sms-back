import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { lastValueFrom } from "rxjs";
import { desiredServices } from "src/data/constants/service-configs";
import type { GetSmsPrices } from "src/data/interfaces/country-info.interface";

export interface FiteredGetSmsPrices {
  country: string;
  services: {
    service: string;
    cost: number;
  }[];
}

// export const filterGetSmsPrices = (
//   data: GetSmsPrices,
// ): FiteredGetSmsPrices[] => {
//   const desiredServices = ["tg", "ig", "vk", "wa", "go", "vb", "ds"];

//   return Object.entries(data).map(([country, services]) => ({
//     country,
//     services: Object.entries(services)
//       .filter(
//         ([service, priceInfo]) =>
//           desiredServices.includes(service) && priceInfo.cost > 0,
//       )
//       .map(([service, priceInfo]) => ({
//         service,
//         cost: Math.ceil(priceInfo.cost),
//       })),
//   }));
// };

// export const getSmsPrices = async (
//   httpService: HttpService,
//   configService: ConfigService,
// ) => {
//   const params = {
//     api_key: configService.get<string>("VITE_GET_SMS"),
//     action: "getPrices",
//   };
//   try {
//     const { data: serviceData } = await lastValueFrom(
//       httpService.get<GetSmsPrices>(
//         "http://api.getsms.online/stubs/handler_api.php",
//         { params },
//       ),
//     );
//     return filterGetSmsPrices(serviceData);
//   } catch (error) {
//     console.error(
//       "Ошибка при получении статуса номеров (getSmsNumberStatus):",
//       error,
//     );
//   }
// };

export const filterGetSmsPrices = (data: GetSmsPrices) =>
  Object.entries(data).map(([country, services]) => ({
    country,
    services: Object.entries(services)
      .filter(([service, priceInfo]) => desiredServices.includes(service) && priceInfo.cost > 0)
      .map(([service, priceInfo]) => ({
        service,
        cost: Math.ceil(priceInfo.cost),
      })),
  }));


export const getSmsPrices = async (httpService: HttpService, configService: ConfigService) => {
  const params = {
    api_key: configService.get<string>("VITE_GET_SMS"),
    action: "getPrices",
  };

  try {
    const { data: serviceData } = await lastValueFrom(
      httpService.get<GetSmsPrices>("http://api.getsms.online/stubs/handler_api.php", { params })
    );
    return filterGetSmsPrices(serviceData);
  } catch (error) {
    console.error("Error fetching GetSmsPrices:", error);
    return [];
  }
};
