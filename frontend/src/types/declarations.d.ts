declare module 'country-list' {
  export function getNames(): string[];
  export function getCode(name: string): string | undefined;
  export function getName(code: string): string | undefined;
}

declare module 'country-to-currency' {
  const countryToCurrency: { [key: string]: string };
  export default countryToCurrency;
}
