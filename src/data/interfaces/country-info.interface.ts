export interface CountryInfo {
  [country: string]: {
    [service: string]: {
      cost: number;
      count: number;
    };
  };
}

export interface Country5SIMInfo {
  [country: string]: {
    [service: string]: {
      [operator: string]: {
        cost: number;
        count: number;
        rate?: number;
      };
    };
  };
}

export interface IronSimData {
  status_code: number;
  success: boolean;
  message: string;
  data: {
    id: number;
    name: string;
    price: number;
  }[];
}

export interface SmsManData {
  [service: string]: {
    cost: number;
    count: number;
  };
}

export interface GetSmsNumberStatus {
  [serviceCode: `${string}_0`]: number;
}

export interface GetSmsPrices {
  [country: string]: {
    [service: string]: {
      cost: number;
    };
  };
}

export interface GetSmsData {
  [countryCode: string]: {
    [service: string]: {
      cost: number;
    };
  };
}

export interface SmsakData {
  id: string;
  logo: string;
  name: string;
  count: number;
  cost: number;
  all: string;
}

export interface OnlineSimData {
  response: string;
  countries: {
    [countryId: string]: {
      name: string;
      original: string;
      code: number;
      pos: number;
      other: boolean;
      new: boolean;
      enable: boolean;
    };
  };
  services: {
    [serviceCode: string]: {
      id: number;
      count: number;
      price: string;
      service: string;
      slug: string;
    };
  };
  favorite_countries: any;
  favorite_services: any[];
  page: number;
  country: number;
  filter: string;
  subscription_tariffs: any[];
  end: boolean;
  favorites: any;
}
