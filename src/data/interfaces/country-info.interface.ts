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

export interface SmsManData {
  [service: string]: {
    cost: number;
    count: number;
  };
}
