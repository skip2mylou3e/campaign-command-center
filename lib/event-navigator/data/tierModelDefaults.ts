import { TierModelAssumptions } from '../types';

export const tierModelDefaults: TierModelAssumptions = {
  criteria: [
    {
      id: 'core_fit',
      label: 'Core Audience Fit',
      weight: 5,
      description: 'Most important — does the audience buy D&D products?',
      anchors: {
        low: 'Wrong audience — construction, general public, academic',
        mid: 'Adjacent — RE agents, fintech, general legal profession',
        high: 'Direct buyers/users of D&D products — lawyers, conveyancers, practice managers',
      },
    },
    {
      id: 'competitive',
      label: 'Competitive Imperative',
      weight: 3,
      description: 'Must D&D be there to match competitor presence?',
      anchors: {
        low: 'No competitor presence known',
        mid: 'Competitors likely present but not confirmed',
        high: '3+ direct competitors confirmed; headline/principal sponsors',
      },
    },
    {
      id: 'track_record',
      label: 'Proven D&D Presence',
      weight: 3,
      description: 'Existing relationships reduce risk and increase ROI',
      anchors: {
        low: 'No history, brand-new territory',
        mid: 'Past attendance or confirmed interest',
        high: 'Multi-year sponsor/partner; confirmed for 2026',
      },
    },
    {
      id: 'scale_relevance',
      label: 'Scale x Relevance',
      weight: 2,
      description: 'Size matters, but only if the audience is relevant',
      anchors: {
        low: '< 100 attendees',
        mid: '300–999 attendees with relevant segments',
        high: '5,000+ attendees with meaningful relevant segments',
      },
    },
    {
      id: 'timing',
      label: 'Strategic Timing',
      weight: 2,
      description: 'Product launches, regulatory deadlines, market moments',
      anchors: {
        low: 'No particular timing relevance',
        mid: 'Standard annual relevance',
        high: 'Directly tied to product launch or regulatory deadline (e.g., Unity BC launch, AML/CTF Tranche 2)',
      },
    },
  ],
  thresholds: {
    tier1: 53,
    tier2: 38,
  },
  tierDefinitions: {
    tier1: {
      label: 'Must Attend',
      description:
        "D&D's absence would be a competitive gap. Core audience + proven presence OR flagship events in primary markets.",
      color: '#34D399',
    },
    tier2: {
      label: 'Should Evaluate',
      description:
        'Strong strategic fit. Worth attending based on budget, timing, and regional priorities. Good ROI potential.',
      color: '#FBBF24',
    },
    tier3: {
      label: 'Opportunistic',
      description:
        'Adjacent audiences, brand-building, intelligence gathering. Attend selectively based on available budget.',
      color: '#9CA3AF',
    },
  },
};
