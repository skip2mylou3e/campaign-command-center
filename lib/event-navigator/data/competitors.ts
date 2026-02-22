// ============================================
// Event Navigator - Competitor Data
// 20 competitors across Canada, UK, Australia
// ============================================

import { Competitor } from '../types';

export const competitors: Competitor[] = [
  // ─────────────────────────────────────────
  // CANADA
  // ─────────────────────────────────────────
  {
    name: 'Teranet/GoVeyance',
    type: 'Practice management / conveyancing software',
    markets: ['Canada'],
    threatLevel: 'HIGH',
    description: 'Practice management competitor with GoVeyance platform expanding aggressively into Ontario conveyancing market.',
    knownEventPresence: [
      {
        eventId: 'CA-5',
        role: 'Exhibitor',
        confirmed: true,
        notes: 'GoVeyance Ontario expansion',
      },
      {
        eventId: 'CA-7',
        role: 'Exhibitor',
        confirmed: true,
        notes: 'BC presence',
      },
      {
        eventId: 'CA-29',
        role: 'Exhibitor',
        confirmed: true,
        notes: 'LESA regular',
      },
      {
        eventId: 'CA-30',
        role: 'Sponsor',
        confirmed: true,
        notes: 'Ontario focus',
      },
    ],
    ownedEvents: [
      {
        name: 'GoVeyance Ontario Launch Events',
        dates: 'Throughout 2026',
        description: 'Ontario expansion events targeting real estate lawyers in key metro areas.',
        counterStrategy: 'Accelerate Unity Ontario engagement',
      },
    ],
  },
  {
    name: 'LawyerDoneDeal (LDD)',
    type: 'Real estate / conveyancing software',
    markets: ['Canada'],
    threatLevel: 'HIGH',
    description: 'RealtiWeb competitor with established presence in Ontario and Alberta legal communities.',
    knownEventPresence: [
      {
        eventId: 'CA-5',
        role: 'Exhibitor',
        confirmed: true,
        notes: 'Regular OBA presence',
      },
      {
        eventId: 'CA-29',
        role: 'Exhibitor',
        confirmed: true,
        notes: 'LESA exhibit sponsor alongside D&D',
      },
    ],
    ownedEvents: [],
  },
  {
    name: 'LawLabs/Closer',
    type: 'Conveyancing software',
    markets: ['Canada'],
    threatLevel: 'MEDIUM-HIGH',
    description: 'Conveyancing software provider with Closer platform serving Canadian legal professionals.',
    knownEventPresence: [],
    ownedEvents: [],
  },
  {
    name: 'FCT',
    type: 'Title insurance / services',
    markets: ['Canada'],
    threatLevel: 'MEDIUM',
    description: 'Title insurance and related services provider with broad presence across Canadian legal events.',
    knownEventPresence: [
      {
        eventId: 'CA-3',
        role: 'Sponsor/Speaker',
        confirmed: true,
        notes: 'Regular MPC sponsor',
      },
      {
        eventId: 'CA-5',
        role: 'Exhibitor',
        confirmed: true,
        notes: 'OBA regular',
      },
      {
        eventId: 'CA-29',
        role: 'Sponsor',
        confirmed: true,
        notes: 'LESA regular',
      },
      {
        eventId: 'CA-30',
        role: 'Major Sponsor',
        confirmed: true,
        notes: 'LSO RE Summit headline',
      },
    ],
    ownedEvents: [],
  },
  {
    name: 'Stewart Title Canada',
    type: 'Title insurance',
    markets: ['Canada'],
    threatLevel: 'MEDIUM',
    description: 'Title insurance provider with strong event sponsorship presence across Canadian provinces.',
    knownEventPresence: [
      {
        eventId: 'CA-5',
        role: 'Exhibitor/Sponsor',
        confirmed: true,
        notes: 'OBA presence',
      },
      {
        eventId: 'CA-7',
        role: 'Exhibitor',
        confirmed: true,
        notes: 'CLEBC presence',
      },
      {
        eventId: 'CA-29',
        role: 'Headline Sponsor',
        confirmed: true,
        notes: 'LESA 2024 headline',
      },
      {
        eventId: 'CA-30',
        role: 'Sponsor',
        confirmed: true,
        notes: 'LSO regular',
      },
    ],
    ownedEvents: [],
  },
  {
    name: 'LEAP Canada',
    type: 'Practice management software',
    markets: ['Canada'],
    threatLevel: 'MEDIUM',
    description: 'Practice management platform expanding into Canadian market from Australian base.',
    knownEventPresence: [
      {
        eventId: 'CA-5',
        role: 'Exhibitor',
        confirmed: true,
        notes: 'OBA Awards Gala',
      },
    ],
    ownedEvents: [],
  },
  {
    name: 'Clio',
    type: 'Practice management software',
    markets: ['N. America'],
    threatLevel: 'MEDIUM',
    description: 'Practice management platform expanding into adjacent markets with growing AI feature set.',
    knownEventPresence: [],
    ownedEvents: [
      {
        name: 'ClioCon 2026',
        dates: 'Oct 26-27',
        description: 'Annual user conference with 1,500-2,000 attendees showcasing product roadmap and partner ecosystem.',
        counterStrategy: 'Track product direction and AI features',
      },
    ],
  },

  // ─────────────────────────────────────────
  // UK
  // ─────────────────────────────────────────
  {
    name: 'Landmark Information Group',
    type: 'Property search / data',
    markets: ['UK'],
    threatLevel: 'HIGH',
    description: 'Property search and data provider with headline sponsorship at key UK conveyancing events.',
    knownEventPresence: [
      {
        eventId: 'UK-3',
        role: 'Headline Sponsor',
        confirmed: true,
        notes: 'Confirmed Headline Sponsor CA Conference 2026',
      },
      {
        eventId: 'UK-1',
        role: 'Exhibitor',
        confirmed: true,
        notes: 'BLTF regular',
      },
      {
        eventId: 'UK-22',
        role: 'Exhibitor',
        confirmed: false,
        notes: 'BCA presence likely',
      },
    ],
    ownedEvents: [],
  },
  {
    name: 'InfoTrack UK',
    type: 'Property search / legal technology',
    markets: ['UK'],
    threatLevel: 'HIGH',
    description: 'Property search and legal technology provider with strong sponsorship presence at UK industry events.',
    knownEventPresence: [
      {
        eventId: 'UK-3',
        role: 'Event Sponsor',
        confirmed: true,
        notes: 'CA Conference sponsor',
      },
      {
        eventId: 'UK-35',
        role: 'Sponsor',
        confirmed: true,
        notes: 'Risk & Compliance Conference sponsor',
      },
      {
        eventId: 'UK-1',
        role: 'Exhibitor',
        confirmed: true,
        notes: 'BLTF presence',
      },
    ],
    ownedEvents: [],
  },
  {
    name: 'PEXA UK',
    type: 'e-Conveyancing infrastructure',
    markets: ['UK'],
    threatLevel: 'HIGH',
    description: 'e-Conveyancing infrastructure provider expanding from Australian platform into UK market.',
    knownEventPresence: [
      {
        eventId: 'UK-3',
        role: 'Event Sponsor',
        confirmed: true,
        notes: 'CA Conference Event Sponsor',
      },
      {
        eventId: 'UK-4',
        role: 'Exhibitor',
        confirmed: false,
        notes: 'BLG likely presence',
      },
    ],
    ownedEvents: [],
  },
  {
    name: 'SearchFlow',
    type: 'Conveyancing search provider',
    markets: ['UK'],
    threatLevel: 'MEDIUM-HIGH',
    description: 'Conveyancing search provider and CIE co-founder with established market position.',
    knownEventPresence: [
      {
        eventId: 'UK-3',
        role: 'Exhibitor',
        confirmed: true,
        notes: 'CIE co-founder',
      },
    ],
    ownedEvents: [],
  },
  {
    name: 'Groundsure',
    type: 'Environmental search provider',
    markets: ['UK'],
    threatLevel: 'MEDIUM',
    description: 'Environmental search provider with headline sponsorship at key UK property events.',
    knownEventPresence: [
      {
        eventId: 'UK-22',
        role: 'Headline Sponsor',
        confirmed: true,
        notes: 'BCA headline sponsor',
      },
      {
        eventId: 'UK-28',
        role: 'Sponsor',
        confirmed: true,
        notes: 'IQ Legal Training sponsor',
      },
    ],
    ownedEvents: [],
  },
  {
    name: 'LEAP UK',
    type: 'Practice management software',
    markets: ['UK'],
    threatLevel: 'MEDIUM',
    description: 'Practice management platform with growing UK presence and focus on AI-driven legal tools.',
    knownEventPresence: [
      {
        eventId: 'UK-7',
        role: 'Exhibitor',
        confirmed: false,
        notes: 'LPM likely presence',
      },
    ],
    ownedEvents: [
      {
        name: 'FutureLegal Conference',
        dates: '2026 TBC',
        description: 'UK conference on AI and the future of law, showcasing LEAP UK product direction.',
        counterStrategy: 'Track LEAP UK strategy and product roadmap',
      },
    ],
  },
  {
    name: 'Thirdfort',
    type: 'ID verification / compliance',
    markets: ['UK'],
    threatLevel: 'MEDIUM',
    description: 'ID verification and compliance technology provider targeting conveyancing workflows.',
    knownEventPresence: [
      {
        eventId: 'UK-35',
        role: 'Exhibitor',
        confirmed: true,
        notes: 'Risk & Compliance presence',
      },
      {
        eventId: 'UK-3',
        role: 'Exhibitor',
        confirmed: false,
        notes: 'CA Conference likely',
      },
    ],
    ownedEvents: [],
  },

  // ─────────────────────────────────────────
  // AUSTRALIA
  // ─────────────────────────────────────────
  {
    name: 'LEAP Australia',
    type: 'Practice management software',
    markets: ['Australia'],
    threatLevel: 'VERY HIGH',
    description: 'Practice management platform with dominant market position; secured ALPMA Principal Partner replacing D&D for 2026-27.',
    knownEventPresence: [
      {
        eventId: 'AU-2',
        role: 'Principal Partner',
        confirmed: true,
        notes: 'Secured Principal Partner 2026-27 replacing D&D',
      },
      {
        eventId: 'AU-4',
        role: 'Exhibitor',
        confirmed: true,
        notes: 'QLS presence',
      },
      {
        eventId: 'AU-5',
        role: 'Exhibitor',
        confirmed: true,
        notes: 'LSNSW presence',
      },
    ],
    ownedEvents: [
      {
        name: 'LEAP AI Seminar Series',
        dates: 'Ongoing 2026',
        description: 'LawY AI demos across east coast targeting small to mid-size firms.',
        counterStrategy: 'Counter with DeeDee demos at LITFest/ALPMA',
      },
    ],
  },
  {
    name: 'InfoTrack Australia',
    type: 'Property search / AML compliance',
    markets: ['Australia'],
    threatLevel: 'VERY HIGH',
    description: 'Property search and AML compliance provider with joint LEAP partnership on national roadshows.',
    knownEventPresence: [
      {
        eventId: 'AU-4',
        role: 'Exhibitor',
        confirmed: true,
        notes: 'QLS exhibitor',
      },
      {
        eventId: 'AU-5',
        role: 'Exhibitor',
        confirmed: true,
        notes: 'LSNSW exhibitor',
      },
      {
        eventId: 'AU-1',
        role: 'Exhibitor',
        confirmed: true,
        notes: 'LITFest presence',
      },
    ],
    ownedEvents: [
      {
        name: 'National AML/CTF Roadshows with LEAP',
        dates: 'Mar 2026',
        description: 'Joint national roadshow with LEAP for AML/CTF Tranche 2 compliance education.',
        counterStrategy: 'Counter at QLS/LSNSW/LITFest/Law Society WA',
      },
    ],
  },
  {
    name: 'GlobalX Legal Solutions',
    type: 'Property / legal search',
    markets: ['Australia'],
    threatLevel: 'HIGH',
    description: 'Property and legal search provider with presence across Australian Institute of Conveyancers events.',
    knownEventPresence: [
      {
        eventId: 'AU-7',
        role: 'Exhibitor',
        confirmed: true,
        notes: 'AICSA exhibitor',
      },
      {
        eventId: 'AU-23',
        role: 'Exhibitor',
        confirmed: false,
        notes: 'AIC VIC likely',
      },
      {
        eventId: 'AU-25',
        role: 'Exhibitor',
        confirmed: false,
        notes: 'AIC National likely',
      },
    ],
    ownedEvents: [],
  },
  {
    name: 'PEXA',
    type: 'e-Settlement infrastructure',
    markets: ['Australia'],
    threatLevel: 'HIGH',
    description: 'e-Settlement infrastructure provider with dominant position in Australian property settlement ecosystem.',
    knownEventPresence: [
      {
        eventId: 'AU-7',
        role: 'Exhibitor',
        confirmed: true,
        notes: 'AICSA regular',
      },
      {
        eventId: 'AU-4',
        role: 'Exhibitor',
        confirmed: false,
        notes: 'QLS likely',
      },
      {
        eventId: 'AU-23',
        role: 'Exhibitor',
        confirmed: false,
        notes: 'AIC VIC likely',
      },
      {
        eventId: 'AU-25',
        role: 'Exhibitor',
        confirmed: false,
        notes: 'AIC National likely',
      },
    ],
    ownedEvents: [],
  },
  {
    name: 'Smokeball Australia',
    type: 'Practice management software',
    markets: ['Australia'],
    threatLevel: 'MEDIUM-HIGH',
    description: 'Practice management platform focused on small law firms with growing Australian market share.',
    knownEventPresence: [
      {
        eventId: 'AU-2',
        role: 'Exhibitor',
        confirmed: false,
        notes: 'ALPMA likely',
      },
    ],
    ownedEvents: [
      {
        name: 'Smokeball Spark',
        dates: 'Feb 2026',
        description: 'User conference with small firm focus showcasing product updates and integrations.',
        counterStrategy: 'Attend for intelligence gathering only',
      },
    ],
  },
  {
    name: 'realaml',
    type: 'AML compliance technology',
    markets: ['Australia'],
    threatLevel: 'MEDIUM',
    description: 'AML compliance technology provider entering the legal market with event partnership strategy.',
    knownEventPresence: [
      {
        eventId: 'AU-17',
        role: 'Partner',
        confirmed: true,
        notes: 'Law Biz Con partner',
      },
      {
        eventId: 'AU-2',
        role: 'Partner',
        confirmed: false,
        notes: 'ALPMA partner',
      },
    ],
    ownedEvents: [],
  },
];
