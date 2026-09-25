import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatCurrency',
  standalone: true,
})
export class FormatCurrencyPipe implements PipeTransform {
  transform(
    value: number | string | null | undefined,
    currency = 'VND',
    locale = 'vi-VN',
  ): string {
    if (value === null || value === undefined || value === '') return '';
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue)) return String(value);

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(numericValue);
  }
}
