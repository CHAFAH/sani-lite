import { countries } from "country-codes-flags-phone-codes";

export interface Country {
  name: string;
  code: string;
  flag: string;
  phone: string;
  alpha3: string;
  taxRate?: number; // Top marginal income tax rate (%)
  isSchengen?: boolean;
  currency?: string;
}

// Schengen countries with accurate 2026 tax rates
const SCHENGEN_TAX_RATES: Record<string, { taxRate: number; currency: string }> = {
  AT: { taxRate: 55, currency: "EUR" }, // Austria
  BE: { taxRate: 50, currency: "EUR" }, // Belgium
  BG: { taxRate: 10, currency: "BGN" }, // Bulgaria
  HR: { taxRate: 37.28, currency: "HRK" }, // Croatia
  CY: { taxRate: 0, currency: "EUR" }, // Cyprus (participates but controls not abolished)
  CZ: { taxRate: 23, currency: "CZK" }, // Czech Republic
  DK: { taxRate: 60.5, currency: "DKK" }, // Denmark (highest)
  EE: { taxRate: 22, currency: "EUR" }, // Estonia
  FI: { taxRate: 45, currency: "EUR" }, // Finland
  FR: { taxRate: 55.4, currency: "EUR" }, // France
  DE: { taxRate: 47.5, currency: "EUR" }, // Germany
  GR: { taxRate: 44, currency: "EUR" }, // Greece
  HU: { taxRate: 15, currency: "HUF" }, // Hungary (lowest EU)
  IT: { taxRate: 43, currency: "EUR" }, // Italy
  LV: { taxRate: 31.4, currency: "EUR" }, // Latvia
  LT: { taxRate: 32, currency: "EUR" }, // Lithuania
  LU: { taxRate: 45, currency: "EUR" }, // Luxembourg
  MT: { taxRate: 35, currency: "EUR" }, // Malta
  NL: { taxRate: 49.5, currency: "EUR" }, // Netherlands
  PL: { taxRate: 32, currency: "PLN" }, // Poland
  PT: { taxRate: 48, currency: "EUR" }, // Portugal
  RO: { taxRate: 10, currency: "RON" }, // Romania
  SK: { taxRate: 35, currency: "EUR" }, // Slovakia
  SI: { taxRate: 50, currency: "EUR" }, // Slovenia
  ES: { taxRate: 54, currency: "EUR" }, // Spain
  IS: { taxRate: 46.24, currency: "ISK" }, // Iceland (non-EU)
  LI: { taxRate: 20, currency: "CHF" }, // Liechtenstein (non-EU)
  NO: { taxRate: 22, currency: "NOK" }, // Norway (non-EU)
  CH: { taxRate: 11.5, currency: "CHF" }, // Switzerland (non-EU, federal rate)
};

// Convert the country data to our format with Schengen info
export const COUNTRIES: Country[] = countries
  .map((country: any) => {
    const schengenData = SCHENGEN_TAX_RATES[country.code];
    return {
      name: country.name,
      code: country.code,
      flag: country.flag,
      phone: country.phone || "",
      alpha3: country.alpha3 || "",
      isSchengen: !!schengenData,
      taxRate: schengenData?.taxRate,
      currency: schengenData?.currency,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

// Create a map for quick lookup by code
export const COUNTRY_MAP = new Map(COUNTRIES.map((c) => [c.code, c]));

// Get Schengen countries only
export function getSchengenCountries(): Country[] {
  return COUNTRIES.filter((c) => c.isSchengen);
}

// Get country by code
export function getCountry(code: string): Country | undefined {
  return COUNTRY_MAP.get(code);
}

// Get country by name
export function getCountryByName(name: string): Country | undefined {
  return COUNTRIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

// Get all country names
export function getCountryNames(): string[] {
  return COUNTRIES.map((c) => c.name);
}

// Get all Schengen country names
export function getSchengenCountryNames(): string[] {
  return getSchengenCountries().map((c) => c.name);
}

// Get all country codes
export function getCountryCodes(): string[] {
  return COUNTRIES.map((c) => c.code);
}

// Get tax rate for a country
export function getTaxRate(countryCode: string): number | undefined {
  return getCountry(countryCode)?.taxRate;
}

// Get currency for a country
export function getCurrency(countryCode: string): string | undefined {
  return getCountry(countryCode)?.currency;
}

// Format country with flag for display
export function formatCountryWithFlag(country: Country | undefined): string {
  if (!country) return "";
  return `${country.flag} ${country.name}`;
}

// Format country with flag and code
export function formatCountryWithFlagAndCode(
  country: Country | undefined
): string {
  if (!country) return "";
  return `${country.flag} ${country.name} (+${country.phone})`;
}

// Format country with flag and tax rate
export function formatCountryWithTaxRate(country: Country | undefined): string {
  if (!country) return "";
  const taxInfo = country.taxRate !== undefined ? ` - ${country.taxRate}% tax` : "";
  return `${country.flag} ${country.name}${taxInfo}`;
}

// Format country with flag, tax rate, and currency
export function formatCountryWithTaxAndCurrency(
  country: Country | undefined
): string {
  if (!country) return "";
  const taxInfo =
    country.taxRate !== undefined ? ` (${country.taxRate}% tax, ${country.currency})` : "";
  return `${country.flag} ${country.name}${taxInfo}`;
}
