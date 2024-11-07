export interface CountryInfo {
  [country: string]: {
    [service: string]: {
      cost: number;
      count: number;
    };
  };
}
