'use client';

import { TierLabel } from '@/lib/event-navigator/types';

const tierStyles: Record<TierLabel, string> = {
  'Tier 1': 'bg-evn-tier1/20 text-evn-tier1 border-evn-tier1/30',
  'Tier 2': 'bg-evn-tier2/20 text-evn-tier2 border-evn-tier2/30',
  'Tier 3': 'bg-evn-tier3/20 text-evn-tier3 border-evn-tier3/30',
};

export default function TierBadge({ tier, small }: { tier: TierLabel; small?: boolean }) {
  return (
    <span
      className={`inline-flex items-center font-semibold border rounded-full ${tierStyles[tier]} ${
        small ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
      }`}
    >
      {tier}
    </span>
  );
}
