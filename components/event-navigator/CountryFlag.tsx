'use client';

import { Country } from '@/lib/event-navigator/types';

const flags: Record<Country, string> = {
  Canada: '\u{1F1E8}\u{1F1E6}',
  UK: '\u{1F1EC}\u{1F1E7}',
  Australia: '\u{1F1E6}\u{1F1FA}',
  'N. America': '\u{1F30E}',
};

export default function CountryFlag({ country }: { country: Country }) {
  return <span title={country}>{flags[country] || '\u{1F30D}'}</span>;
}
