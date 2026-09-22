export type CountryOption = {
  code: string;
  name: string;
  capital: string;
  region: string;
  incomeLevel: string;
};

export type CountrySearchResponse = {
  results: CountryOption[];
};

export type ApiErrorResponse = {
  error: string;
};
