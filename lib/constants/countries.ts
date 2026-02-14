import { countries } from "countries-list";

/**
 * Dynamically generated country list from types-list package.
 * Sorted alphabetically by country name.
 * Format: { label: string, value: string }
 */
export const COUNTRIES = Object.values(countries)
  .map((country) => ({
    label: country.name,
    value: country.name,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));
