import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { lastValueFrom } from "rxjs";
import { desiredServices } from "src/data/constants/service-configs";
import { GetSmsNumberStatus } from "src/data/interfaces/country-info.interface";

export interface FilteredGetSmsNS {
  country: string;
  service: string;
  count: number;
}

// export const filterGetSmsNumberStatus = (
//   data: GetSmsNumberStatus,
//   country: string | undefined,
// ): FilteredGetSmsNS[] => {
//   const desiredServices = ["tg", "ig", "vk", "wa", "go", "vb", "ds"];
//   return Object.entries(data)
//     .filter(
//       ([key, value]) =>
//         desiredServices.includes(key.split("_0")[0]) && value > 0,
//     )
//     .map(([key, value]) => ({
//       country,
//       service: key.split("_0")[0],
//       count: value,
//     }))
//     .filter((el) => el != null);
// };

export const filterGetSmsNumberStatus = (data: GetSmsNumberStatus, country?: string) =>
  Object.entries(data)
    .filter(([key, value]) => desiredServices.includes(key.split("_0")[0]) && value > 0)
    .map(([key, value]) => ({
      country: country ?? "",
      service: key.split("_0")[0],
      count: value,
    }));


// export const getSmsNumbersStatus = async (
//   httpService: HttpService,
//   configService: ConfigService,
//   country?: string,
// ) => {
//   const params = {
//     api_key: configService.get<string>("VITE_GET_SMS"),
//     action: "getNumbersStatus",
//     ...(country && { country }),
//   };

//   try {
//     const { data: serviceData } = await lastValueFrom(
//       httpService.get<GetSmsNumberStatus>(
//         "http://api.getsms.online/stubs/handler_api.php",
//         { params },
//       ),
//     );

//     return filterGetSmsNumberStatus(serviceData, country);
//   } catch (error) {
//     console.error(
//       "Ошибка при получении статуса номеров (getSmsNumberStatus):",
//       error,
//     );
//     return [];
//   }
// };

export const getSmsNumbersStatus = async (
  httpService: HttpService,
  configService: ConfigService,
  country?: string
) => {
  const params = {
    api_key: configService.get<string>("VITE_GET_SMS"),
    action: "getNumbersStatus",
    ...(country && { country }),
  };

  try {
    const { data: serviceData } = await lastValueFrom(
      httpService.get<GetSmsNumberStatus>("http://api.getsms.online/stubs/handler_api.php", { params })
    );
    return filterGetSmsNumberStatus(serviceData, country);
  } catch (error) {
    console.error("Error fetching GetSmsNumberStatus:", error);
    return [];
  }
};
