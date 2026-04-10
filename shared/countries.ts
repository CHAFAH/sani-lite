import { countries } from "country-codes-flags-phone-codes";

export interface Country {
  name: string;
  code: string;
  flag: string;
  phone: string;
  alpha3: string;
}

// Convert the country data to our format
export const COUNTRIES: Country[] = countries
  .map((country: any) => ({
    name: country.name,
    code: country.code,
    flag: country.flag,
    phone: country.phone || "",
    alpha3: country.alpha3 || "",
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

// Create a map for quick lookup by code
export const COUNTRY_MAP = new Map(COUNTRIES.map((c) => [c.code, c]));

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

// Get all country codes
export function getCountryCodes(): string[] {
  return COUNTRIES.map((c) => c.code);
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
